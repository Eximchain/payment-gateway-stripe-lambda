import sgMail from '@sendgrid/mail';
import { surveyEmail } from '../emails'
import { sendgridKey, managerDNS } from '../env';

let USING_SENDGRID = false;

if (sendgridKey && sendgridKey !== ""){
  sgMail.setApiKey(sendgridKey);
  USING_SENDGRID = true;
}

const FROM_ADDRESS = 'dappbot@eximchain.com';

export async function sendSurveyEmail(email:string) {
  let emailHtml = surveyEmail(managerDNS)
  let confirmationParam = {
    from : FROM_ADDRESS,
    to : email,
    subject : `How Was Your Experience With DappBot?`,
    html : emailHtml
  }
  if (USING_SENDGRID){
    return sgMail.send(confirmationParam);
  } else {
    console.log(`No Sendgrid API key loaded, not sending a Trial Ending Soon email to ${email}.`);
    return confirmationParam
  }
}

export default {
  sendSurveyEmail
}