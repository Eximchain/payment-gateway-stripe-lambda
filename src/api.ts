const { cognito, stripe, sns } = require('./services');

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
    try {
        const user = await cognito.getUser(email);
        const stripeData = await stripe.read(email);
        return response({
            method: 'read', user, ...stripeData
        });
    } catch (err) {
        console.log('Error on getting Cognito User: ', err);
        return response(err);
    }
}

async function apiUpdateDapps(email:string, body:string) {
    const { plans } = JSON.parse(body);
    console.log("Processing order: ", body)
    // TODO: Verify that the user doesn't have more dapps
    // than they're trying to update to
    try {
        const updatedSub = await stripe.update(email, plans);
        let result = await cognito.updateDapps(email, plans)
        return response({
            method: 'update-dapps',
            success: true,
            updatedSubscription : updatedSub,
            updatedUser : result
        })
    } catch (err) {
        return response({
            method: 'update-dapps',
            success: false, err
        });
    }
}

async function apiCancel(email:string){    
    try {
        console.log(`Cancelling ${email}'s subscription`);
        const cancelledSub = await stripe.cancel(email);
        const cancelledNotification = await sns.publishCancellation(email);
        return response({
            success: true,
            method: 'cancel',
            cancelledSub,
            cancelledNotification
        })
    } catch (err) {
        return response({
            method: 'cancel',
            success: false, err
        })
    }
}

async function apiCreate(body:string) {
    const { email, plans, name, coupon, token } = JSON.parse(body);

    try {
        console.log("customer & subscription creation")
        const { customer, subscription } = await stripe.create({
            name, email, token, plans, coupon
        })
        
        if (!['trialing', 'active'].includes(subscription.status)) {
            throw Error(`Subscription failed because subscription status is ${subscription.status}`)
        }
        
        let result = await cognito.createUser(email, plans)

        return response({
            method: 'create-stripe',
            success: true,
            user : result.data.User,
            stripeId: customer.id,
            subscriptionId: subscription.id
        })
    } catch (err) {
        console.log('Error on Stripe Customer/Subscription create: ', err);
        return response({
            method: 'create-stripe',
            success: false, err
        });
    }
}

export default {
    read: apiRead,
    update: apiUpdateDapps,
    create: apiCreate,
    cancel: apiCancel
}