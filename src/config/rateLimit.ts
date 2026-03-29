import { Request } from 'express'

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: '请求过于频繁，请稍后再试'
  },
  sendCode: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: '验证码发送过于频繁，请1小时后再试'
  },
  ai: {
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: 'AI对话次数已达上限，请稍后再试'
  },
  upload: {
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: '上传次数已达上限，请稍后再试'
  },
  search: {
    windowMs: 60 * 1000,
    max: 30,
    message: '搜索请求过于频繁，请稍后再试'
  },
  general: {
    windowMs: 60 * 1000,
    max: 100,
    message: '请求过于频繁，请稍后再试'
  }
}

export function getRateLimitConfig(name: keyof typeof rateLimitConfigs): RateLimitConfig {
  return { ...rateLimitConfigs[name] }
}

export function createKeyGenerator(prefix: string): (req: Request) => string {
  return (req: Request): string => {
    const userId = req.user?.uid
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    return userId ? `${prefix}:user:${userId}` : `${prefix}:ip:${ip}`
  }
}

export function createIPKeyGenerator(prefix: string): (req: Request) => string {
  return (req: Request): string => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    return `${prefix}:ip:${ip}`
  }
}

export function createUserKeyGenerator(prefix: string): (req: Request) => string {
  return (req: Request): string => {
    const userId = req.user?.uid || 'anonymous'
    return `${prefix}:user:${userId}`
  }
}
