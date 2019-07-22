import { AWS, cognitoUserPoolId } from '../env';
import { StripePlan } from './stripe';
const cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

function promiseAdminGetUser(cognitoUsername:string) {
  let params = {
      UserPoolId: cognitoUserPoolId,
      Username: cognitoUsername
  };
  return cognito.adminGetUser(params).promise();
}

function numDapps(plans:StripePlan[], typeOfPlan:string){
    let planName = `custom:${typeOfPlan}_limit`
    return {
        Name:planName,
        Value:'1'
    }
}

export async function promiseUpdateDapps(email:string, plans:StripePlan[]) {
    let params = {
        "UserAttributes": [ 
           numDapps(plans,"standard"),
           numDapps(plans, "enterprise"),
           numDapps(plans, "professional")
        ],
        "Username": email,
        "UserPoolId": "string"
     }
     return cognito.adminUpdateUserAttributes(params).promise();
}

function generatePassword(length:number) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export async function promiseAdminCreateUser(email:string, plans:StripePlan[]) {
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
    return cognito.adminCreateUser(params).promise();
}


export default {
    createUser : promiseAdminCreateUser,
    updateDapps: promiseUpdateDapps,
    getUser : promiseAdminGetUser,
}
