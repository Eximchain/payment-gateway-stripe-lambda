import { stripe } from './services/stripe';
import { stripeWebhookSecret } from './env';
import { APIGatewayEvent } from './gateway-event-type';
import { publishPaymentFailure } from './services/sns';
import { response } from './api';

export async function handleFailedPayment(event:APIGatewayEvent) {
  let stripe_event;
  console.log('Received webhook request: ',event);
  try {
    if (event.body == null) {
      throw new Error("malformed body");
    }
    if (!event.headers || !event.headers['Stripe-Signature']) {
      throw new Error("Missing Stripe Signature header.");
    } else {
      stripe_event = await stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], stripeWebhookSecret);
      console.log('Parsed stripe_event: ',stripe_event);
    }
  
    if (stripe_event.type !== 'invoice.payment_failed'){
      throw new Error(`Received a notification for unknown Stripe event ${stripe_event.type} .`)
    }

    const invoice = stripe_event.data.object;
    const { customer_email } = invoice;
    let notificationId = await publishPaymentFailure(customer_email);
    console.log('Published payment failure');
    return response({
      message : `Dappbot successfully notified of lapsed payment for ${customer_email}.`,
      notificationId
    })
  } catch (err) {
    return response({
      err: err.toString(),
      ...err
    })
  }

}

export default {
  failedPayment: handleFailedPayment
}