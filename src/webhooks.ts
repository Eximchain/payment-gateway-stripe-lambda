import { Invoice, WebhookEvent, Subscription, getStripeCustomerById } from './services/stripe';
import { sendTrialEndEmail } from './services/sendgrid';
import { publishPaymentFailure, publishPaymentSuccess } from './services/sns';
import { response } from './api';

export async function handleFailedPayment(event:WebhookEvent) {
  const invoice = event.data.object as Invoice;
  const { customer_email } = invoice;
  let notificationId = await publishPaymentFailure(customer_email);
  return response({
    message : `Dappbot notified of ${customer_email}'s failed payment.`,
    notificationId
  })
}

export async function handleSuccessfulPayment(event:WebhookEvent) {
  const invoice = event.data.object as Invoice;
  const { customer_email } = invoice;
  let notificationId = await publishPaymentSuccess(customer_email);
  return response({
    message : `Dappbot notified of ${customer_email}'s successful payment.`,
    notificationId
  })
}

export async function handleTrialEnding(event:WebhookEvent) {
  const subscription = event.data.object as Subscription;
  const customer = await getStripeCustomerById(subscription.customer as string);
  console.log('Found customer in handleTrialEnding: ',customer);
  const { email } = customer;
  const emailReceipt = await sendTrialEndEmail(email as string);
  console.log('Email receipt from Sendgrid: ',emailReceipt);
  return response({ message : `Acknowledged end of trial for ${email}` })
}

export default {
  failedPayment: handleFailedPayment,
  successfulPayment: handleSuccessfulPayment,
  trialEnding : handleTrialEnding
}