import { stripeKey, PLAN_IDS } from '../env';
import Stripe from 'stripe';
export const stripe = new Stripe(stripeKey);

// Extracting types we need here & elsewhere into
// more convenient names.
export type Customer = Stripe.customers.ICustomer;
export type Subscription = Stripe.subscriptions.ISubscription;
export type Invoice = Stripe.invoices.IInvoice;

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

export interface CreateStripeArgs {
  name: string
  email: string
  token: string
  plans: StripePlan[]
  coupon?: string
}
async function createCustomerAndSubscription({ name, email, token, plans, coupon }:CreateStripeArgs) {
  const newCustomer = await stripe.customers.create({ 
    name, email, 
    description: `Customer for ${email}`,
    source: token 
  });
  const newSub = await stripe.subscriptions.create({
    customer: newCustomer.id,
    items: plans.map((planObj) => {
      const planType = Object.keys(planObj)[0];
      return {
        plan: planType,
        quantity: planObj[planType]
      }
    })
  })
  return {
    customer: newCustomer,
    subscription: newSub
  }
}

async function updateStripeSubscription(email:string, newPlans:StripePlan[]) {
  const subscription = await getStripeSubscriptionByEmail(email);
  if (!subscription){
    throw new Error(`Unable to update subscription for email ${email}, no subscriptions exist.`);
  }
  return await stripe.subscriptions.update(subscription.id, {
    items: newPlans.map((planObj) => {
      const planType = Object.keys(planObj)[0];
      return {
        plan: planType,
        quantity: planObj[planType]
      }
    })
  })
}

async function updateCustomerPayment(email: string, paymentToken:string){
  //TODO: implement update customer payment
}

async function getStripeCustomer(email:string) {
  const matchingList = await stripe.customers.list({ email })

  if (matchingList.data.length === 0) {
    return null;
  } else if (matchingList.data.length > 1) {
    throw new Error(`Two customers listed for ${email}, must be an error!`);
  }

  return matchingList.data[0];
}

async function getStripeSubscription(stripeCustomerId:string) {
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

async function getStripeSubscriptionByEmail(email:string) {
  const customer = await getStripeCustomer(email);
  if (!customer){
    return null;
  }
  return await getStripeSubscription(customer.id);
}

async function cancelStripeSubscription(email:string) {
  const subscription = await getStripeSubscriptionByEmail(email);
  if (!subscription){
    throw new Error(`Unable to cancel subscription for ${email}, no subscription exists.`)
  }
  return await stripe.subscriptions.del(subscription.id)
}

async function getStripeData(email:string) {
  let customer, subscription;
  customer = await getStripeCustomer(email);
  if (customer){
    subscription = await getStripeSubscription(customer.id);
  }
  return { customer, subscription };
}

export default {
  create: createCustomerAndSubscription,
  update: updateStripeSubscription,
  cancel: cancelStripeSubscription,
  read: getStripeData,
  stripe
}