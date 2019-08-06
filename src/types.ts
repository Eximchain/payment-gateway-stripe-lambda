import { CreateStripeArgs, StripePlans} from './services/stripe'
export interface Plan {
  Standard: number,
  Professional: number,
  Enterprise: number
}

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