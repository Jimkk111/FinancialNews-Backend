import { Response } from 'express'
import { ApiResponse } from '../types'

export const success = <T>(res: Response, data: T, statusCode = 200): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data
  }
  return res.status(statusCode).json(response)
}

export const error = (
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500
): Response => {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message }
  }
  return res.status(statusCode).json(response)
}

export const paginated = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number
): Response => {
  return success(res, {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  })
}
