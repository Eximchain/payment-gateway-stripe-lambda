const { AWS, tableName } = require('../env');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const { dappDNS } = require('./route53');

function serializeDdbKey(dappName) {
    let keyItem = {
        'DappName': {S: dappName}
    };
    return keyItem;
}

function serializeDdbItem(dappName, ownerEmail, abi, bucketName, cloudfrontDns, cloudfrontDistroId) {
    let creationTime = new Date().toISOString();
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'S3BucketName' : {S: bucketName},
        'CloudfrontDistributionId' : {S: cloudfrontDistroId},
        'CloudfrontDnsName' : {S: cloudfrontDns},
        'DnsName' : {S: dappDNS(dappName)}
    };
    return item;
}

function promisePutDappItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns) {
    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName, cloudfrontDns, cloudfrontDistroId)
    };

    return ddb.putItem(putItemParams).promise();
}

function promiseGetDappItem(dappName) {
    let getItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return ddb.getItem(getItemParams).promise();
}

function promiseDeleteDappItem(body) {
    let dappName = body.DappName;

    let deleteItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return ddb.deleteItem(deleteItemParams).promise();
}

module.exports = {
    putItem : promisePutDappItem,
    getItem : promiseGetDappItem,
    deleteItem : promiseDeleteDappItem
}