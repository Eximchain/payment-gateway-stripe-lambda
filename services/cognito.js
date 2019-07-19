const { AWS , cognitoUserPoolId } = require('../env');
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

function promiseAdminGetUser(cognitoUsername) {
  let params = {
      UserPoolId: userPoolId,
      Username: cognitoUsername
  };
  return cognito.adminGetUser(params).promise();
}

function numDapps(plans, typeOfPlan){
    let planName = `custom:${typeOfPlan}_limit`
    return {
        Name:planName,
        Value:'1'
    }
}

export async function promiseUpdateDapps(email, plans) {
    let params = {
        "UserAttributes": [ 
           numDapps(plans,"standard"),
           numDapps(plans, "enterprise"),
           numDapps(plans, "professional")
        ],
        "Username": email,
        "UserPoolId": "string"
     }
     return cognitoidentityserviceprovider.adminUpdateUserAttributes(params).promise();
}

function generatePassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export async function promiseAdminCreateUser(email, plans) {
    let dataEmail = {
        Name : 'email',
        Value : `${email}`
    };
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: email,
        DesiredDeliveryMediums: [
            "EMAIL"
        ],
        ForceAliasCreation:false,
        TemporaryPassword: generatePassword(10),
        UserAttributes:[
            dataEmail,
            {
                Name: 'email_verified',
                Value: 'true'
            },
            numDapps(plans,"standard"),
            numDapps(plans, "enterprise"),
            numDapps(plans, "professional"),
        ]
    }
    return cognitoidentityserviceprovider.adminCreateUser(params).promise();
}


module.exports = {
    createUser : promiseAdminCreateUser,
    updateDapps: promiseUpdateDapps,
    getUser : promiseAdminGetUser,
}
