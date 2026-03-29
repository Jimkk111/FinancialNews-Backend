import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { AppError, ErrorCode } from '../types'
import { error } from '../utils/response'
import { log } from '../utils/logger'

interface PrismaError {
  code: string
  meta?: {
    target?: string[]
    modelName?: string
  }
  message: string
}

function handlePrismaError(err: PrismaError): { code: ErrorCode; message: string; statusCode: number } {
  switch (err.code) {
    case 'P2002':
      const field = err.meta?.target?.[0] || '资源'
      return {
        code: ErrorCode.DUPLICATE_ENTRY,
        message: `${field}已存在`,
        statusCode: 409
      }
    case 'P2025':
      return {
        code: ErrorCode.NOT_FOUND,
        message: '资源不存在',
        statusCode: 404
      }
    case 'P2003':
      return {
        code: ErrorCode.BAD_REQUEST,
        message: '关联资源不存在',
        statusCode: 400
      }
    case 'P2014':
      return {
        code: ErrorCode.BAD_REQUEST,
        message: '关联关系无效',
        statusCode: 400
      }
    default:
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: '数据库操作失败',
        statusCode: 500
      }
  }
}

function isError(err: unknown): err is Error {
  return err instanceof Error
}

export function errorHandler(
  err: Error | AppError | PrismaError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const isProduction = process.env.NODE_ENV === 'production'

  if (err instanceof AppError) {
    log.error('AppError', err.message, {
      requestId: req.headers['x-request-id'] as string,
      ip: req.ip,
      path: req.path,
      method: req.method
    }, err)

    return error(res, err.code, err.message, err.statusCode, err.details)
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { code, message, statusCode } = handlePrismaError(err as unknown as PrismaError)
    
    log.error('PrismaError', message, {
      requestId: req.headers['x-request-id'] as string,
      ip: req.ip,
      path: req.path,
      method: req.method,
      prismaCode: err.code
    }, err)

    return error(res, code, message, statusCode)
  }

  if (isError(err)) {
    if (err.name === 'UnauthorizedError' || err.message.includes('jwt')) {
      log.warn('AuthError', err.message, {
        ip: req.ip,
        path: req.path
      })

      return error(res, ErrorCode.UNAUTHORIZED, '认证失败', 401)
    }

    if (err.name === 'SyntaxError' && 'body' in err) {
      return error(res, ErrorCode.BAD_REQUEST, '请求体格式错误', 400)
    }

    log.error('UnhandledError', err.message, {
      requestId: req.headers['x-request-id'] as string,
      ip: req.ip,
      path: req.path,
      method: req.method
    }, err)

    const message = isProduction ? '服务器内部错误' : err.message
    return error(res, ErrorCode.INTERNAL_ERROR, message, 500)
  }

  return error(res, ErrorCode.INTERNAL_ERROR, '服务器内部错误', 500)
}

export function notFoundHandler(req: Request, res: Response): Response {
  log.warn('NotFound', `路由不存在: ${req.method} ${req.path}`, {
    ip: req.ip,
    path: req.path,
    method: req.method
  })

  return error(res, ErrorCode.NOT_FOUND, `路由不存在: ${req.method} ${req.path}`, 404)
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler
}
