import services from './services';
const { cognito, stripe, sns } = services;
import { eximchainAccountsOnly } from './env';
import { UserError } from './validate'
import Payment, { SignUp, Read, UpdateCard, UpdatePlanCount, Cancel, StripePlans } from '@eximchain/dappbot-types/spec/methods/payment';
import * as EmailValidator from 'email-validator';

const eximchainEmailSuffix = '@eximchain.com';

async function apiCreate(body: string):Promise<SignUp.Result> {
    const args = JSON.parse(body);
    if (!SignUp.isArgs(args)) {
        throw new UserError(`Body was missing some required arguments for signup.`);
    }
    const { email, plans, name, coupon, token, metadata } = args;

    if (!EmailValidator.validate(email)) {
        throw new UserError(`Email address '${email}' is not a valid email address`);
    }
    if (eximchainAccountsOnly && !email.endsWith(eximchainEmailSuffix)) {
        throw new UserError(`Email ${email} is not permitted to create a staging account`);
    }
    // TODO: Store this info in a better way than logging it
    if (metadata) {
        console.log(`Processing new user ${email} (${name}) with metadata: `, metadata);
    } else {
        console.log(`Processing new user ${email} (${name}) without metadata`);
    }
    // If they haven't provided a payment method, replace
    // plans with a one-standard-dapp subscription.
    const createArgs:SignUp.Args = {
        name, email, coupon, plans
    }
    const validToken = await stripe.isTokenValid(token);
    if (validToken && typeof token === 'string') {
        createArgs.token = token;
    } else {
        createArgs.plans = Payment.trialStripePlan();
    }
    
    // Check for the presence of an existing Stripe customer,
    // recover its details 
    const existingCustomer = await stripe.read(email);
    let customer, subscription;
    if (existingCustomer.customer) {
        customer = existingCustomer.customer;
        subscription = existingCustomer.subscription;
        if (subscription) {
            const planNames = Object.keys(Payment.trialStripePlan());
            createArgs.plans = subscription.items.data.reduce((planObj, item) => {
                if (planNames.includes(item.plan.id)) {
                    planObj[item.plan.id as keyof StripePlans] = item.quantity as number;
                }
                return planObj;
            }, createArgs.plans)
        }
    } else {
        // If there isn't any customer, use our details to create one
        const createRes = await stripe.create(createArgs);
        customer = createRes.customer;
        subscription = createRes.subscription
    }

    if (subscription === null || !Payment.StripeTypes.ValidSubscriptionStates.includes(subscription.status)) {
        let msg = subscription ? `subscription status is ${subscription.status}` : `user already has an account, but it has no subscription.`
        throw new Error(`Subscription failed because ${msg}`);
    }

    let newUser = await cognito.createUser(email, createArgs.plans)

    return {
        user: newUser,
        stripeId: customer.id,
        subscriptionId: subscription.id
    }
}

async function apiRead(email: string):Promise<Read.Result> {
    console.log(`Reading user data for ${email}`);
    const user = await cognito.getUser(email);
    const stripeData = await stripe.read(email);
    return { user, ...stripeData }
}

async function apiCancel(email: string):Promise<Cancel.Result> {
    console.log(`Cancelling ${email}'s subscription`);
    const cancelledSub = await stripe.cancel(email);
    await sns.publishCancellation(email);
    return {
        cancelledSub
    }
}

async function apiUpdate(email: string, args: any):Promise<UpdateCard.Result | UpdatePlanCount.Result> {
    if (Payment.UpdateCard.isArgs(args)) {
        return await apiUpdatePayment(email, args);
    } else if (Payment.UpdatePlanCount.isArgs(args)) {
        return await apiUpdateDapps(email, args);
    } else {
        throw new UserError("Body did not match shape for updating dapp allotments or payment source.")
    }
}


async function apiUpdateDapps(email: string, { plans }:UpdatePlanCount.Args):Promise<UpdatePlanCount.Result> {
    console.log(`Updating dapp counts for ${email}`)
    // Stripe call will throw an error if they are in trial mode,
    // important that it happens before the Cognito one.
    const updatedSub = await stripe.updateSubscription(email, plans);
    const updateDappResult = await cognito.updateDapps(email, plans);
    const newUser = await cognito.getUser(email);
    return {
        updatedSubscription: updatedSub,
        updatedUser: newUser
    }
}

async function apiUpdatePayment(email: string, { token }:UpdateCard.Args):Promise<Payment.UpdateCard.Result> {
    console.log(`Updating payment source for ${email}`)
    const validToken = await stripe.isTokenValid(token);
    if (!validToken) throw new UserError('Provided Stripe token was not valid.');
    const customer = await stripe.updatePayment(email, token)
    let responseData:Payment.UpdateCard.Result = {
        updatedCustomer: customer
    }
    const invoice = await stripe.retryLatestUnpaid(customer.id);
    if (invoice) {
        responseData.retriedInvoice = invoice;
        console.log("Found a past_due invoice and recharged it with new payment source.");
    }
    return responseData;
}

export default {
    read: apiRead,
    update: apiUpdate,
    create: apiCreate,
    cancel: apiCancel
}