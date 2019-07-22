
const AWS = require('aws-sdk');

// Provided automagically by AWS
const awsRegion = process.env.AWS_REGION;

// Provided by Terraform
const cognitoUserPoolId = process.env.COGNITO_USER_POOL;
const stripeKey = process.env.STRIPE_API_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const snsTopicARN = process.env.SNS_TOPIC_ARN;

const PLAN_IDS = {
    ENTHUSIAST : '',
    PROJECT : '',
    STARTUP : ''
}

AWS.config.update({region: awsRegion});

module.exports = { 
    AWS, awsRegion, cognitoUserPoolId, stripeKey, PLAN_IDS,
    stripeWebhookSecret, snsTopicARN
};