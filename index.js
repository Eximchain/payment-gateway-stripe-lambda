'use strict';
const api = require('./api');

exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));
    let responseCode = 200;

    let method = event.pathParameters.proxy;
    let body = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }

    let responsePromise = (function(method) {
        switch(method) {
            case 'create':
                return api.create(body);
            case 'read':
                return api.read(body);
            case 'delete':
                return api.delete(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};