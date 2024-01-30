import User from '../api/models/User'
import { CustomError } from '../utils/errors/CustomError'
import bcrypt from 'bcrypt'
import logger from '../utils/logger'
import UserProfile from '../api/models/UserProfile'
import { Op, Sequelize, Transaction } from 'sequelize'
import PostgresDatabase from '../db/PostgresDatabase'

type CreateUserInput = User & UserProfile

interface UserData {
  id: number
  username: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  fullName?: string
  dateOfBirth?: Date
  profilePictureUrl?: string
  phoneNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface UserWithProfile {
  user: User
  profile: UserProfile
}

interface UserWithOptionalProfile {
  user: User
  profile?: UserProfile // UserProfile is optional
}

export class UserService {
  private sequelize: Sequelize

  constructor() {
    this.sequelize = PostgresDatabase.getInstance().sequelize
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  /**
   * Creates a new user in the system.
   * @param userData - The data of the user to be created.
   * @returns A Promise that resolves to the created user, or null if the user already exists.
   * @throws CustomError with a specific error message if an error occurs while creating the user.
   */
  public async createUser(userData: UserData): Promise<UserWithProfile> {
    // Check if a user with the same email already exists
    if (await this.doesEmailExist(userData.email)) {
      logger.warn(`User with email ${userData.email} already exists.`)
      throw new CustomError('User with this email already exists.', 400)
    }

    // Check if a user with the same username already exists
    if (await this.doesUsernameExist(userData.username)) {
      logger.warn(`User with username ${userData.username} already exists.`)
      throw new CustomError('User with this username already exists.', 400)
    }

    // Create a new user with the provided data
    try {
      const result = this.sequelize.transaction(async (t: Transaction) => {
        const newUser = await User.create({ ...userData }, { transaction: t })
        const newUserProfile = await UserProfile.create({ ...userData, userId: newUser.id }, { transaction: t })

        return { user: newUser, profile: newUserProfile }
      })

      logger.info(`User with ID ${(await result).user.id} created successffully`)
      return result
    } catch (error) {
      throw new CustomError('Error creating user. ' + error, 500)
    }
  }

  /**
   * Retrieves all users from the system.
   * @returns A Promise that resolves to an array of all users, excluding their passwords.
   * @throws CustomError with a specific error message if an error occurs while retrieving users.
   */
  public async getAllUsers(): Promise<User[] | null> {
    try {
      return await User.findAll({ attributes: { exclude: ['password'] }, paranoid: false })
    } catch (error) {
      throw new CustomError('Failed to retrieve users.', 500)
    }
  }

  /**
   * Retrieves a single user by their ID.
   * @param userId - The ID of the user to be retrieved.
   * @returns A Promise that resolves to the user with the specified ID, excluding their password, or null if no user is found.
   * @throws CustomError with a specific error message if an error occurs while retrieving the user.
   */
  public async getUserById(userId: number): Promise<User | null> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    })
    if (!user) {
      logger.warn(`User with ID ${userId} does not exist.`)
      throw new CustomError('User not found.', 404)
    }
    return user
  }

  /**
   * Retrieves a single user by their ID with his profile.
   * @param userId - The ID of the user to be retrieved.
   * @returns A Promise that resolves to the user with the specified ID, excluding their password, or null if no user is found.
   * @throws CustomError with a specific error message if an error occurs while retrieving the user.
   */
  public async getUserByIdWithProfile(userId: number): Promise<UserWithOptionalProfile | null> {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: UserProfile,
            as: 'profile'
          }
        ]
      })
      if (!user) {
        logger.warn(`User with ID ${userId} does not exist.`)
        throw new CustomError('User not found.', 404)
      }

      const { profile, ...userData } = user.toJSON()

      return { user: userData, profile }
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates the details of an existing user by their ID.
   *
   * This method checks for the existence of the user and the uniqueness of the email (if updated).
   * It then proceeds to update the user with the provided data.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param updateData - The data to update the user with. Can include any user fields.
   * @returns A Promise that resolves to the updated user object, or null if the user could not be found.
   * @throws CustomError - Throws an error if the user could not be found, or if the new email is already in use.
   */
  public async updateUserById(userId: number, updateData: Partial<User>): Promise<User | null> {
    try {
      const user = await User.findByPk(userId)
      if (!user) {
        logger.warn(`User with ID ${userId} does not exist.`)
        throw new CustomError('User not found.', 404)
      }

      // Prevent username updates
      if ('username' in updateData) {
        logger.warn(`Attempted to update username for user ID ${userId}, which is not allowed.`)
        throw new CustomError('Username cannot be changed.', 400)
      }

      // Check for email uniqueness if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } })
        if (existingUser && existingUser.id !== userId) {
          logger.warn(`User with ${updateData.email} already exist.`)
          throw new CustomError('Email already in use.', 400)
        }
      }

      const updatedUser = await user.update(updateData)
      logger.info(`User with ID ${userId} has been updated.`)
      return updatedUser
    } catch (error) {
      logger.error(`Error updating user ${userId}: ${error}`)
      throw error
    }
  }

  public async updateUserProfileById(userId: number, updateData: Partial<UserProfile>): Promise<UserProfile | null> {
    return null
  }

  /**
   * Soft deletes a user and his profile by their ID. The user is not permanently removed from the database but marked as deleted.
   * @param userId - The ID of the user to be soft deleted.
   * @returns A Promise that resolves when the user has been soft deleted.
   * @throws CustomError with a specific error message if an error occurs during the deletion process or if the user does not exist.
   */
  public async softDeleteUserById(userIds: number | number[]): Promise<void> {
    const transaction = await PostgresDatabase.getInstance().sequelize.transaction()
    const idsArray = Array.isArray(userIds) ? userIds : [userIds]

    try {
      // Check for empty array
      if (idsArray.length === 0) {
        throw new Error('No user IDs provided for deletion.')
      }

      await this.sequelize.transaction(async (transaction) => {
        // Soft delete user profiles
        await UserProfile.destroy({
          where: {
            userId: {
              [Op.in]: idsArray // Targets profiles by user IDs
            }
          },
          transaction
        })

        // Soft delete users
        await User.destroy({
          where: {
            id: {
              [Op.in]: idsArray // Targets users by IDs
            }
          },
          transaction
        })
      })
      logger.info(`User with ID ${userIds} has been soft deleted.`)
    } catch (error) {
      throw error
    }
  }

  /**
   * Permanently deletes a user and his profile by their ID. This action bypasses the soft delete mechanism and cannot be undone.
   * @param userId - The ID of the user to be permanently deleted.
   * @returns A Promise that resolves when the user has been permanently deleted.
   * @throws CustomError with a specific error message if an error occurs during the deletion process or if the user does not exist.
   */
  public async deleteUserById(userId: number): Promise<void> {
    const transaction = await PostgresDatabase.getInstance().sequelize.transaction()

    try {
      const user = await User.findOne({
        where: { id: userId },
        paranoid: false,
        transaction
      })

      if (!user) {
        logger.warn(`User with ID ${userId} does not exist.`)
        throw new CustomError('User not found.', 404)
      }

      await UserProfile.destroy({
        where: { userId: userId },
        transaction,
        force: true // Ensures the record is permanently deleted
      })

      await user.destroy({
        force: true,
        transaction
      })
      await transaction.commit()
      logger.info(`User with ID ${userId} has been permanently deleted.`)
    } catch (error) {
      await transaction.rollback()

      throw error
    }
  }

  public async unDeleteUserById(userIds: number | number[]): Promise<void> {}

  /**
   * Checks if a username already exists in the system.
   *
   * This method queries the database for a user with the specified username.
   * It is used to ensure usernames are unique across the system.
   *
   * @param username - The username to check for existence.
   * @returns A Promise that resolves to a boolean indicating whether the username exists (true) or not (false).
   */
  public async doesUsernameExist(username: string): Promise<boolean> {
    const user = await User.findOne({ where: { username } })
    return !!user
  }

  /**
   * Checks if an email already exists in the system.
   *
   * This method queries the database for a user with the specified email.
   * It is used to prevent duplicate user accounts with the same email.
   *
   * @param email - The email to check for existence.
   * @returns A Promise that resolves to a boolean indicating whether the email exists (true) or not (false).
   */
  public async doesEmailExist(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } })
    return !!user
  }
}
