import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import { config } from '../config'
import { error } from '../utils/response'
import { AppError } from './error.middleware'

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError('不支持的文件类型', 'INVALID_FILE_TYPE', 422))
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
})

export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, '文件大小超出限制', 'FILE_TOO_LARGE', 422)
    }
    return error(res, err.message, 'UPLOAD_ERROR', 422)
  }
  
  if (err instanceof AppError) {
    return error(res, err.message, err.code, err.statusCode)
  }
  
  return error(res, '文件上传失败', 'UPLOAD_ERROR', 500)
}
