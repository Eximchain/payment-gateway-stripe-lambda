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