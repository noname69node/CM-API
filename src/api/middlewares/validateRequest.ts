import { Request, Response, NextFunction } from 'express'
import Joi, { x } from 'joi'
import { ValidationError } from '../../utils/errors/ValidationError'

// export const validateRequest = (schema: Joi.ObjectSchema) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const { error } = schema.validate(req.body, { abortEarly: false })
//     if (error) {
//       const errors = error.details.map((err) => err.message)
//       return res.status(400).json({ errors })
//     }
//     next()
//   }
// }

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false })
      next()
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        console.log('first error')
        throw new ValidationError(error)
      }
      console.log('second error')
      next(error)
    }
  }
}
