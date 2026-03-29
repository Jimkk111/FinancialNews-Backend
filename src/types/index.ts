export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '参数验证失败', details?: Array<{ field: string; message: string }>) {
    super(message, ErrorCode.VALIDATION_ERROR, 422, true, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, ErrorCode.UNAUTHORIZED, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, ErrorCode.FORBIDDEN, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, ErrorCode.NOT_FOUND, 404)
  }
}

export class DuplicateError extends AppError {
  constructor(message: string = '资源已存在') {
    super(message, ErrorCode.DUPLICATE_ENTRY, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁') {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429)
  }
}

export interface JwtPayload {
  userId: number
  uid: string
  username: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload
}

export interface ValidationResult {
  success: boolean
  data?: unknown
  errors?: Array<{ field: string; message: string }>
}
