const validate = require('./validate');
const { dynamoDB, s3 } = require('./services');
const stripe = require('stripe')('sk_test_5R9anctWzSc1LSLzL4YYzwxQ00yOUsDCXI')
        
async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        const sig = req.headers['stripe-signature']
        try {
            const event = await stripe.webhooks.constructEvent(req.rawBody, sig, 'whsec_Mp28CyzpSKBsdeeetcSFHu4QViwYngY4')
            const eventBody =  event.data.object;
            console.log(`Processing Order : ${event.data.object}`)
            try {
                validate.create(eventBody);
            } catch(err) {
                reject(err);
            }
            //PROCESS ORDER HERE
            //TODO: API Create
        } catch (err) {
            return res.sendStatus(500)
        }
        return res.sendStatus(200)
       
        
       
    });
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.read(body);
        } catch(err) {
            reject(err);
        }
        //TODO: API Read
    });
}

// TODO: Make sure incomplete steps are cleaned up
async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.delete(body);
        } catch(err) {
            reject(err);
        }
        //TODO: API Delete
    });
}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}