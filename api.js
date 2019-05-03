const { cognito } = require('./services');

function response(body){
    let responseHeaders = {"x-custom-header" : "my custom header value"};
    return {
        statusCode: 200,
        headers : responseHeaders,
        body : JSON.stringify(body)
    }
}

async function apiCreate(body) {
    let email = body.email;
    let number = body.items[0].quantity;

    console.log(`Processing Order`)
    console.log("verified body"+ JSON.stringify(body));

    try {
        //TODO: mark order as fulfilled on cognito success
        //TODO: validate email
        //TODO: validate status is paid but not processed
        const result = await cognito.createUser(email, number);
        console.log("Dapperator user success!", result);

        let responseBody = {
            method: "create"
        };
        return response(responseBody);
    } catch (err) {
        console.log('Err creating Cognito user: ',err);
        return response(err);
    }
}

async function apiRead(body) {
    let email = body.email;
    let status = body.status;
    console.log(`Processing Order`)
    console.log("verified body"+ JSON.stringify(body));
        
    //TODO: validate email
    try {
        const user = await cognito.getUser(email);
        return response({
            method: 'read', user
        });
    } catch (err) {
        console.log('Error on getting Cognito User: ',err);
        return response(err);
    }
}

async function apiDelete(body) {
    //TODO: API Delete
}

async function apiCreateCustomer(body) {

}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}