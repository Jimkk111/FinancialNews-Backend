import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ZodSchema, ZodError, z } from 'zod'
import { ValidationError } from '../types'

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = {
        body: req.body,
        query: req.query,
        params: req.params
      }

      const result = schema.safeParse(data)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '参数验证失败',
            details: errors
          }
        })
        return
      }

      const parsedData = result.data as {
        body?: Record<string, unknown>
        query?: Record<string, unknown>
        params?: Record<string, string>
      }

      if (parsedData.body) {
        req.body = parsedData.body
      }
      if (parsedData.query) {
        Object.assign(req.query, parsedData.query)
      }
      if (parsedData.params) {
        Object.assign(req.params, parsedData.params)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '参数验证失败',
            details: errors
          }
        })
        return
      }

      req.body = result.data
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '参数验证失败',
            details: errors
          }
        })
        return
      }

      Object.assign(req.query, result.data)
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateParams(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '参数验证失败',
            details: errors
          }
        })
        return
      }

      Object.assign(req.params, result.data)
      next()
    } catch (error) {
      next(error)
    }
  }
}

function formatZodErrors(zodError: ZodError): Array<{ field: string; message: string }> {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }))
}

export function throwValidationError(
  message: string = '参数验证失败',
  details?: Array<{ field: string; message: string }>
): never {
  throw new ValidationError(message, details)
}

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  throwValidationError
}
