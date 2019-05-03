const { cognito, stripe } = require('./services');

function response(body){
    let responseHeaders = {"x-custom-header" : "my custom header value"};
    return {
        statusCode: 200,
        headers : responseHeaders,
        body : JSON.stringify(body)
    }
}

async function apiCreateCognito(body) {
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

async function apiCreateStripe(body) {
    const { email, numDapps, name, coupon } = body;
    try {
        const { customer, subscription } = await stripe.createCustomerAndSubscription({
            name, email, token, numDapps, coupon
        });
        return response({
            method : 'create-stripe',
            success : true,
            customerId : customer.id,
            subscriptionId : subscription.id
        })
    } catch (err) {
        console.log('Error on Stripe Customer/Subscription create: ',err);
        return response({
            method : 'create-stripe',
            success : false, err
        });
    } 
}

module.exports = {
  createCognito : apiCreateCognito,
  read : apiRead,
  delete : apiDelete,
  createStripe : apiCreateStripe
}