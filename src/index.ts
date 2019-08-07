'use strict';
import api, { response } from './api';
import { APIGatewayEvent } from './gateway-event-type';
import Stripe, { WebhookEventTypes } from './services/stripe';
import webhooks from './webhooks';

exports.managementHandler = async (request: APIGatewayEvent) => {
    let method = request.httpMethod.toUpperCase();
    let callerEmail = request.requestContext.authorizer.claims.email;
    try {
        switch (method) {
            case 'GET':
                return await api.read(callerEmail);
            case 'PUT':
                return await api.update(callerEmail, JSON.parse(request.body as string));
            case 'DELETE':
                return await api.cancel(callerEmail);
            case 'OPTIONS':
                // Auto-return success for CORS pre-flight OPTIONS requests
                // Note the empty body, no actual response data required
                return response({});
            default:
                return response({
                    success: false,
                    err: new Error(`Unrecognized HTTP method: ${method}.`)
                })
        }
    } catch (err) {
        return response({ success: false, err })
    }
};

exports.webhookHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests,
    // which have no body 
    if (request.httpMethod.toLowerCase() == 'options') {
        // Note the empty body, no actual response data required
        return response({});
    }
    try {
        let stripe_event;
        if (request.body == null) throw new Error("Webhook request has no body.");
        if (!request.headers || !request.headers['Stripe-Signature']) {
            throw new Error("Missing Stripe Signature header.");
        } else {
            stripe_event = await Stripe.decodeWebhook(request.body, request.headers['Stripe-Signature']);
        }
        switch (stripe_event.type){
            case WebhookEventTypes.failedPayment:
                return await webhooks.failedPayment(stripe_event);
            case WebhookEventTypes.trialEnding:
                return await webhooks.trialEnding(stripe_event)
            default:
                throw new Error(`Unrecognized webhook event type: ${stripe_event.type}`)
        }
    } catch (err) {
        return response({ err });
    }
}

exports.signupHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    if (request.httpMethod.toLowerCase() == 'options') {
        // Note the empty body, no actual response data required
        return response({});
    }
    return await api.create(request.body as string);
}