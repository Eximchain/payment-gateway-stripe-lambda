const defaultTags = [
    {
        Key: "Application",
        Value: "AbiClerk"
    },
    {
        Key: "ManagedBy",
        Value: "AbiClerk"
    }
];

function dappNameTag(dappName) {
    return {
        Key: "DappName",
        Value: dappName
    }
}

module.exports = { 
    defaultTags, dappNameTag
};