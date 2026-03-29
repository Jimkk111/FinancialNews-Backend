import { RequestHandler } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { 
  getUploadConfig, 
  validateFileType, 
  validateFileSize, 
  getFileExtension 
} from '../config/upload'
import { log } from '../utils/logger'
import { error } from '../utils/response'

export interface UploadOptions {
  fieldName: string
  maxSize?: number
  allowedMimeTypes?: string[]
  maxCount?: number
  category?: string
}

const uploadConfig = getUploadConfig()

function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    log.info('UploadMiddleware', '创建上传目录', { dir })
  }
}

function generateFilename(originalname: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(6).toString('hex')
  const ext = getFileExtension(originalname)
  return `${timestamp}_${random}.${ext}`
}

function getUploadPath(category: string = 'files'): { destination: string; relativePath: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const relativePath = path.join(category, String(year), month)
  const destination = path.join(uploadConfig.uploadDir, relativePath)
  
  ensureUploadDir(destination)
  
  return { destination, relativePath }
}

function createFileFilter(allowedMimeTypes?: string[]) {
  const allowed = allowedMimeTypes || uploadConfig.allowedMimeTypes
  
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void => {
    const validation = validateFileType(file.mimetype)
    
    if (!validation.valid) {
      callback(new Error(validation.error || '文件类型不支持'))
      return
    }
    
    if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
      callback(new Error(`不支持的文件类型: ${file.mimetype}`))
      return
    }
    
    callback(null, true)
  }
}

function createDiskStorage(category?: string) {
  return multer.diskStorage({
    destination: (_req, _file, callback) => {
      const { destination } = getUploadPath(category)
      callback(null, destination)
    },
    filename: (_req, file, callback) => {
      const filename = generateFilename(file.originalname)
      callback(null, filename)
    }
  })
}

export function createUploadMiddleware(options: UploadOptions): RequestHandler {
  const {
    fieldName,
    maxSize = uploadConfig.maxSize,
    allowedMimeTypes,
    maxCount = 1,
    category = 'files'
  } = options

  const storage = createDiskStorage(category)
  const fileFilter = createFileFilter(allowedMimeTypes)

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: maxCount
    }
  })

  const multerMiddleware = maxCount === 1 
    ? upload.single(fieldName) 
    : upload.array(fieldName, maxCount)

  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        log.warn('UploadMiddleware', '文件上传失败', { 
          error: err.message,
          field: fieldName 
        })

        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return error(res, 'FILE_TOO_LARGE', `文件大小超出限制，最大允许 ${Math.round(maxSize / (1024 * 1024))}MB`, 413)
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return error(res, 'FILE_COUNT_EXCEEDED', `文件数量超出限制，最多允许 ${maxCount} 个文件`, 422)
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return error(res, 'UNEXPECTED_FILE', '意外的文件字段', 422)
          }
          return error(res, 'UPLOAD_ERROR', err.message, 422)
        }

        if (err.message.includes('不支持的文件类型')) {
          return error(res, 'INVALID_FILE_TYPE', err.message, 422)
        }

        return error(res, 'UPLOAD_ERROR', '文件上传失败', 500)
      }

      const file = req.file
      const files = req.files

      if (!file && !files) {
        return error(res, 'NO_FILE', '请选择要上传的文件', 422)
      }

      if (file) {
        const sizeValidation = validateFileSize(file.size)
        if (!sizeValidation.valid) {
          return error(res, 'FILE_TOO_LARGE', sizeValidation.error || '文件大小超出限制', 413)
        }
      }

      log.info('UploadMiddleware', '文件上传成功', {
        field: fieldName,
        filename: file?.filename || (files as Express.Multer.File[])?.map(f => f.filename)
      })

      next()
    })
  }
}

export function getUploadedFileUrl(filename: string, category: string = 'files'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${uploadConfig.urlPrefix}/${category}/${year}/${month}/${filename}`
}

export function deleteUploadedFile(fileUrl: string): boolean {
  try {
    const relativePath = fileUrl.replace(uploadConfig.urlPrefix, '')
    const fullPath = path.join(uploadConfig.uploadDir, relativePath)
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      log.info('UploadMiddleware', '文件已删除', { path: fullPath })
      return true
    }
    
    log.warn('UploadMiddleware', '文件不存在，无法删除', { path: fullPath })
    return false
  } catch (err) {
    log.error('UploadMiddleware', '删除文件失败', { fileUrl }, err instanceof Error ? err : undefined)
    return false
  }
}

export default {
  createUploadMiddleware,
  getUploadedFileUrl,
  deleteUploadedFile
}
