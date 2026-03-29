import { Request, Response, NextFunction, RequestHandler } from 'express'
import { verifyToken, extractTokenFromHeader } from '../utils/token'
import { unauthorized } from '../utils/response'
import { log } from '../utils/logger'
import { TokenPayload } from '../config/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    log.warn('Auth', '缺少认证Token', {
      ip: req.ip,
      path: req.path
    })
    unauthorized(res, '请先登录')
    return
  }

  const payload = verifyToken(token)

  if (!payload) {
    log.warn('Auth', 'Token无效或已过期', {
      ip: req.ip,
      path: req.path
    })
    unauthorized(res, 'Token无效或已过期')
    return
  }

  req.user = payload
  next()
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    next()
    return
  }

  const payload = verifyToken(token)

  if (payload) {
    req.user = payload
  }

  next()
}

export function requireAuth(): RequestHandler {
  return authenticate
}

export function requireOptionalAuth(): RequestHandler {
  return optionalAuth
}

export default {
  authenticate,
  optionalAuth,
  requireAuth,
  requireOptionalAuth
}
