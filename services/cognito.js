const { AWS , userPoolId } = require('../env');
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

function promiseAdminGetUser(cognitoUsername) {
  let params = {
      UserPoolId: userPoolId,
      Username: cognitoUsername
  };
  return cognito.adminGetUser(params).promise();
}

function promiseAdminCreateUser(email, number) {
    var params = {
        UserPoolId: userPoolId, /* required: The user pool ID for the user pool where the user will be created.*/
        Username: email, /* required : The username for the user. Must be unique within the user pool. Must be a UTF-8 string between 1 and 128 characters. After the user is created, the username cannot be changed.*/
   
        ForceAliasCreation: false,
        
        UserAttributes: [
            { Name: "email", Value: email},
            { Name: "dev:custom:num_dapps", Value: `${number}`},
        ],
        
      };
      return cognitoidentityserviceprovider.adminCreateUser(params).promise()
}


module.exports = {
    createUser : promiseAdminCreateUser,
    getUser : promiseAdminGetUser,
}
