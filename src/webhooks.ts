import { successResponse } from './responses';
import { Invoice, WebhookEvent, Subscription, getStripeCustomerById } from './services/stripe';
import { sendTrialEndEmail } from './services/sendgrid';
import { publishPaymentFailure, publishPaymentSuccess } from './services/sns';
import { Webhook } from 'aws-sdk/clients/codebuild';
import { extendedTrialEndEmail } from './emails';

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
  //TODO: add the logic for determing whether the customer has an extended trial here and set it to isExtendedTrialEnd
  let isExtendedTrialEnd = false
  const emailReceipt = await sendTrialEndEmail(email as string, isExtendedTrialEnd);

  console.log('Email receipt from Sendgrid: ',emailReceipt);
  return successResponse({ message :  msg })
}

export default {
  failedPayment: handleFailedPayment,
  successfulPayment: handleSuccessfulPayment,
  trialEnding : handleTrialEnding,
}