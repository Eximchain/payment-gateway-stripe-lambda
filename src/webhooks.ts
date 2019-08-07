import { stripe, Invoice, WebhookEvent, Subscription, getStripeCustomerById } from './services/stripe';
import { APIGatewayEvent } from './gateway-event-type';
import { publishPaymentFailure } from './services/sns';
import { response } from './api';

export async function handleFailedPayment(event:WebhookEvent) {
  const invoice = event.data.object as Invoice;
  const { customer_email } = invoice;
  let notificationId = await publishPaymentFailure(customer_email);
  return response({
    message : `Dappbot successfully notified of lapsed payment for ${customer_email}.`,
    notificationId
  })
}

export async function handleTrialEnding(event:WebhookEvent) {
  const subscription = event.data.object as Subscription;
  const customer = await getStripeCustomerById(subscription.customer as string);
  const { email, name } = customer;
  // TODO: Build & send email HTML
  return response({ message : `Acknowledged end of trial for ${email}` })
}

export default {
  failedPayment: handleFailedPayment,
  trialEnding : handleFailedPayment
}