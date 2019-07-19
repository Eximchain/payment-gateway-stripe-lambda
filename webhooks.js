const { stripeKey, targetSnsARN, failedPaymentWebhookId } = require('./env');
const { publishPaymentFailure } = require('./services/sns');
const stripe = require('stripe')(stripeKey)
import { response } from './api';

async function handleFailedPayment(event) {
  let stripe_event;
  try {
    if (event.body == null) {
      throw new Error("malformed body");
    }
    if (!event.headers || !event.headers['Stripe-Signature']) {
      throw new Error("Missing Stripe Signature header.");
    } else {
      stripe_event = await stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], failedPaymentWebhookId)
    }
  
    if (stripe_event.type !== 'invoice.payment_failed'){
      throw new Error(`Received a notification for unknown Stripe event ${stripe_event.type} .`)
    }

    const invoice = stripe_event.data.object;
    const { customer_email } = invoice;
    let notificationId = await publishPaymentFailure(customer_email);
    return response({
      message : `Dappbot successfully notified of lapsed payment for ${customer_email}.`,
      notificationId
    })
  } catch (err) {
    return response({ err })
  }

}

module.exports = {
  failedPayment: handleFailedPayment
}