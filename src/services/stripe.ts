import { stripeKey, stripeWebhookSecret } from '../env';
import Stripe from 'stripe';
import keyBy from 'lodash.keyby';
export const stripe = new Stripe(stripeKey);

// Extracting types we need here & elsewhere into
// more convenient names.
export type Customer = Stripe.customers.ICustomer;
export type Subscription = Stripe.subscriptions.ISubscription;
export type SubscriptionUpdateItem = Stripe.subscriptions.ISubscriptionUpdateItem;
export type SubscriptionCreateItem = Stripe.subscriptions.ISubscriptionCreationItem;
export type SubscriptionItem = Stripe.subscriptionItems.ISubscriptionItem;
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

///////////////////////////////////////////////////
////                 KEY METHODS
///////////////////////////////////////////////////

async function createCustomerAndSubscription({ name, email, token, plans, coupon }:CreateStripeArgs) {
  const newCustomer = await stripe.customers.create({ 
    name, email, 
    description: `Customer for ${email}`,
    source: token 
  });
  const subItems:SubscriptionCreateItem[] = [];
  Object.keys(plans).forEach(plan => {
    let quantity = plans[plan as StripePlanNames];
    if (quantity > 0) {
      subItems.push({ plan, quantity })
    }
  })
  const newSub = await stripe.subscriptions.create({
    customer: newCustomer.id,
    items: subItems,
    trial_period_days: 7
  })
  return {
    customer: newCustomer,
    subscription: newSub
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

///////////////////////////////////////////////////
////                 CUSTOMERS
///////////////////////////////////////////////////

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

///////////////////////////////////////////////////
////               SUBSCRIPTIONS
///////////////////////////////////////////////////

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
  const currentItems = subscription.items.data.slice();
  const items:SubscriptionUpdateItem[] = [];
  const currentByPlan = keyBy(currentItems, item => item.plan.id)
  Object.keys(newPlans).forEach((planId) => {
    let newQuantity = newPlans[planId as StripePlanNames];
    let currentItem = currentByPlan[planId];
    if (newQuantity === 0) {
      if (currentItem) items.push({
        id : currentItem.id,
        deleted : true
      })
    } else {
      items.push(currentItem ? {
        id : currentItem.id,
        plan : planId,
        quantity : newQuantity
      } : {
        plan : planId,
        quantity : newQuantity
      })
    }
  })
  return await stripe.subscriptions.update(subscription.id, {
    items: items
  })
}


///////////////////////////////////////////////////
////                  INVOICES
///////////////////////////////////////////////////
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
  if (invoices.data.length === 0) {
    return null;
  }
  const latestInvoice = invoices.data[0];
  if (latestInvoice.attempted && !latestInvoice.paid) {
    return latestInvoice;
  } else {
    console.log('Latest invoice does not hit requirements of attempted but not paid.');
    return null;
  }
}

///////////////////////////////////////////////////
////                  HELPERS
///////////////////////////////////////////////////

function buildSubscriptionItems(plans:StripePlans, currentItems?:SubscriptionItem[]){

  // We're rebuilding the item list for an existing subscription
  if (currentItems) {
    const items:SubscriptionUpdateItem[] = [];
    const currentByPlan = keyBy(currentItems, item => item.plan.id)
    Object.keys(plans).forEach((planId) => {
      let newQuantity = plans[planId as StripePlanNames];
      let currentItem = currentByPlan[planId];
      if (newQuantity === 0) {
        if (currentItem) items.push({
          id : currentItem.id,
          deleted : true
        })
      } else {
        items.push(currentItem ? {
          id : currentItem.id,
          plan : planId,
          quantity : newQuantity
        } : {
          plan : planId,
          quantity : newQuantity
        })
      }
    })
    return items;
  // We're buliding a new subscription item list 
  } else {
    const items:SubscriptionCreateItem[] = [];
    Object.keys(plans).forEach(plan => {
      let quantity = plans[plan as StripePlanNames];
      if (plans[plan as StripePlanNames] > 0) {
        items.push({ plan, quantity })
      }
    })
    return items;
  }
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