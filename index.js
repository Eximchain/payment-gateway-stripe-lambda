'use strict';
const api = require('./api');
const {stripeKey} = require('./env')
//TODO: make all the stripe keys environment variables
const stripe = require('stripe')(stripeKey)

exports.handler = async (event) => {

    // Auto-return success for CORS pre-flight OPTIONS requests
    if (event.httpMethod.toLowerCase() == 'options'){

        // Note the empty body, no actual response data required
        return {
        statusCode : 200,
        headers : {
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*' ,
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        },
        body : JSON.stringify({})
        };
    }
    

    let stripe_event;

    if (event.pathParameters == null){
        throw new Error("malformed path proxy");
    }

    let method = event.pathParameters.proxy;

    if (method == 'update'){
        console.log("BODY: ",event.body)
        if (event.body == null) {
            throw new Error("malformed body");
        }
        console.log("HEADERS: ", event.headers)
        if (event.headers == null) {
            throw new Error("malformed headers");
        }
        else{
            try {
                console.log("Signature error shenanigans")
                console.log("signature:" + event.headers['Stripe-Signature']);
                stripe_event = await stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], 'whsec_Mp28CyzpSKBsdeeetcSFHu4QViwYngY4')
            } catch(err) {
                throw new Error(err)
            }
         
        }
    }
    
    let responsePromise = (function(method) {
        switch(method) {
            case 'update':
                return api.createCognito(stripe_event.data.object);
            case 'read':
                return api.read(event.body);
            case 'delete':
                return api.delete(event.body);
            case 'create-stripe':
                return api.createStripe(event.body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};