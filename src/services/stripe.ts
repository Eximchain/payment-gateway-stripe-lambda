const { stripeKey, PLAN_IDS } = require('../env');
export const stripe = require("stripe")(stripeKey);

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

async function getStripeCustomer(email:string) {
  const matchingList = await stripe.customers.list({ email })

  if (matchingList.data.length === 0) {
    return null;
  } else if (matchingList.data.length > 1) {
    throw new Error("Two customers with same email!");
  }

  return matchingList.data[0];
}

async function getStripeSubscription(stripeCustomerId:string) {
  const matchingList = await stripe.subscriptions.retrieve({
    customer: stripeCustomerId
  });

  if (matchingList.data.length === 0) {
    return null;
  } else if (matchingList.data.length > 1) {
    throw new Error("Customer has more than one subscription, sign of an error.");
  }

  return matchingList.data[0];
}

async function getStripeSubscriptionByEmail(email:string) {
  const customer = await getStripeCustomer(email);
  return await getStripeSubscription(customer.id);
}

async function cancelStripeSubscription(email:string) {
  const subscription = await getStripeSubscriptionByEmail(email);
  return await stripe.subscriptions.del(subscription.id)
}

async function getStripeData(email:string) {
  const customer = await getStripeCustomer(email);
  const subscription = await getStripeSubscription(customer.id);
  return { customer, subscription };
}

export default {
  create: createCustomerAndSubscription,
  update: updateStripeSubscription,
  cancel: cancelStripeSubscription,
  read: getStripeData,
  stripe
}