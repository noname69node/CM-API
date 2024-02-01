import Joi from 'joi'

interface ICustomError extends Error {
  statusCode: number
  // Define other common properties here, e.g., details, errorCode, etc.
}

export class ValidationError extends Error implements ICustomError {
  statusCode: number
  details: any[]

  constructor(joiError: Joi.ValidationError, statusCode: number = 400) {
    super(joiError.message)
    this.name = 'ValidationError'
    this.statusCode = statusCode
    this.details = joiError.details.map((detail) => ({
      message: detail.message,
      path: detail.path.join('.'),
      type: detail.type,
      context: detail.context
    }))

    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
