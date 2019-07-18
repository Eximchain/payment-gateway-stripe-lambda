
const AWS = require('aws-sdk');
const awsRegion = "us-east-1";
//TODO: Figure out how to get from terraform as environment variable
// const _cognitoUserPoolId = "us-east-1_ovQiwOPWo"
// const stripeKey = 'sk_test_5R9anctWzSc1LSLzL4YYzwxQ00yOUsDCXI';
const cognitorUserPoolId = process.env.COGNITO_USER_POOL;
const stripeKey = process.env.STRIPE_API_KEY;
const PLAN_IDS = {
    ENTHUSIAST : '',
    PROJECT : '',
    STARTUP : ''
}

AWS.config.update({region: awsRegion});
const userPoolId = _cognitoUserPoolId;

module.exports = { 
    AWS, awsRegion, cognitoUserPoolId, stripeKey, PLAN_IDS
};