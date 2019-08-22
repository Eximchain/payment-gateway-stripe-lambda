import { successResponse } from './responses';
import { Invoice, WebhookEvent, Subscription, getStripeCustomerById } from './services/stripe';
import { sendTrialEndEmail, sendExtendedTrailEndEmail } from './services/sendgrid';
import { publishPaymentFailure, publishPaymentSuccess } from './services/sns';
import { Webhook } from 'aws-sdk/clients/codebuild';

export async function handleFailedPayment(event:WebhookEvent) {
  const invoice = event.data.object as Invoice;
  const { customer_email } = invoice;
  let msg = `Dappbot notified of ${customer_email}'s failed payment.`;
  console.log(msg);
  let notificationId = await publishPaymentFailure(customer_email);
  return successResponse({
    message : msg,
    notificationId
  })
}

export async function handleSuccessfulPayment(event:WebhookEvent) {
  const invoice = event.data.object as Invoice;
  const { customer_email } = invoice;
  let msg = `Dappbot notified of ${customer_email}'s successful payment.`;
  console.log(msg)
  let notificationId = await publishPaymentSuccess(customer_email);
  return successResponse({
    message : msg,
    notificationId
  })
}

export async function handleTrialEnding(event:WebhookEvent) {
  const subscription = event.data.object as Subscription;
  const customer = await getStripeCustomerById(subscription.customer as string);
  const { email } = customer;
  let msg = `DappBot notified of ${email}'s trial ending.`
  console.log(msg);
  const emailReceipt = await sendTrialEndEmail(email as string);
  console.log('Email receipt from Sendgrid: ',emailReceipt);
  return successResponse({ message :  msg })
}

export async function handleExtendedTrialEnding(event:WebhookEvent) {
  const subscription = event.data.object as Subscription
  const customer = await getStripeCustomerById(subscription.customer as string);
  const { email } = customer
  console.log(`Dappbot notified of ${email}'s extended trial is ending.`)
  const emailReceipt = await sendExtendedTrailEndEmail(email as string)

}

export default {
  failedPayment: handleFailedPayment,
  successfulPayment: handleSuccessfulPayment,
  trialEnding : handleTrialEnding
}