function bodyHas(body:Object, propertyNames:string[]){
  return propertyNames.every(name => body.hasOwnProperty(name))
}

export enum UpdateParamNames {
  Username = 'username',
  Plan = 'plan',
  Payment = 'payment'
}

export const UpdateUserParams = {
  UpdatePlan : [UpdateParamNames.Username, UpdateParamNames.Plan],
  UpdatePayment: [UpdateParamNames.Username, UpdateParamNames.Payment]
}

export enum UpdateUserActions {
  UpdatePlan = 'UPDATE_PLAN',
  UpdatePayment = 'UPDATE_PAYMENT'
}
export function matchLoginBody(body:Object){
  if (bodyHas(body, UpdateUserParams.UpdatePlan)){
    return UpdateUserActions.UpdatePlan
  } else if (bodyHas(body, UpdateUserParams.UpdatePayment)){
    return UpdateUserActions.UpdatePayment
  } else {
    return false;
  }
}