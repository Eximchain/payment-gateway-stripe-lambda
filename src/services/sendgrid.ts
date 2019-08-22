import sgMail from '@sendgrid/mail';
import { trialEndEmail, extendedTrialEndEmail } from '../emails'
import { sendgridKey, managerDNS } from '../env';

let USING_SENDGRID = false;

if (sendgridKey && sendgridKey !== ""){
  sgMail.setApiKey(sendgridKey);
  USING_SENDGRID = true;
}

const FROM_ADDRESS = 'dappbot@eximchain.com';

export async function sendTrialEndEmail(email:string) {
  let emailHtml = trialEndEmail(managerDNS)
  let confirmationParam = {
    from : FROM_ADDRESS,
    to : email,
    subject : `Your DappBot Trial is Ending Soon, Unless...`,
    html : emailHtml
  }
  if (USING_SENDGRID){
    return sgMail.send(confirmationParam);
  } else {
    console.log(`No Sendgrid API key loaded, not sending a Trial Ending Soon email to ${email}.`);
    return confirmationParam
  }
}

export async function sendExtendedTrailEndEmail(email:string) {
  let emailHtml = extendedTrialEndEmail(managerDNS)
  let confirmationParam = {
    from: FROM_ADDRESS,
    to: email,
    subject: `Your Dappbot Trial is Ending, Unless...`,
    html: emailHtml
  }
  if(USING_SENDGRID){
    return sgMail.send(confirmationParam)
  } else {
    console.log(`No Sendgrid API key loaded, not sending a Extended Trial Ending soon email to ${email}`)
  }
}

export default {
  sendTrialEndEmail,
  sendExtendedTrailEndEmail
}