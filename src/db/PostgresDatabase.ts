import { Sequelize } from 'sequelize-typescript'
import path from 'path'

class PostgresDatabase {
  private static instance: PostgresDatabase
  public sequelize: Sequelize

  private constructor() {
    this.sequelize = new Sequelize({
      dialect: 'postgres',
      host: 'postgres',
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      models: [path.resolve(__dirname, '../api/models')]
    })
    //this.sequelize.sync({ force: true })
  }

  public static getInstance(): PostgresDatabase {
    if (!PostgresDatabase.instance) {
      PostgresDatabase.instance = new PostgresDatabase()
    }

    return PostgresDatabase.instance
  }

  public async initialize(): Promise<void> {
    try {
      await this.sequelize.authenticate()
      console.log('Connection to PostgreSQL has been established successfully.')
    } catch (error) {
      console.error('Unable to connect to PostgreSQL:', error)
    }
  }

  public async testConnection(): Promise<void> {
    try {
      await this.sequelize.authenticate()
      console.log('TEST: Connection to PostgreSQL has been established successfully.')
    } catch (error) {
      console.error('Unable to connect to PostgreSQL:', error)
    }
  }
}

export default PostgresDatabase
