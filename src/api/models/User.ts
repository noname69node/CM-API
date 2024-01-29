import { DataTypes, Model } from 'sequelize'
import PostgresDatabase from '../../db/PostgresDatabase'
import bcrypt from 'bcrypt'

PostgresDatabase.initialize('postgresql://postgresadmin:secret@postgres:5432/mydatabase')

// Extend the Model class with UserAttributes and any potential creation attributes
class User extends Model {
  public id?: number
  public username!: string // Added username
  public email!: string
  public password!: string
  public fullName?: string
  public dateOfBirth?: Date
  public profilePictureUrl?: string
  public role!: 'admin' | 'manager' | 'user'
  public status!: 'active' | 'inactive' | 'suspended'
  public lastLogin?: Date
  public phoneNumber?: string
  // Address fields can be simple or complex depending on requirements
  public addressLine1?: string
  public addressLine2?: string
  public city?: string
  public state?: string
  public postalCode?: string
  public country?: string

  // Timestamps are automatically added by Sequelize, but could also be included explicitly
  public readonly createdAt?: Date
  public readonly updatedAt?: Date
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    profilePictureUrl: {
      type: DataTypes.STRING,
      allowNull: true
      // validate: {
      //   isUrl: true
      // }
    },
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'manager', 'user'],
      allowNull: false,
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'inactive', 'suspended'],
      allowNull: false,
      defaultValue: 'active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Define the address fields as needed
    addressLine1: DataTypes.STRING,
    addressLine2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    country: DataTypes.STRING
  },
  {
    sequelize: PostgresDatabase.getInstance().sequelize, // Use the Sequelize instance from your Singleton
    modelName: 'User',
    tableName: 'users',
    paranoid: true,
    hooks: {
      async beforeCreate(user) {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      },
      async beforeUpdate(user) {
        // Check if the password field is being updated
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      }
    }
  }
)

// User.sync({ force: true })
User.sync()

export default User
