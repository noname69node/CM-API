import { Sequelize } from 'sequelize'

class PostgresDatabase {
  private static instance: PostgresDatabase
  public sequelize: Sequelize

  constructor(connectionString: string) {
    this.sequelize = new Sequelize(connectionString, {
      dialect: 'postgres',
      logging: false
    })
    this.testConnection()
  }

  public static initialize(connectionString: string): void {
    if (!PostgresDatabase.instance) {
      PostgresDatabase.instance = new PostgresDatabase(connectionString)
    }
  }

  public static getInstance(): PostgresDatabase {
    if (!PostgresDatabase.instance) {
      throw new Error('PostgresDatabase has not been initialized.')
    }
    return PostgresDatabase.instance
  }

  private async testConnection(): Promise<void> {
    try {
      await this.sequelize.authenticate()
      console.log('TEST: Connection to PostgreSQL has been established successfully.')
    } catch (error) {
      console.error('Unable to connect to PostgreSQL:', error)
    }
  }
}

export default PostgresDatabase
