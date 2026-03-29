import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import { generalLimiter } from './middlewares/rateLimit.middleware'
import routes from './routes'
import { log } from './utils/logger'
import { warmup } from './services/cache.service'

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

const uploadDir = process.env.UPLOAD_DIR || 'uploads'
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)))

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

app.use('/api', generalLimiter, routes)

app.use(notFoundHandler)

app.use(errorHandler)

warmup().catch((err) => {
  log.error('App', '缓存预热失败', err)
})

export default app
