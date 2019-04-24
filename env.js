const awsRegion = process.env.AWS_REGION;
const tableName = process.env.DDB_TABLE;
const kmsKeyName = process.env.KMS_KEY_NAME;
const artifactBucket = process.env.ARTIFACT_BUCKET;
const dappseedBucket = process.env.DAPPSEED_BUCKET;

const AWS = require('aws-sdk');
AWS.config.update({region: awsRegion});

module.exports = { 
    AWS, awsRegion, tableName, kmsKeyName, artifactBucket, dappseedBucket
};