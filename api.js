const AWS = require('aws-sdk')
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const { stripeKey, cognitoUserPoolId } = require('./env');
const stripe = require('stripe')(stripeKey)
import cognito from './services/cognito.js'

function generatePassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
    }

function response(body){
    let responseHeaders = {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' ,
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    }
    return {
        statusCode: 200,
        headers : responseHeaders,
        body : JSON.stringify(body)
    }
}

async function apiRead(body) {
    let email = body.email;
    let status = body.status;
    console.log(`Processing Order`)
    console.log("verified body"+ JSON.stringify(body));
        
    //TODO: validate email
    try {
        const user = await cognito.getUser(email);
        return response({
            method: 'read', user
        });
    } catch (err) {
        console.log('Error on getting Cognito User: ',err);
        return response(err);
    }
}

async function apiDelete(body) {
    //TODO: API Delete
    return new Promise((resolve, reject) => 
        cognitoidentityserviceprovider.
    )
}


async function adminSignUp(params){
    return new Promise((resolve, reject) => 
        cognitoidentityserviceprovider.adminCreateUser(params, (err, result) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(result);
        })
    )
}

async function returnPromise(functionCall, params) {
    return new Promise((resolve, reject) => 
        functionCall(params, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            resolve(result)
        })
    )
}

async function apiPaymentFailed(body) {
    const {data} = JSON.parse(body)
    const customer = data.object.customer
    const username = data.object.customer_email


}

async function apiCreateStripe(body) {
    const {  email, plans, name, coupon, token } = JSON.parse(body);

    console.log("Processing order:" , body)
    try {
        console.log("customer creation")
        let customer = await stripe.customers.create({
            description: `customer for ${email}`,
            email: email,
            source: token.id,
            items:[]
          })
        let items = []
        for(let i=0; i<plans.length; i++){
            let planType = Object.keys(plans[i])[0]
            items.push({
                plan:planType,
                quantity: parseInt(plans[i][planType])
            })
        }

        console.log("subscription creation")
        let subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items:items
        })
        console.log(subscription.status)
        if(!subscription.status==="active"){
            throw Error(`Subscription failed because subscription status is ${subscription.status}`)
        }

        let result = cognito.createUser(email, plans)
        console.log("creating cognito user")
        console.log("params: ", params)
        
        // let result = await signUp(userPool, email, generatePassword(10), attributeList)
        // await userPool.signUp(email, generatePassword(10) , attributeList, null, function(err, result) {
        // console.log("RESULT: ",result)
        // if (err) {
        //     console.log(err.message || JSON.stringify(err));
        //     return;
        // }
        // })

        return response({
            method : 'create-stripe',
            success : true,
            customerId : customer.id,
            subscriptionId : subscription.id
        })
    } catch (err) {
        console.log('Error on Stripe Customer/Subscription create: ',err);
        return response({
            method : 'create-stripe',
            success : false, err
        });
    } 
}
//TODO: 
//failedStripe is the webhook from stripe for subscriptions that couldn't be paid for
//delete is deleting a dapp and updating the cognito user attribute accordingly
//create Cognito is to simply create a cognito user without stripe.
module.exports = {
  read : apiRead,
  delete : apiDelete,
  createStripe : apiCreateStripe,
  failedStripe : apiPaymentFailed
}