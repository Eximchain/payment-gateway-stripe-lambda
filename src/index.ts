'use strict';
import api from './api';
import { HTTPMethods, unexpectedErrorResponse, successResponse, userErrorResponse } from './responses';
import { isHTTPMethod } from './validate';
import { APIGatewayEvent } from './gateway-event-type';
import Stripe, { WebhookEventTypes } from './services/stripe';
import webhooks from './webhooks';

exports.managementHandler = async (request: APIGatewayEvent) => {
    let method = request.httpMethod.toUpperCase();
    let callerEmail = request.requestContext.authorizer.claims.email;
    try {
        switch (method) {
            case HTTPMethods.GET:
                return await api.read(callerEmail);
            case HTTPMethods.PUT:
                return await api.update(callerEmail, request.body as string);
            case HTTPMethods.DELETE:
                return await api.cancel(callerEmail);
            case HTTPMethods.OPTIONS:
                // Auto-return success for CORS pre-flight OPTIONS requests
                // Note the empty body, no actual response data required
                return successResponse({});
            default:
                return userErrorResponse({ message : `Unrecognized HTTP method: ${method}.`}, { errorResponseCode : 405 })
        }
    } catch (err) {
        return unexpectedErrorResponse(err)
    }
};

exports.webhookHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests,
    // which have no body and can't be parsed.
    if (isHTTPMethod(request.httpMethod, HTTPMethods.OPTIONS)) return successResponse({})
    
    try {
        let stripe_event;
        if (request.body == null) throw new Error("Webhook request has no body.");
        if (!request.headers || !request.headers['Stripe-Signature']) {
            return userErrorResponse({ message : "Missing Stripe Signature header."})
        } else {
            stripe_event = await Stripe.decodeWebhook(request.body, request.headers['Stripe-Signature']);
        }
        switch (stripe_event.type){
            case WebhookEventTypes.successfulPayment:
                return await webhooks.successfulPayment(stripe_event);
            case WebhookEventTypes.failedPayment:
                return await webhooks.failedPayment(stripe_event);
            case WebhookEventTypes.trialEnding:
                return await webhooks.trialEnding(stripe_event)
            default:
                return userErrorResponse({ message : `Unrecognized webhook event type: ${stripe_event.type}`})
        }
    } catch (err) {
        return unexpectedErrorResponse(err);
    }
}

exports.signupHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    if (isHTTPMethod(request.httpMethod, HTTPMethods.OPTIONS)) {
        // Note the empty body, no actual response data required
        return successResponse({});
    }
    return await api.create(request.body as string);
}