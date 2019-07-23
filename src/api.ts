import services from './services';
import { ValidSubscriptionStates } from './services/stripe';
const { cognito, stripe, sns } = services;

export function response(body:object) {
    let responseHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    }
    return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify(body)
    }
}

async function apiRead(email:string) {
    console.log(`Reading user data for ${email}`);
    const user = await cognito.getUser(email);
    const stripeData = await stripe.read(email);
    return response({ user, ...stripeData });
}

async function apiUpdateDapps(email:string, body:string) {
    const { plans } = JSON.parse(body);
    console.log("Processing order: ", body)
    // TODO: Verify that the user doesn't have more dapps
    // than they're trying to update to
    const updatedSub = await stripe.update(email, plans);
    let result = await cognito.updateDapps(email, plans)
    return response({
        success: true,
        updatedSubscription : updatedSub,
        updatedUser : result
    })
}

async function apiCancel(email:string){    
    console.log(`Cancelling ${email}'s subscription`);
    const cancelledSub = await stripe.cancel(email);
    const cancelledNotification = await sns.publishCancellation(email);
    return response({
        success: true,
        cancelledSub,
        cancelledNotification
    })
}

async function apiCreate(body:string) {
    const { email, plans, name, coupon, token } = JSON.parse(body);

    console.log("customer & subscription creation")
    const { customer, subscription } = await stripe.create({
        name, email, token, plans, coupon
    })
    
    if (!ValidSubscriptionStates.includes(subscription.status)) {
        throw Error(`Subscription failed because subscription status is ${subscription.status}`)
    }
    
    let result = await cognito.createUser(email, plans)

    return response({
        success: true,
        user : result.User,
        stripeId: customer.id,
        subscriptionId: subscription.id
    })
}

export default {
    read: apiRead,
    update: apiUpdateDapps,
    create: apiCreate,
    cancel: apiCancel
}