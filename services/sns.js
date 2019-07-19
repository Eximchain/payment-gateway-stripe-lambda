const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const { targetSnsARN } = require('../env');

export const PaymentStatus = {
  ACTIVE = 'ACTIVE',
  LAPSED = 'LAPSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

async function publishNotification(email, status){
  let params = {
    TargetARN : targetSnsARN,
    Message : JSON.stringify({
      event : "PAYMENT_STATUS",
      status : status,
      email : email
    })
  }
  return sns.publish(params).promise();
}

async function publishPaymentFailure(email){
  return await publishNotification(email, PaymentStatus.LAPSED);
}

async function publishCancellation(email){
  return await publishNotification(email, PaymentStatus.CANCELLED);
}

module.exports = { publishPaymentFailure, publishCancellation }