import sgMail from '@sendgrid/mail';
import { trialEndEmail } from '../emails'
import { sendgridKey, managerDNS } from '../env';

let USING_SENDGRID = false;

if (sendgridKey && sendgridKey !== ""){
  sgMail.setApiKey(sendgridKey);
  USING_SENDGRID = true;
}

const FROM_ADDRESS = 'dappbot@eximchain.com';

export async function sendTrialEndEmail(email:string) {
  let confirmationParam = {
    from : FROM_ADDRESS,
    to : email,
    subject : `Your DappBot Trial is Ending Soon, Unless...`,
    html : trialEndEmail(managerDNS)
  }
  if (USING_SENDGRID){
    return sgMail.send(confirmationParam);
  } else {
    let msg = `No Sendgrid API key loaded, not sending following email: ${JSON.stringify(confirmationParam, undefined, 2)}`;
    return msg
  }
}

export default {
  sendTrialEndEmail
}