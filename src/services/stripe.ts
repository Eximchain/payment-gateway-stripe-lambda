import { stripeKey, stripeWebhookSecret } from '../env';
import Stripe from 'stripe';
export const stripe = new Stripe(stripeKey);

// Extracting types we need here & elsewhere into
// more convenient names.
export type Customer = Stripe.customers.ICustomer;
export type Subscription = Stripe.subscriptions.ISubscription;
export type Invoice = Stripe.invoices.IInvoice;
export type WebhookEvent = Stripe.events.IEvent;

export type SubscriptionStateType = Stripe.subscriptions.SubscriptionStatus;
export enum SubscriptionStates {
  trial = 'trialing',
  active = 'active',
  canceled = 'canceled',
  unpaid = 'unpaid',
  incomplete = 'incomplete',
  incompleteExpired = 'incomplete_expired',
  pastDue = 'past_due'
}
export const ValidSubscriptionStates:SubscriptionStateType[] = [SubscriptionStates.trial, SubscriptionStates.active];

export interface StripePlan {
  [key:string] : number
}


export interface StripePlans {
  standard : number
  professional : number
  enterprise : number
}

export type StripePlanNames = keyof StripePlans;

export interface CreateStripeArgs {
  name: string
  email: string
  token: string
  plans: StripePlans
  coupon?: string
}

function buildSubscriptionItems(plans:StripePlans){
  const items = [];
  if (plans.standard > 0) {
    items.push({ plan : 'standard', quantity : plans.standard })
  }
  if (plans.professional > 0) {
    items.push({ plan : 'professional', quantity : plans.professional })
  }
  if (plans.enterprise > 0) {
    items.push({ plan : 'enterprise', quantity : plans.enterprise })
  }
  return items;
}

async function createCustomerAndSubscription({ name, email, token, plans, coupon }:CreateStripeArgs) {
  const newCustomer = await stripe.customers.create({ 
    name, email, 
    description: `Customer for ${email}`,
    source: token 
  });

  const newSub = await stripe.subscriptions.create({
    customer: newCustomer.id,
    items: buildSubscriptionItems(plans),
    trial_period_days: 7
  })
  return {
    customer: newCustomer,
    subscription: newSub
  }
}

export async function getStripeCustomerById(customerId:string) {
  return await stripe.customers.retrieve(customerId, {
    expand : ['default_source']
  })
}

async function updateCustomerPayment(email: string, paymentToken:string){
  const customer = await getStripeCustomer(email)
  if(customer === null){
    throw new Error( `A customer does not exist for email ${email} in stripe`)
  }
  return await stripe.customers.update(customer.id, {source:paymentToken})

}

async function getStripeCustomer(email:string) {
  const matchingList = await stripe.customers.list({ email })

  if (matchingList.data.length === 0) {
    return null;
  } else if (matchingList.data.length > 1) {
    throw new Error(`Two customers listed for ${email}, must be an error!`);
  }
  
  // Performing additional retrieve allows us to expand
  // the source_data on the customer object.
  const customerId = matchingList.data[0].id;
  return await stripe.customers.retrieve(customerId, {
    expand : ['default_source']
  })
}

async function getStripeSubscriptionByCustomerId(stripeCustomerId:string) {
  const matchingList = await stripe.subscriptions.list({
    customer: stripeCustomerId
  });

  if (matchingList.data.length === 0) {
    return null;
  } else if (matchingList.data.length > 1) {
    throw new Error(`Multiple subscriptions listed for Stripe Customer ${stripeCustomerId}, must be an error!.`);
  }

  return matchingList.data[0];
}

async function getStripeSubscription(email:string) {
  const customer = await getStripeCustomer(email);
  if (!customer){
    return null;
  }
  return await getStripeSubscriptionByCustomerId(customer.id);
}

async function cancelStripeSubscription(email:string) {
  const subscription = await getStripeSubscription(email);
  if (!subscription){
    throw new Error(`Unable to cancel subscription for ${email}, no subscription exists.`)
  }
  return await stripe.subscriptions.del(subscription.id)
}

async function updateStripeSubscription(email:string, newPlans:StripePlans) {
  const subscription = await getStripeSubscription(email);
  if (!subscription){
    throw new Error(`Unable to update subscription for email ${email}, no subscriptions exist.`);
  }
  return await stripe.subscriptions.update(subscription.id, {
    items: buildSubscriptionItems(newPlans)
  })
}

async function retryLatestUnpaid(email:string){
  const latestInvoice = await getUnpaidInvoiceIfExists(email);
  if (latestInvoice){
    return await retryInvoiceById(latestInvoice.id);
  } else {
    return null;
  }
}

async function retryInvoiceById(invoiceId:string){
  return await stripe.invoices.pay(invoiceId);
}

async function getUnpaidInvoiceIfExists(email:string){
  const customer = await getStripeCustomer(email);
  if (!customer) return null;
  const invoices = await stripe.invoices.list({
    customer : customer.id
  });
  if (invoices.data.length === 0) return null;
  const latestInvoice = invoices.data[0];
  if (latestInvoice.attempted && !latestInvoice.paid) {
    return latestInvoice;
  } else {
    return null;
  }
}

async function getStripeData(email:string) {
  let customer, subscription;
  customer = await getStripeCustomer(email);
  if (customer){
    subscription = await getStripeSubscriptionByCustomerId(customer.id);
  }
  return { customer, subscription };
}

async function isTokenValid(tokenId:string | undefined) {
  if (typeof tokenId !== 'string') return false;
  try {
    const tokenData = await stripe.tokens.retrieve(tokenId);
    return !tokenData.used;
  } catch (err) {
    // Retrieve throws if this isn't a valid token.
    return false;
  }
}

async function decodeWebhook(webhookBody:string, signature:string|string[]){
  return await stripe.webhooks.constructEvent(webhookBody, signature, stripeWebhookSecret);
}

export enum WebhookEventTypes {
  failedPayment = 'invoice.payment_failed',
  successfulPayment = 'invoice.payment_succeeded',
  trialEnding = 'customer.subscription.trial_will_end'
}

export default {
  create: createCustomerAndSubscription,
  updateSubscription: updateStripeSubscription,
  updatePayment: updateCustomerPayment,
  cancel: cancelStripeSubscription,
  read: getStripeData,
  isTokenValid, stripe, decodeWebhook,
  retryLatestUnpaid
}