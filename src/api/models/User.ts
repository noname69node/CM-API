import {
  Table,
  Column,
  Model,
  DataType,
  IsEmail,
  Length,
  IsDate,
  Default,
  AllowNull,
  Is,
  PrimaryKey,
  AutoIncrement,
  Unique,
  HasOne
} from 'sequelize-typescript'
import { UserProfile } from './UserProfile'

@Table({
  tableName: 'users',
  paranoid: true
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Unique
  @Length({ min: 3, max: 20 })
  @Is(/^[a-zA-Z]+$/) // Regex for "only letters"
  @AllowNull(false)
  @Column(DataType.STRING)
  username!: string

  @Unique
  @IsEmail
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string

  @Length({ min: 8, max: 128 })
  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string

  @Is('role', (value: string) => {
    if (value !== 'admin' && value !== 'manager' && value !== 'user') {
      throw new Error('Invalid role.')
    }
  })
  @Default('user')
  @AllowNull(false)
  @Column(DataType.ENUM('admin', 'manager', 'user'))
  role!: 'admin' | 'manager' | 'user'

  @Is('status', (value: string) => {
    if (value !== 'active' && value !== 'inactive' && value !== 'suspended') {
      throw new Error('Invalid status.')
    }
  })
  @Default('active')
  @AllowNull(false)
  @Column(DataType.ENUM('active', 'inactive', 'suspended'))
  status!: 'active' | 'inactive' | 'suspended'

  @IsDate
  @AllowNull(true)
  @Column(DataType.DATE)
  lastLogin?: Date

  @HasOne(() => UserProfile)
  profile!: UserProfile
}
