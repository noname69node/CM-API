import { Router } from 'express'
import { userRoutes } from './userRoutes'

const apiRouter = Router()

apiRouter.use('/users', userRoutes)

export default apiRouter
