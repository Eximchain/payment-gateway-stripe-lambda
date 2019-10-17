import { stripeKey, stripeWebhookSecret } from '../env';
import { SignUp, StripePlans } from '@eximchain/dappbot-types/spec/methods/payment'; 
import { UserError } from '../validate';
import Stripe from 'stripe';
import keyBy from 'lodash.keyby';
export const stripe = new Stripe(stripeKey);

///////////////////////////////////////////////////
////                 KEY METHODS
///////////////////////////////////////////////////

type SubscriptionCreateItem = Stripe.subscriptions.ISubscriptionCreationItem;
async function createCustomerAndSubscription({ name, email, token, plans, coupon }:SignUp.Args) {
  const newCustomer = await stripe.customers.create({ 
    name, email, 
    description: `Customer for ${email}`,
    source: token 
  });
  const subItems:SubscriptionCreateItem[] = [];
  Object.keys(plans).forEach(plan => {
    let quantity = plans[plan as keyof StripePlans];
    if (quantity > 0) {
      subItems.push({ plan, quantity })
    }
  })
  const newSub = await stripe.subscriptions.create({
    customer: newCustomer.id,
    items: subItems,
    trial_period_days: 14
  })
  return {
    customer: newCustomer,
    subscription: newSub
  }
}

async function getStripeData(email:string) {
  let customer, subscription, invoice;
  customer = await getStripeCustomer(email);
  if (customer){
    subscription = await getStripeSubscriptionByCustomerId(customer.id);
    const failedInvoice = await getUnpaidInvoice(customer.id);
    if (failedInvoice) {
      invoice = failedInvoice;
    } else {
      invoice = await getUpcomingInvoice(customer.id);
    }
  } else {
    subscription = null;
    invoice = null;
  }
  return { customer, subscription, invoice };
}

///////////////////////////////////////////////////
////                 CUSTOMERS
///////////////////////////////////////////////////

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

type SubscriptionUpdateItem = Stripe.subscriptions.ISubscriptionUpdateItem;
async function updateStripeSubscription(email:string, newPlans:StripePlans) {
  const { customer, subscription} = await getStripeData(email);
  if (!customer){
    throw new Error(`Unable to update subscription for ${email}, no customer exist.`);
  }
  if (!subscription){
    throw new Error(`Unable to update subscription for ${email}, no subscription exist.`);
  }
  if (subscription.status === 'trialing' && customer.default_source === null){
    throw new UserError("You cannot modify your dapp count without a saved payment method.");
  }
  const currentItems = subscription.items.data.slice();
  const items:SubscriptionUpdateItem[] = [];
  const currentByPlan = keyBy(currentItems, item => item.plan.id)
  Object.keys(newPlans).forEach((planId) => {
    let newQuantity = newPlans[planId as keyof StripePlans];
    let currentItem = currentByPlan[planId];
    if (newQuantity === 0) {
      if (currentItem) items.push({
        id : currentItem.id,
        deleted : true
      })
    } else {
      let newItem:SubscriptionUpdateItem = {
        plan : planId,
        quantity : newQuantity
      }
      console.log(`Subscribing ${email} to plan ${newItem}`);
      if (currentItem) newItem.id = currentItem.id;
      console.log(newItem);
      items.push(newItem)
    }
  })
  return await stripe.subscriptions.update(subscription.id, { items })
    .then((updatedSubscription)=>{
      // If they've already added a card but are still trialing,
      // updating their dapp count immediately ends their trial.
      // Doing it in this then ensures that the update is complete
      // before we end their trial and they get invoiced.
      if (updatedSubscription.status === 'trialing') {
        return stripe.subscriptions.update(subscription.id, {
          trial_end: 'now'
        })
      } else {
        return updatedSubscription;
      }
  })
}

///////////////////////////////////////////////////
////                  INVOICES
///////////////////////////////////////////////////

/**
 * Given a customerId, uses getUnpaidInvoice to
 * attempt payment on a failed invoice, returning
 * the invoice after the updating.  If there is
 * no unpaid invoice, returns null.
 * 
 * @param customerId 
 */
async function retryLatestUnpaid(customerId:string){
  const latestInvoice = await getUnpaidInvoice(customerId);
  if (latestInvoice){
    return await stripe.invoices.pay(latestInvoice.id);
  } else {
    return null;
  }
}

/**
 * Given a customerId, returns their unpaid invoice.
 * If they do not have an invoice which has been
 * attempted but not paid, it returns null.
 * 
 * @param customerId 
 */
async function getUnpaidInvoice(customerId:string){
  const invoices = await stripe.invoices.list({
    customer : customerId
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

/**
 * Given a customerId, return their upcoming invoice.
 * Automatically includes up to 100 of the underlying
 * line items.
 * 
 * TODO: What does this do when they have been moved
 * to not making anymore invoices?
 * 
 * @param customerId 
 */
async function getUpcomingInvoice(customerId:string){
  const upcomingInvoice = await stripe.invoices.retrieveUpcoming(customerId);
  const fullLineItems = await stripe.invoices.listUpcomingLineItems({
    customer : customerId,
    limit : 100
  });
  upcomingInvoice.lines.data = fullLineItems.data;
  return upcomingInvoice;
}

///////////////////////////////////////////////////
////                  HELPERS
///////////////////////////////////////////////////

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