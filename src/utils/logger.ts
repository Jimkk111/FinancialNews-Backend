import winston from 'winston'
import path from 'path'
import fs from 'fs'

const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, module, context, stack }) => {
    const moduleStr = module ? `[${module}]` : ''
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    const stackStr = stack ? `\n${stack}` : ''
    return `${timestamp} ${level} ${moduleStr} ${message}${contextStr}${stackStr}`
  })
)

const isDevelopment = process.env.NODE_ENV !== 'production'

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: isDevelopment ? 'debug' : 'info'
  })
]

if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 14
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 14
    })
  )
}

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  transports,
  exitOnError: false
})

interface LogContext {
  userId?: number | string
  requestId?: string
  ip?: string
  [key: string]: unknown
}

function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined
  
  const sanitized: LogContext = { ...context }
  const sensitiveFields = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret']
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

export const log = {
  error: (module: string, message: string, context?: LogContext, error?: Error): void => {
    logger.error(message, {
      module,
      context: sanitizeContext(context),
      stack: error?.stack
    })
  },
  
  warn: (module: string, message: string, context?: LogContext): void => {
    logger.warn(message, {
      module,
      context: sanitizeContext(context)
    })
  },
  
  info: (module: string, message: string, context?: LogContext): void => {
    logger.info(message, {
      module,
      context: sanitizeContext(context)
    })
  },
  
  debug: (module: string, message: string, context?: LogContext): void => {
    logger.debug(message, {
      module,
      context: sanitizeContext(context)
    })
  }
}

export default logger
