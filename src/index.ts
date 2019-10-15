'use strict';
import api from './api';
import { Read, UpdateCard, UpdatePlanCount, SignUp, Cancel } from '@eximchain/dappbot-types/spec/methods/payment';
import { userErrorResponse, successResponse, unexpectedErrorResponse, HttpMethods, isHttpMethod } from '@eximchain/dappbot-types/spec/responses';
import { UserError } from './validate';
import { APIGatewayEvent } from './gateway-event-type';
import Stripe, { WebhookEventTypes } from './services/stripe';
import webhooks from './webhooks';
import analytics from './services/analytics';

function handleErrResponse<Err extends Error>(err:Err) {
    console.log('Error: ',err);
    let msg = { ...err, message : err.message || err.toString() };
    return err instanceof UserError ? 
        userErrorResponse(msg) :
        unexpectedErrorResponse(msg);
}

exports.managementHandler = async (request: APIGatewayEvent) => {
    let method = request.httpMethod.toUpperCase() as HttpMethods.ANY;
    let callerEmail = request.requestContext.authorizer.claims.email;
    let body = request.body ? JSON.parse(request.body as string) : {};
    try {
        switch (method) {
            case 'GET':
                let readResult:Read.Result = await api.read(callerEmail);
                return successResponse(readResult);
            case 'PUT':
                analytics.identify({ userId: callerEmail });
                let updateResult:UpdateCard.Result | UpdatePlanCount.Result = await api.update(callerEmail, body);
                return successResponse(updateResult);
            case 'DELETE':
                analytics.identify({ userId: callerEmail });
                let cancelResult:Cancel.Result = await api.cancel(callerEmail);
                return successResponse(cancelResult);
            case 'OPTIONS':
                // Auto-return success for CORS pre-flight OPTIONS requests
                // Note the empty body, no actual response data required
                return successResponse(null);
            default:
                return userErrorResponse({ message : `Unrecognized HTTP method: ${method}.`}, { errorResponseCode : 405 })
        }
    } catch (err) {
        return handleErrResponse(err);
    }
};

exports.webhookHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests,
    // which have no body and can't be parsed.
    let method = request.httpMethod.toUpperCase() as HttpMethods.ANY;
    if (method === 'OPTIONS') return successResponse({})
    
    let stripe_event;
    try {
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
        console.log('Source event: ',stripe_event)
        return handleErrResponse(err);
    }
}

exports.signupHandler = async (request: APIGatewayEvent) => {
    // Auto-return success for CORS pre-flight OPTIONS requests
    const method = request.httpMethod.toUpperCase() as HttpMethods.ANY;
    if (method === 'OPTIONS') {
        // Note the empty body, no actual response data required
        return successResponse({});
    }
    try {
        const result:SignUp.Result = await api.create(request.body as string);
        return successResponse(result);
    } catch (err) {
        return handleErrResponse(err);
    }
}