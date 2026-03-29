import { RequestHandler, Request } from 'express'
import rateLimit from 'express-rate-limit'
import { log } from '../utils/logger'
import { RateLimitConfig, rateLimitConfigs, createKeyGenerator, createIPKeyGenerator, createUserKeyGenerator } from '../config/rateLimit'

export function createRateLimiter(config: RateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message || '请求过于频繁，请稍后再试'
      }
    },
    keyGenerator: config.keyGenerator || ((req: Request) => {
      return req.user?.uid || req.ip || 'unknown'
    }),
    skip: config.skip,
    handler: (req, res) => {
      log.warn('RateLimitMiddleware', '请求被限流', {
        ip: req.ip,
        path: req.path,
        user: req.user?.uid
      })
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message || '请求过于频繁，请稍后再试'
        }
      })
    }
  })
}

export const authLimiter = createRateLimiter({
  ...rateLimitConfigs.auth,
  keyGenerator: createIPKeyGenerator('auth')
})

export const sendCodeLimiter = createRateLimiter({
  ...rateLimitConfigs.sendCode,
  keyGenerator: createIPKeyGenerator('sendcode')
})

export const aiLimiter = createRateLimiter({
  ...rateLimitConfigs.ai,
  keyGenerator: createUserKeyGenerator('ai')
})

export const uploadLimiter = createRateLimiter({
  ...rateLimitConfigs.upload,
  keyGenerator: createUserKeyGenerator('upload')
})

export const searchLimiter = createRateLimiter({
  ...rateLimitConfigs.search,
  keyGenerator: createIPKeyGenerator('search')
})

export const generalLimiter = createRateLimiter({
  ...rateLimitConfigs.general,
  keyGenerator: createKeyGenerator('general')
})

export default {
  createRateLimiter,
  authLimiter,
  sendCodeLimiter,
  aiLimiter,
  uploadLimiter,
  searchLimiter,
  generalLimiter
}
