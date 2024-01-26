import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())

// API Routes
app.use('/api', (req, res) => {
  res.send('Hello from API')
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle errors
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
