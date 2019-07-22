'use strict';
const api, { response } = require('./api');
const webhooks = require('./webhooks');

exports.managementHandler = async (request) => {
    let method = request.httpMethod.toUpperCase();
    let callerEmail = request.requestContext.authorizer.claims.email;   
    switch (method) {
        case 'GET':
            return await api.read(callerEmail);
        case 'PUT':
            return await api.update(callerEmail, JSON.parse(request.body));
        case 'DELETE':
            return await api.cancel(callerEmail);
        case 'OPTIONS':
            // Auto-return success for CORS pre-flight OPTIONS requests
            // Note the empty body, no actual response data required
            return response({});
        default:
            return response({
                success: false,
                err : new Error(`Unacceptable HTTP method: ${method}.`)
            }) 
    }
};

exports.webhookHandler = async (request) => {
    // Auto-return success for CORS pre-flight OPTIONS requests,
    // which have no body 
    if (request.httpMethod.toLowerCase() == 'options'){
        // Note the empty body, no actual response data required
        return response({});
    }
    return await webhooks.failedPayment(request);
}

exports.signupHandler = async (request) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    if (request.httpMethod.toLowerCase() == 'options'){
        // Note the empty body, no actual response data required
        return response({});
    }
    return await api.create(request.body);
}