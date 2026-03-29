import { Response } from 'express'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function success<T>(res: Response, data: T, statusCode: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data
  }
  return res.status(statusCode).json(response)
}

export function error(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: Array<{ field: string; message: string }>
): Response {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  }
  return res.status(statusCode).json(response)
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number
): Response {
  const totalPages = Math.ceil(total / pageSize)
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  }
  return res.status(200).json(response)
}

export function created<T>(res: Response, data: T): Response {
  return success(res, data, 201)
}

export function noContent(res: Response): Response {
  return res.status(204).send()
}

export function badRequest(res: Response, message: string = '请求参数错误'): Response {
  return error(res, 'BAD_REQUEST', message, 400)
}

export function unauthorized(res: Response, message: string = '未授权访问'): Response {
  return error(res, 'UNAUTHORIZED', message, 401)
}

export function forbidden(res: Response, message: string = '权限不足'): Response {
  return error(res, 'FORBIDDEN', message, 403)
}

export function notFound(res: Response, message: string = '资源不存在'): Response {
  return error(res, 'NOT_FOUND', message, 404)
}

export function conflict(res: Response, message: string = '资源冲突'): Response {
  return error(res, 'CONFLICT', message, 409)
}

export function validationError(
  res: Response,
  message: string = '参数验证失败',
  details?: Array<{ field: string; message: string }>
): Response {
  return error(res, 'VALIDATION_ERROR', message, 422, details)
}

export function tooManyRequests(res: Response, message: string = '请求过于频繁'): Response {
  return error(res, 'RATE_LIMIT_EXCEEDED', message, 429)
}

export function internalError(res: Response, message: string = '服务器内部错误'): Response {
  return error(res, 'INTERNAL_ERROR', message, 500)
}

export default {
  success,
  error,
  paginated,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  tooManyRequests,
  internalError
}
