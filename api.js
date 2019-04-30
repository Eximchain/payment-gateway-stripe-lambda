const { cognito } = require('./services');

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {

        let email = body.email;
        let number = body.items[0].quantity;

            
        console.log(`Processing Order`)
        console.log("verified body"+ JSON.stringify(body));
            
        //TODO: mark order as fulfilled on cognito success
        //TODO: validate email
        //TODO: validate status is paid but not processed
        cognito.createUser(email, number)
        .then(function(result) {
            console.log("Dapperator user success!", result);
            
            let responseCode = 200;
            // TODO: Replace with something useful or remove
            let responseHeaders = {"x-custom-header" : "my custom header value"};

            let responseBody = {
                method: "create"
            };
            let response = {
                statusCode: responseCode,
                headers: responseHeaders,
                body: JSON.stringify(responseBody)
            };
            resolve(response);
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })
    });
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        
        let email = body.email;
        let status = body.status;
        console.log(`Processing Order`)
        console.log("verified body"+ JSON.stringify(body));
            
        //TODO: validate email
        cognito.getUser(email)
        .then(function(result) {
            console.log(" user check success!", result);
            
            let responseCode = 200;
            // TODO: Replace with something useful or remove
            let responseHeaders = {"x-custom-header" : "my custom header value"};

            let responseBody = {
                method: "read"
            };
            let response = {
                statusCode: responseCode,
                headers: responseHeaders,
                body: JSON.stringify(responseBody)
            };
            resolve(response);
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })
    });
}

async function apiDelete(body) {
    //TODO: API Delete
}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}