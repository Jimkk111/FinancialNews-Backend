import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/token'
import { error } from '../utils/response'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return error(res, '未提供认证令牌', 'UNAUTHORIZED', 401)
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return error(res, '无效或过期的令牌', 'INVALID_TOKEN', 401)
  }

  req.user = decoded
  next()
}

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}
