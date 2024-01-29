import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import apiRouter from './api/routes'
import { CustomError } from './utils/errors/CustomError'
import PostgresDatabase from './db/PostgresDatabase'

class App {
  public app: Express

  constructor() {
    this.app = express()
    this.initDatabases()
    this.setMiddleware()
    this.setRoutes()
    this.setErrorHandler()
  }

  private initDatabases(): void {
    try {
      PostgresDatabase.initialize('postgresql://postgresadmin:secret@postgres:5432/mydatabase')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      process.exit(1)
    }

    // const db = new PostgresDatabase()
    // db.sequelize?.sync()
  }

  private setMiddleware(): void {
    this.app.use(express.json())
    this.app.use(cors())
  }

  private setRoutes(): void {
    this.app.use('/test', (req, res) => {
      res.send('Hello from API')
    })

    this.app.use('/api', apiRouter)
  }

  private setErrorHandler(): void {
    this.app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
      // console.log('Error', err)

      const statusCode = err.statusCode || 500

      res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: err.message || 'Internal Server Error'
      })
    })
  }

  public startServer(port: string | number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  }
}

export default App
