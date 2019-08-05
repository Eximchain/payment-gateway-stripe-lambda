import services from './services';
import { ValidSubscriptionStates } from './services/stripe';
const { cognito, stripe, sns } = services;
import {matchLoginBody, UpdateUserActions} from './validate'

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
    const stripeData = user ? await stripe.read(email) : {};
    return response({ user, ...stripeData })
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

//TODO: finish implementing api for updating payment info. Just grab the payment token from stripe that the user sends
//and update the stripe subscription for that particular user. 
async function apiUpdatePayment(email: string, body: string){
    const {paymentToken} = JSON.parse(body);
    const {customer, subscription} = await stripe.read(email)
    return response({
        success: true
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
    
    let newUser = await cognito.createUser(email, plans)

    return response({
        success: true,
        user : newUser,
        stripeId: customer.id,
        subscriptionId: subscription.id
    })
}

async function apiUpdate(email: string, body:string){
    switch (matchLoginBody(body)){
        case UpdateUserActions.UpdatePlan:
            return apiUpdateDapps(email, body)
            break
        case UpdateUserActions.UpdatePayment:
            return apiUpdatePayment(email, body)
            break
    }

}
export default {
    read: apiRead,
    update: apiUpdate,
    create: apiCreate,
    cancel: apiCancel
}