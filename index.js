'use strict';
const api = require('./api');
//TODO: make all the stripe keys environment variables
const stripe = require('stripe')('sk_test_5R9anctWzSc1LSLzL4YYzwxQ00yOUsDCXI')

exports.handler = async (event) => {
    let stripe_event;

    if (event.pathParameters == null){
        throw new Error("malformed path proxy");
    }

    let method = event.pathParameters.proxy;

    if (method == 'create'){
        if (event.body == null) {
            throw new Error("malformed body");
        }
        if (event.headers == null) {
            throw new Error("malformed headers");
        }
        else{
            try {
                console.log("signature:" + event.headers['Stripe-Signature']);
                stripe_event = await stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], 'whsec_Mp28CyzpSKBsdeeetcSFHu4QViwYngY4')
            } catch(err) {
                throw new Error(err)
            }
         
        }
    }
    
    let responsePromise = (function(method) {
        switch(method) {
            case 'create':
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