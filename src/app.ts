import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from './config'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'
import { apiLimiter } from './middlewares/rateLimit.middleware'
import logger from './utils/logger'

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'))
}

app.use('/uploads', express.static('uploads'))

app.use(apiLimiter)

app.use(config.apiPrefix, routes)

app.use(notFoundHandler)
app.use(errorHandler)

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
      logger.info(`Environment: ${config.nodeEnv}`)
      logger.info(`API prefix: ${config.apiPrefix}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
