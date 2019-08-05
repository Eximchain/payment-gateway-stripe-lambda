function bodyHas(body:Object, propertyNames:string[]){
  return propertyNames.every(name => body.hasOwnProperty(name))
}

export enum AuthParamNames {
  Username = 'username',
  Password = 'password',
  RefreshToken = 'refreshToken',
  NewPassword = 'newPassword',
  Session = 'session',
  MFALoginCode = 'mfaLoginCode',
  MFASetupCode = 'mfaSetupCode',
  PasswordResetCode = 'passwordResetCode'
}

export enum UpdateParamNames {
  Plan = 'plan',
  Payment = 'payment'
}

export const UpdateUserParams = {
  UpdatePlan : [AuthParamNames.Username, AuthParamNames.Session, UpdateParamNames.Plan],
  UpdatePayment: [AuthParamNames.Username, AuthParamNames.Session, UpdateParamNames.Payment]
}

export enum UpdateUserActions {
  UpdatePlan = 'UPDATE_PLAN',
  UpdatePayment = 'UPDATE_PAYMENT'
}
function matchLoginBody(body:Object){
  if (bodyHas(body, UpdateUserParams.UpdatePlan)){
    return UpdateUserActions.UpdatePlan
  } else if (bodyHas(body, UpdateUserParams.UpdatePayment)){
    return UpdateUserActions.UpdatePayment
  } else {
    return false;
  }
}