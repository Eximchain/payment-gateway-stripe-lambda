import services from './services';
import { ValidSubscriptionStates, Customer, Invoice } from './services/stripe';
const { cognito, stripe, sns } = services;
import { eximchainAccountsOnly } from './env';
import { matchUpdateBody, UpdateUserActions, UserError } from './validate'
import { successResponse, unexpectedErrorResponse, userErrorResponse } from './responses';

const eximchainEmailSuffix = '@eximchain.com';

async function apiCreate(body: string) {
    const { email, plans, name, coupon, token } = JSON.parse(body)

    console.log(`Creating customer, subscription, & Cognito acct for ${email}`)

    try {
        if (eximchainAccountsOnly && !email.endsWith(eximchainEmailSuffix)) {
            return userErrorResponse({ message: `Email ${email} is not permitted to create a staging account` });
        }
        // If they haven't provided a payment method, replace
        // plans with a one-standard-dapp subscription.
        const validToken = await stripe.isTokenValid(token);
        const allowedPlan = validToken ? plans : { standard: 1 };

        // TODO: Check for an existing account, and if so, 
        // just return the associated IDs.
        const stripeData = await stripe.read(email);
        let stripeId = '';
        let subscriptionId = '';
        if (stripeData.customer) {
            const { customer, subscription } = stripeData;
            stripeId = customer.id;
            if (subscription) {
                subscriptionId = subscription.id;

                // TODO: Add typing & safety checks to verify this
                // will actually work!
                const updatedSub = await stripe.updateSubscription(email, allowedPlan);            
            } else {
                // TODO: We need to make them a subscription!
            }
        } else {
            const { customer, subscription } = await stripe.create({
                name, email, token, coupon,
                plans: allowedPlan
            })
    
            if (!ValidSubscriptionStates.includes(subscription.status)) {
                throw Error(`Subscription failed because subscription status is ${subscription.status}`)
            }

            stripeId = customer.id;
            subscriptionId = subscription.id;
        }

        let newUser = await cognito.createUser(email, allowedPlan)

        return successResponse({
            user: newUser,
            stripeId, subscriptionId
        })
    } catch (err) {
        console.log('Unexpected error on apiCreate: ',err);
        return unexpectedErrorResponse({ message: err.message || err.toString() })
    }
}

async function apiRead(email: string) {
    console.log(`Reading user data for ${email}`);
    const user = await cognito.getUser(email);
    const stripeData = user ? await stripe.read(email) : {};
    return successResponse({ user, ...stripeData })
}

async function apiCancel(email: string) {
    console.log(`Cancelling ${email}'s subscription`);
    const cancelledSub = await stripe.cancel(email);
    const cancelledNotification = await sns.publishCancellation(email);
    return successResponse({
        cancelledSub,
        cancelledNotification
    })
}

async function apiUpdate(email: string, body: string) {
    try {
        switch (matchUpdateBody(body)) {
            case UpdateUserActions.UpdatePlan:
                return await apiUpdateDapps(email, body)
            case UpdateUserActions.UpdatePayment:
                return await apiUpdatePayment(email, body)

            default:
                return userErrorResponse({
                    message: "PUT body did not match shape for updating dapp allotments or payment source."
                })
        }
    } catch (err) {
        console.log('Unexpected error on apiUpdate: ',err);
        return unexpectedErrorResponse({ message : err.message || err.toString()})
    }
}


async function apiUpdateDapps(email: string, body: string) {
    const { plans } = JSON.parse(body);
    console.log(`Updating dapp counts for ${email}`)
    try {
        // Stripe call will throw an error if they are in trial mode,
        // important that it happens before the Cognito one.
        const updatedSub = await stripe.updateSubscription(email, plans);
        const updateDappResult = await cognito.updateDapps(email, plans);
        const newUser = await cognito.getUser(email);
        return successResponse({
            updatedSubscription: updatedSub,
            updatedUser: newUser
        })
    } catch (err) {
        let msg = { message : err.message || err.toString() };
        console.log('Unexpected error updating dapps: ',err);
        return err instanceof UserError ? 
            userErrorResponse(msg) :
            unexpectedErrorResponse(msg);
    }
}

interface UpdatePaymentResponseData {
    updatedCustomer: Customer
    retriedInvoice?: Invoice
}

async function apiUpdatePayment(email: string, body: string) {
    const { token } = JSON.parse(body);
    console.log(`Updating payment source for ${email}`)
    const validToken = await stripe.isTokenValid(token);
    if (validToken) {
        const customer = await stripe.updatePayment(email, token)
        let responseData: UpdatePaymentResponseData = {
            updatedCustomer: customer
        }
        const invoice = await stripe.retryLatestUnpaid(customer.id);
        if (invoice) {
            responseData.retriedInvoice = invoice;
            console.log("Found a past_due invoice and recharged it with new payment source.");
        }
        return successResponse(responseData);
    } else {
        return userErrorResponse({ message: 'Provided Stripe token was not valid.' })
    }
}

export default {
    read: apiRead,
    update: apiUpdate,
    create: apiCreate,
    cancel: apiCancel
}