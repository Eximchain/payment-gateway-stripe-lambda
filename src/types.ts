import {StripePlan, CreateStripeArgs} from './services/stripe'
export interface Plan {
  Standard: number,
  Professional: number,
  Enterprise: number
}

export interface CreateArgs {
  email: string,
  plans: StripePlan[],
  name: string,
  coupon: string, 
  token: string
}

export interface UpdatePaymentArgs {
  token: string
}