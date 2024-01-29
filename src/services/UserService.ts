import User from '../api/models/User'
import { CustomError } from '../utils/errors/CustomError'
import bcrypt from 'bcrypt'
import logger from '../utils/logger'

export class UserService {
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
  public async createUser(userData: User): Promise<User> {
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
      const newUser = await User.create({ ...userData })
      logger.info(`User with ID ${newUser.id} created successffully`)
      return newUser
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
      return await User.findAll({ attributes: { exclude: ['password'] } })
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

  /**
   * Soft deletes a user by their ID. The user is not permanently removed from the database but marked as deleted.
   * @param userId - The ID of the user to be soft deleted.
   * @returns A Promise that resolves when the user has been soft deleted.
   * @throws CustomError with a specific error message if an error occurs during the deletion process or if the user does not exist.
   */
  public async softDeleteUserById(userId: number): Promise<void> {
    try {
      const user = await User.findByPk(userId)

      if (!user) {
        logger.warn(`User with ID ${userId} does not exist.`)
        throw new CustomError('User not found.', 404)
      }

      await user.destroy()
      logger.info(`User with ID ${userId} has been soft deleted.`)
    } catch (error) {
      throw error
    }
  }

  /**
   * Permanently deletes a user by their ID. This action bypasses the soft delete mechanism and cannot be undone.
   * @param userId - The ID of the user to be permanently deleted.
   * @returns A Promise that resolves when the user has been permanently deleted.
   * @throws CustomError with a specific error message if an error occurs during the deletion process or if the user does not exist.
   */
  public async deleteUserById(userId: number): Promise<void> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        paranoid: false
      })

      if (!user) {
        logger.warn(`User with ID ${userId} does not exist.`)
        throw new CustomError('User not found.', 404)
      }

      await user.destroy({
        force: true
      })
      logger.info(`User with ID ${userId} has been permanently deleted.`)
    } catch (error) {
      throw error
    }
  }

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
