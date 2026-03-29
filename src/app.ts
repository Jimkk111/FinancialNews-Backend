import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import routes from './routes'
import { log } from './utils/logger'

dotenv.config()

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true
}))

app.use(compression())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      log.info('HTTP', message.trim())
    }
  }
}))

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  res.setHeader('X-Request-ID', requestId)
  next()
})

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })
})

app.use('/api', routes)

app.use(notFoundHandler)

app.use(errorHandler)

export default app
