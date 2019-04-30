
const AWS = require('aws-sdk');
const awsRegion = "us-east-1";
//TODO: Figure out how to get from terraform as environment variable
const _cognitoUserPoolId = "us-east-1_cdyKMFR7r"


AWS.config.update({region: awsRegion});
const userPoolId = _cognitoUserPoolId;

module.exports = { 
    AWS, awsRegion, userPoolId
};