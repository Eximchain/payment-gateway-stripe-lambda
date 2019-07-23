const { AWS, snsTopicARN } = require('../env');
const sns = new AWS.SNS();

export enum PaymentStatus {
  ACTIVE = 'ACTIVE',
  LAPSED = 'LAPSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

async function publishNotification(email:string, status:PaymentStatus){
  let params = {
    TopicArn : snsTopicARN,
    Message : JSON.stringify({
      event : "PAYMENT_STATUS",
      status : status,
      email : email
    })
  }
  return sns.publish(params).promise();
}

export async function publishPaymentFailure(email:string){
  return await publishNotification(email, PaymentStatus.LAPSED);
}

export async function publishCancellation(email:string){
  return await publishNotification(email, PaymentStatus.CANCELLED);
}

export default { publishPaymentFailure, publishCancellation }