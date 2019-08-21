import UnconfiguredAWS from 'aws-sdk';

// Provided automagically by AWS
export const awsRegion = process.env.AWS_REGION;

// Provided by Terraform
export const cognitoUserPoolId = process.env.COGNITO_USER_POOL as string;
export const stripeKey = process.env.STRIPE_API_KEY as string;
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
export const snsTopicARN = process.env.SNS_TOPIC_ARN as string;
export const sendgridKey = process.env.SENDGRID_API_KEY as string;
export const managerDNS = process.env.MANAGER_SPA_DNS as string;
export const eximchainAccountsOnly = process.env.EXIMCHAIN_ACCOUNTS_ONLY === 'true' ? true : false;

UnconfiguredAWS.config.update({region: awsRegion});
export const AWS = UnconfiguredAWS;


export default { 
    AWS, awsRegion, cognitoUserPoolId, stripeKey,
    stripeWebhookSecret, snsTopicARN
};