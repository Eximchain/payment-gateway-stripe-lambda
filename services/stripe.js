const { stripeKey, PLAN_IDS } = require('../env');
export const stripe = require("stripe")(stripeKey);

export async function createCustomerAndSubscription({ name, email, token, numDapps, coupon }){
  const newCustomer = await stripe.customers.create({ name, email, source: token });
  const newSub = await stripe.subscriptions.create({
    customer : newCustomer.id,
    items : [
      {
        plan : PLAN_IDS.PROJECT,
        quantity : numDapps,
        coupon : coupon ? coupon : null
      }
    ]
  })
  return {
    customer : newCustomer,
    subscription : newSub
  }
}