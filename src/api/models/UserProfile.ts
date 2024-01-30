import { DataTypes, Model } from 'sequelize'
import PostgresDatabase from '../../db/PostgresDatabase'
import User from './User'

PostgresDatabase.initialize('postgresql://postgresadmin:secret@postgres:5432/mydatabase')

class UserProfile extends Model {
  public userId!: number // Foreign Key
  public fullName?: string
  public dateOfBirth?: Date
  public profilePictureUrl?: string
  public phoneNumber?: string
  // Address fields can be simple or complex depending on requirements
  public addressLine1?: string
  public addressLine2?: string
  public city?: string
  public state?: string
  public postalCode?: string
  public country?: string
}

UserProfile.init(
  {
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
    modelName: 'UserProfile',
    tableName: 'user_profiles',
    paranoid: true
  }
)

User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' })
UserProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
})

// UserProfile.sync({ force: true })
UserProfile.sync()

export default UserProfile
