import services from './services';
import { ValidSubscriptionStates, Customer, SubscriptionStates } from './services/stripe';
const  { cognito, stripe, sns } = services;
import {PaymentStatus} from './services/sns'
import {matchLoginBody, UpdateUserActions} from './validate'
import {CreateArgs, UpdatePaymentArgs} from './types'

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
    const updatedSub = await stripe.updateSubscription(email, plans);
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
    const requestBody:UpdatePaymentArgs = JSON.parse(body);
    const customer = await stripe.updatePayment(email, requestBody.token) 
    const {subscription} = await stripe.read(email)
    let result
    if(!subscription){
        throw new Error(`No subscription for email ${email} created`)
    }
    if(subscription.status === SubscriptionStates.active){
        result = await cognito.updatePaymentStatus(email, PaymentStatus.ACTIVE)
    }
    
    //take the customer returned from stripe and update it with the new paymentToken
    return response({
        success: true,
        updatedCustomer: customer
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
    const requestBody: CreateArgs = JSON.parse(body)
    const { email, plans, name, coupon, token } = requestBody

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