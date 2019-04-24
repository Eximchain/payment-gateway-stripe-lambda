# payment-gateway-stripe-lambda

> Lambda function for the Stripe Payment gateway.

## How to Build
To deploy a Lambda function, it must be wrapped into a zip file with all of its dependencies.  You can produce this zip file with:

```sh
npm run build
```

This will produce an `payment-gateway-stripe-lambda.zip` at the package root directory.  The command is idempotent -- if you run it again while a build already exists, it won't package that old build into the new build.

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