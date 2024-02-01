import { Request, Response } from 'express'
import { UserService } from '../../services/UserService'
import { asyncWrapper } from '../../utils/asyncWrapper'
import { CustomError } from '../../utils/errors/CustomError'
import { User } from '../models/User'

import Joi = require('joi')

interface CreateUserInput {
  username: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  profile: {
    fullName: string
    dateOfBirth?: Date
    profilePictureUrl?: string
    phoneNumber?: string
    addressLine?: string
    city?: string
    postalCode?: string
    country?: string
  }
}
export class UserController {
  private userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }

  public createUser = asyncWrapper(async (req: Request, res: Response) => {
    const user: CreateUserInput = req.body
    const newUser = await this.userService.createUser(user)
    res.status(201).json(newUser)
  })

  // public getAllUsers = asyncWrapper(async (req: Request, res: Response) => {
  //   const users = await this.userService.getAllUsers()
  //   res.json(users)
  // })

  // public getUserById = asyncWrapper(async (req: Request, res: Response) => {
  //   const userId = parseInt(req.params.userId) // Assuming 'id' is the URL parameter
  //   const user = await this.userService.getUserById(userId)
  //   res.status(200).json(user)
  // })

  // public getUserByIdWithProfile = asyncWrapper(async (req: Request, res: Response) => {
  //   const userId = parseInt(req.params.userId) // Assuming 'id' is the URL parameter
  //   const userWithProfile = await this.userService.getUserByIdWithProfile(userId)
  //   res.status(200).json(userWithProfile)
  // })

  // public updateUserById = asyncWrapper(async (req: Request, res: Response) => {
  //   const userId = parseInt(req.params.userId)
  //   const updateData = req.body
  //   const updatedUser = await this.userService.updateUserById(userId, updateData)
  //   res.status(200).json(updatedUser)
  // })

  // public softDeleteUserById = asyncWrapper(async (req: Request, res: Response) => {
  //   const userId = parseInt(req.params.userId)
  //   await this.userService.softDeleteUserById(userId)
  //   res.status(200).json({
  //     status: 'success',
  //     statusCode: 200,
  //     message: 'User soft deleted successfully.',
  //     user: {
  //       id: userId,
  //       deletedAt: Date.now()
  //     }
  //   })
  // })

  // public softDeleteUserByIds = asyncWrapper(async (req: Request, res: Response) => {
  //   const ids = req.body.ids
  //   await this.userService.softDeleteUserById(ids)
  //   res.status(200).json({
  //     status: 'success',
  //     statusCode: 200,
  //     message: 'User soft deleted successfully.',
  //     user: {
  //       id: ids,
  //       deletedAt: Date.now()
  //     }
  //   })
  // })

  // public deleteUserById = asyncWrapper(async (req: Request, res: Response) => {
  //   const userId = parseInt(req.params.userId)
  //   await this.userService.deleteUserById(userId)
  //   res.status(200).json({
  //     message: 'User deleted successfully.'
  //   })
  // })

  // public checkUsernameExistence = asyncWrapper(async (req: Request, res: Response) => {
  //   const { username } = req.query
  //   if (!username) {
  //     throw new CustomError('Username query parameter is required.', 400)
  //   }
  //   const exists = await this.userService.doesUsernameExist(username as string)
  //   res.json({ exists })
  // })

  // public checkEmailExistence = asyncWrapper(async (req: Request, res: Response) => {
  //   const { email } = req.query
  //   if (!email) {
  //     throw new CustomError('Email query parameter is required.', 400)
  //   }
  //   const exists = await this.userService.doesEmailExist(email as string)
  //   res.json({ exists })
  // })
}
