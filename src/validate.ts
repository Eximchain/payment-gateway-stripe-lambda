import { HttpMethods } from '@eximchain/dappbot-types/spec/responses';

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

export function isHTTPMethod(method:string, HTTPMethod:HttpMethods){
  return method.toUpperCase() === HTTPMethod;
}