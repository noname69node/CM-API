import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { UserService } from '../../services/UserService'

export const userRoutes = Router()

const userService = new UserService()
const userController = new UserController(userService)

userRoutes.post('/', userController.createUser)
userRoutes.get('/', userController.getAllUsers)
userRoutes.get('/username-exists', userController.checkUsernameExistence)
userRoutes.get('/email-exists', userController.checkEmailExistence)
userRoutes.get('/:userId', userController.getUserById)
userRoutes.put('/:userId', userController.updateUserById)
userRoutes.delete('/:userId/soft', userController.softDeleteUserById)
userRoutes.delete('/:userId/force', userController.deleteUserById)
