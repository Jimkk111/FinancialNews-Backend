import { Request, Response, NextFunction } from 'express'
import { error } from '../utils/response'
import logger from '../utils/logger'

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(`Error: ${err.message}`, { stack: err.stack })

  if (err instanceof AppError) {
    return error(res, err.message, err.code, err.statusCode)
  }

  return error(res, '服务器内部错误', 'INTERNAL_ERROR', 500)
}

export const notFoundHandler = (
  req: Request,
  res: Response
): Response => {
  return error(res, `路由 ${req.method} ${req.path} 不存在`, 'NOT_FOUND', 404)
}
