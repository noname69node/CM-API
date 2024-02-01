interface ICustomError extends Error {
  statusCode: number
  // Define other common properties here, e.g., details, errorCode, etc.
}
export class CustomError extends Error implements ICustomError {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}
