'use strict';
const api, { response } = require('./api');
const webhooks = require('./webhooks');

exports.handler = async (event) => {

    // Auto-return success for CORS pre-flight OPTIONS requests
    if (event.httpMethod.toLowerCase() == 'options'){
        // Note the empty body, no actual response data required
        return response({});
    }
    
    if (event.pathParameters == null){
        throw new Error("malformed path proxy");
    }

    let method = event.pathParameters.proxy;
    let body = JSON.parse(event.body);
    let responsePromise = (function(method) {
        switch(method) {
            case 'read':
                return api.read(body);
            case 'update':
                return api.update(body);
            case 'cancel':
                return api.cancel(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};

exports.lapsedHandler = async (event) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    if (event.httpMethod.toLowerCase() == 'options'){
        // Note the empty body, no actual response data required
        return response({});
    }
    return await webhooks.failedPayment(event);
}

exports.createHandler = async (event) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    if (event.httpMethod.toLowerCase() == 'options'){
        // Note the empty body, no actual response data required
        return response({});
    }
    return await api.create(event.body);
}