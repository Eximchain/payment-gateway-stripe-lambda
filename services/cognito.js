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

async function adminUpdate(params) {
    //TODO: API Delete
    return new Promise((resolve, reject) => 
        cognitoidentityserviceprovider.adminUpdateUserAttributes(params, (err, result) => {
            if(err) {
                reject(err)
                return
            }
            resolve(result)
        })
    )
}


export async function adminSignUp(params){
    return new Promise((resolve, reject) => 
        cognitoidentityserviceprovider.adminCreateUser(params, (err, result) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(result);
        })
    )
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
     return adminUpdateDapps
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
    return adminSignUp(params)
}


module.exports = {
    createUser : promiseAdminCreateUser,
    updateDapps: promiseUpdateDapps,
    getUser : promiseAdminGetUser,
}
