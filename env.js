
const AWS = require('aws-sdk');
const awsRegion = "us-east-1";

const cognitorUserPoolId = process.env.COGNITO_USER_POOL;
const stripeKey = process.env.STRIPE_API_KEY;
const PLAN_IDS = {
    ENTHUSIAST : '',
    PROJECT : '',
    STARTUP : ''
}

AWS.config.update({region: awsRegion});

const failedPaymentWebhookId = 'whsec_Mp28CyzpSKBsdeeetcSFHu4QViwYngY4';

const targetSnsARN = 'TODO: Use something from Terraform'

module.exports = { 
    AWS, awsRegion, cognitoUserPoolId, stripeKey, PLAN_IDS,
    failedPaymentWebhookId, targetSnsARN
};