import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  IsDate,
  IsUrl,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript'
import { User } from './User' // Adjust the import path as necessary

@Table({
  tableName: 'user_profiles',
  paranoid: true // Enables soft delete (it will use the deletedAt column)
})
export class UserProfile extends Model<UserProfile> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  fullName?: string

  @IsDate
  @Column(DataType.DATEONLY)
  dateOfBirth?: Date | null

  @IsUrl
  @Column(DataType.STRING)
  profilePictureUrl?: string | null

  @Column(DataType.STRING)
  phoneNumber?: string | null

  @Column(DataType.STRING)
  addressLine?: string | null

  @Column(DataType.STRING)
  city?: string | null

  @Column(DataType.STRING)
  postalCode?: string | null

  @Column(DataType.STRING)
  country?: string | null

  @BelongsTo(() => User)
  user!: User
}
