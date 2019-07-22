
const UnconfiguredAWS = require('aws-sdk');

// Provided automagically by AWS
export const awsRegion = process.env.AWS_REGION;

// Provided by Terraform
export const cognitoUserPoolId = process.env.COGNITO_USER_POOL;
export const stripeKey = process.env.STRIPE_API_KEY;
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
export const snsTopicARN = process.env.SNS_TOPIC_ARN;

export const PLAN_IDS = {
    ENTHUSIAST : '',
    PROJECT : '',
    STARTUP : ''
}

UnconfiguredAWS.config.update({region: awsRegion});
export const AWS = UnconfiguredAWS;


export default { 
    AWS, awsRegion, cognitoUserPoolId, stripeKey, PLAN_IDS,
    stripeWebhookSecret, snsTopicARN
};