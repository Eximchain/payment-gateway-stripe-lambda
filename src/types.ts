import {StripePlans} from './services/stripe'


export interface CreateArgs {
  email: string,
  plans: StripePlans,
  name: string,
  coupon: string, 
  token: string
}

export interface UpdatePaymentArgs {
  token: string
}