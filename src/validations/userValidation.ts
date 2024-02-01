import Joi from 'joi'

export const createUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('admin', 'manager', 'user').required(),
  status: Joi.string().valid('active', 'inactive', 'suspended').required(),
  lastLogin: Joi.date().allow(null),
  profile: Joi.object({
    fullName: Joi.string().required(),
    dateOfBirth: Joi.date(),
    profilePictureUrl: Joi.string(),
    phoneNumber: Joi.string(),
    addressLine: Joi.string(),
    city: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string()
  }).required()
})
