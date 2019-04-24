# payment-gateway-stripe-lambda

> Lambda function for the Stripe Payment gateway.

## How to Build
To deploy a Lambda function, it must be wrapped into a zip file with all of its dependencies.  You can produce this zip file with:

```sh
npm run build
```

This will produce an `payment-gateway-stripe-lambda.zip` at the package root directory.  The command is idempotent -- if you run it again while a build already exists, it won't package that old build into the new build.

## Responsibilities

Access to the Dappsmith API is controlled by an [Amazon Cognito User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) and an associated [API Gateway Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html).  This gives us full Admin control over the accounts used to access Dappsmith. This allows us to ensure that only paid users can access the API and trigger any compute usage.

The primary responsibility of this Lambda function is to respond to [Stripe webhook events](https://stripe.com/docs/webhooks) and administer the Cognito user accounts in response to them. In particular, it needs to handle the following essential functionality:

1. Accept a Cognito User Pool to administer via Lambda environment variables.
2. Signature Validation to ensure our payment system cannot be bypassed by spoofing a Stripe webhook.
3. When a new user buys a subscription, use the [Cognito AdminCreateUser API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html) to create a new user for them. Provide their email address, mark it as verified, and send the welcome via email.
4. When a user's subscription expires and is not renewed, use the [Cognito AdminDisableUser API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminDisableUser.html) to disable their user and revoke their API access.
5. When a disabled user renews their payment, use the [Cognito AdminEnableUser API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminEnableUser.html) to enable their user again.
6. Set a [Cognito Custom User Attribute](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html#user-pool-settings-custom-attributes) representing the number of dapps that a user is paying for. We'll need to ensure we can validate the number of dapps is below this before create calls. If this ends up not working we may need to modify the architecture to write limits to a DynamoDB table.  This may require modification of the Cognito User Pool in the [Terraform Configuration](https://github.com/Eximchain/terraform-aws-abi-clerk/tree/cognito-auth/terraform).

The minimal viable Proof-of-Concept would be steps `1` and `3`.

## Endpoints
- **`/create`**
  - Accepts a body with the following keys:
    - **`rawBody`**: stripe webhooks event that must be decrypted via stripe API
      - Extracted decrypted object that looks like sample below
        - **`id`**: String, Stripe Order Id.
        - **`amount`**: Number, Amount of currency to fullfill order.
        - **`currency`**: String, Currency being used.
        - **`charge`**: String, Stripe Charge Id.
        - **`email`**: String, Stripe Customer Email.
        - **`items`**: Array, or Stripe line items for the order.
        - **`metadata`**: Object, Extra information added to customer order 
        - **`name`**: String, Customer Full Name
        - **`status`**: String, Order status one of : canceled", "fulfiled", "paid", "returned"
        - **`updated`**: Number, UTC time of last status update
  - TODO: Create Cognito User Magic
  - TODO: Assign ability to run dappsmith api 
  - TODO: Return header tokens to call dappsmith api

- **`/read`**
  - Accepts a body with key `email`.
  - Returns any unfulfilled orders 
- **`/update`**
  - Accepts a body with key `email`.
  - Fetches any unfulfilled (failed to process) orders and processes them.
- **`/delete`**
  - Accepts a body with key `email`.
  - Destroys all associated resources and returns a success.



```
 {
  "id": "or_1ESq9uLJpPPc8UJfhy80WPz2",
  "object": "order",
  "amount": 300,
  "amount_returned": null,
  "application": null,
  "application_fee": null,
  "charge": "ch_1ESq9uLJpPPc8UJfVTVfBBph",
  "created": 1556131770,
  "currency": "usd",
  "customer": null,
  "email": "juan@eximchain.com",
  "items": [{
      "object": "order_item",
      "amount": 150,
      "currency": "usd",
      "description": "Banana",
      "parent": "1",
      "quantity": 1,
      "type": "sku"
    },{
      "object": "order_item",
      "amount": 0,
      "currency": "usd",
      "description": "Taxes (included)",
      "parent": null,
      "quantity": null,
      "type": "tax"
    },
    {
      "object": "order_item",
      "amount": 0,
      "currency": "usd",
      "description": "Free shipping",
      "parent": "ship_free-shipping",
      "quantity": null,
      "type": "shipping"
    }
  ],
    "livemode": false,
  "metadata": {},
  "returns": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/order_returns?order=or_1ESq9uLJpPPc8UJfhy80WPz2"
  },
  "selected_shipping_method": "ship_free-shipping",
  "shipping": {
    "address": {
      "city": "Boston",
      "country": "United States",
      "line1": "1476 Commonwealth Ave",
      "line2": null,
      "postal_code": "02135",
      "state": "MA"
    },
    "carrier": null,
    "name": "Juan Huertas",
    "phone": null,
    "tracking_number": null
  },
  "shipping_methods": [
    {
      "id": "ship_free-shipping",
      "amount": 0,
      "currency": "usd",
      "delivery_estimate": null,
      "description": "Free shipping"
    }
  ],
  "status": "paid",
  "status_transitions": {
    "canceled": null,
    "fulfiled": null,
    "paid": 1556131771,
    "returned": null
  },
  "updated": 1556131771
}
```