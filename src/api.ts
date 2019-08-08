import services from './services';
import { ValidSubscriptionStates, Customer, SubscriptionStates } from './services/stripe';
const  { cognito, stripe, sns } = services;
import {PaymentStatus} from './services/sns'
import {matchUpdateBody, UpdateUserActions} from './validate'
import { CloudWatchEvents } from 'aws-sdk';

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
    console.log(`Updating dapp counts for ${email}`)
    const updatedSub = await stripe.updateSubscription(email, plans);
    const updateDappResult = await cognito.updateDapps(email, plans);
    const newUser = await cognito.getUser(email);

    return response({
        success: true,
        updatedSubscription : updatedSub,
        updatedUser : newUser
    })
}

async function apiUpdatePayment(email: string, body: string){
    const {token} = JSON.parse(body);
    console.log(`Updating payment source for ${email}`)
    const validToken = await stripe.isTokenValid(token);
    if (validToken) {
        const customer = await stripe.updatePayment(email, token) 
        return response({
            success: true,
            updatedCustomer: customer
        })
    } else {
        return response({
            success: false,
            err : new Error("Provided Stripe token was not valid.")
        })
    }
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
    const { email, plans, name, coupon, token } = JSON.parse(body)

    console.log(`Creating customer, subscription, & Cognito acct for $${email}`)

    // If they haven't provided a payment method, replace
    // plans with a one-standard-dapp subscription.
    const validToken = await stripe.isTokenValid(token);
    const allowedPlan = validToken ? plans : { standard : 1 };
    const { customer, subscription } = await stripe.create({
        name, email, token, coupon,
        plans : allowedPlan
    })

    if (!ValidSubscriptionStates.includes(subscription.status)) {
        throw Error(`Subscription failed because subscription status is ${subscription.status}`)
    }
    
    let newUser = await cognito.createUser(email, allowedPlan)

    return response({
        success: true,
        user : newUser,
        stripeId: customer.id,
        subscriptionId: subscription.id
    })
}

async function apiUpdate(email: string, body:string){
    try{
        switch (matchUpdateBody(body)){
            case UpdateUserActions.UpdatePlan:
                return await apiUpdateDapps(email, body)          
            case UpdateUserActions.UpdatePayment:
                return await apiUpdatePayment(email, body)
                
            default:
                return response({
                    success:false,
                    err:{message: "PUT body did not match shape for updating dapp allotments or payment source."}
                })
        }
    }catch(err){
        return response({
            success:false,
            err:err
        })
    }
    

}
export default {
    read: apiRead,
    update: apiUpdate,
    create: apiCreate,
    cancel: apiCancel
}