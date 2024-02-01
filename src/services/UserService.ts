import { User } from '../api/models/User'
import { UserProfile } from '../api/models/UserProfile'
import PostgresDatabase from '../db/PostgresDatabase'
import { CustomError } from '../utils/errors/CustomError'

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

export class UserService {
  public async createUser(userData: CreateUserInput): Promise<User | null> {
    const db = PostgresDatabase.getInstance()
    const transaction = await db.sequelize.transaction()

    const { profile, ...userInput } = userData

    if (await this.doesUsernameExist(userInput.username)) {
      throw new CustomError('Username already exists', 400)
    }

    if (await this.doesEmailExist(userInput.email)) {
      throw new CustomError('Email already exists', 400)
    }

    try {
      const user = await User.create(userInput as User, { transaction })
      const userProfile = await UserProfile.create({ ...profile, userId: user.id } as UserProfile, {
        transaction
      })
      user.profile = userProfile

      await transaction.commit()
      console.log(user)
      return user
    } catch (error) {
      await transaction.rollback()
      throw new Error(`Failed to create user and profile: ${error}`)
    }
  }

  public async doesUsernameExist(username: string): Promise<boolean> {
    const user = await User.findOne({ where: { username } })
    return !!user
  }

  public async doesEmailExist(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } })
    return !!user
  }
}
