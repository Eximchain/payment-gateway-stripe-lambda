import AllStripeTypes from 'stripe'; 
import { successResponse } from '@eximchain/dappbot-types/spec/responses';
import { StripeTypes } from '@eximchain/dappbot-types/spec/methods/payment';
import { getStripeCustomerById } from './services/stripe';
import { sendSurveyEmail } from './services/sendgrid';
import { publishPaymentFailure, publishPaymentSuccess } from './services/sns';

type WebhookEvent = AllStripeTypes.events.IEvent;

export async function handleFailedPayment(event:WebhookEvent) {
  const invoice = event.data.object as StripeTypes.Invoice;
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
  const invoice = event.data.object as StripeTypes.Invoice;
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
  const subscription = event.data.object as StripeTypes.Subscription;
  const customer = await getStripeCustomerById(subscription.customer as string);
  const { email } = customer;
  let msg = `DappBot notified of ${email}'s trial ending.`
  console.log(msg);
  const emailReceipt = await sendSurveyEmail(email as string);
  console.log('Email receipt from Sendgrid: ',emailReceipt);
  return successResponse({ message :  msg })
}

export default {
  failedPayment: handleFailedPayment,
  successfulPayment: handleSuccessfulPayment,
  trialEnding : handleTrialEnding
}