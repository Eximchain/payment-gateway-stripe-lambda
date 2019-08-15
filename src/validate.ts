import { HTTPMethods } from './responses';

export class UserError {
  name: string
  message: string
  constructor(message:string) {
    this.name = 'UserError'
    this.message = message
  }
  toString():string { 
    return this.message 
  }
}

function bodyHas(body:Object, propertyNames:string[]){
  return propertyNames.every(name => body.hasOwnProperty(name))
}

export function isHTTPMethod(method:string, HTTPMethod:HTTPMethods){
  return method.toUpperCase() === HTTPMethod;
}

export enum UpdateParamNames {
  Plans = 'plans',
  Token = 'token'
}

export const UpdateUserParams = {
  UpdatePlan : [ UpdateParamNames.Plans],
  UpdatePayment: [UpdateParamNames.Token]
}

export enum UpdateUserActions {
  UpdatePlan = 'UPDATE_PLAN',
  UpdatePayment = 'UPDATE_PAYMENT'
}
export function matchUpdateBody(body:string){
  const bodyParsed = JSON.parse(body)
  if (bodyHas(bodyParsed, UpdateUserParams.UpdatePlan)){
    return UpdateUserActions.UpdatePlan
  } else if (bodyHas(bodyParsed, UpdateUserParams.UpdatePayment)){
    return UpdateUserActions.UpdatePayment
  } else {
    return false;
  }
}