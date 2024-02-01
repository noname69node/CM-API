import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { UserService } from '../../services/UserService'

import { validateRequest } from '../middlewares/validateRequest'
import { createUserSchema } from '../../validations/userValidation'

export const userRoutes = Router()

const userService = new UserService()
const userController = new UserController(userService)

userRoutes.post('/', validateRequest(createUserSchema), userController.createUser)
//userRoutes.get('/', userController.getAllUsers)
//userRoutes.get('/username-exists', userController.checkUsernameExistence)
//userRoutes.get('/email-exists', userController.checkEmailExistence)
//userRoutes.get('/:userId', userController.getUserById)
//userRoutes.get('/:userId/wp', userController.getUserByIdWithProfile)
//userRoutes.put('/:userId', userController.updateUserById)
//userRoutes.delete('/:userId/soft', userController.softDeleteUserById)
//userRoutes.post('/:userId/soft', userController.softDeleteUserByIds)
//userRoutes.delete('/:userId/force', userController.deleteUserById)
