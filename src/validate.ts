function bodyHas(body:Object, propertyNames:string[]){
  return propertyNames.every(name => body.hasOwnProperty(name))
}

export enum UpdateParamNames {
  Plans = 'plans',
  Token = 'token'
}

export const UpdateUserParams = {
  UpdatePlan : [UpdateParamNames.Plans],
  UpdatePayment: [UpdateParamNames.Token]
}

export enum UpdateUserActions {
  UpdatePlan = 'UPDATE_PLAN',
  UpdatePayment = 'UPDATE_PAYMENT'
}
export function matchUpdateBody(body:Object){
  if (bodyHas(body, UpdateUserParams.UpdatePlan)){
    return UpdateUserActions.UpdatePlan
  } else if (bodyHas(body, UpdateUserParams.UpdatePayment)){
    return UpdateUserActions.UpdatePayment
  } else {
    return false;
  }
}