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

export const LoginParams = {
  Login : [AuthParamNames.Username, AuthParamNames.Password],
  Refresh : [AuthParamNames.RefreshToken],
  ConfirmNewPassword : [AuthParamNames.Username, AuthParamNames.Session, AuthParamNames.NewPassword],
  ConfirmMFALogin : [AuthParamNames.Username, AuthParamNames.Session, AuthParamNames.MFALoginCode],
  ConfirmMFASetup : [AuthParamNames.Session, AuthParamNames.MFASetupCode]
}

export enum LoginActions {
  Login = 'LOGIN',
  Refresh = 'REFRESH',
  ConfirmNewPassword = 'CONFIRM_NEW_PASSWORD',
  ConfirmMFALogin = 'CONFIRM_MFA_LOGIN',
  ConfirmMFASetup = 'CONFIRM_MFA_SETUP'
}
function matchLoginBody(body:Object){
  if (bodyHas(body, LoginParams.Login)) {
      return LoginActions.Login;
  } else if (bodyHas(body, LoginParams.Refresh)) {
      return LoginActions.Refresh;
  } else if (bodyHas(body, LoginParams.ConfirmNewPassword)) {
      return LoginActions.ConfirmNewPassword;
  } else if (bodyHas(body, LoginParams.ConfirmMFALogin)) {
      return LoginActions.ConfirmMFALogin;
  } else if (bodyHas(body, LoginParams.ConfirmMFASetup)) {
      return LoginActions.ConfirmMFASetup;
  } else {
      return false;
  }
}