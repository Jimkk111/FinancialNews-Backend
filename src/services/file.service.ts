import path from 'path'
import fs from 'fs'
import { log } from '../utils/logger'
import { getUploadConfig, getOSSConfig, StorageType } from '../config/upload'
import { getUploadedFileUrl, deleteUploadedFile } from '../middlewares/upload.middleware'

export interface SaveFileResult {
  url: string
  path: string
  filename: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

const uploadConfig = getUploadConfig()

export async function saveFile(
  file: Express.Multer.File,
  category: string = 'files'
): Promise<SaveFileResult> {
  const storageType = uploadConfig.storageType

  if (storageType === 'oss') {
    return saveToOSS(file, category)
  }

  return saveToLocal(file, category)
}

async function saveToLocal(
  file: Express.Multer.File,
  category: string
): Promise<SaveFileResult> {
  const url = getUploadedFileUrl(file.filename, category)
  const relativePath = url.replace(uploadConfig.urlPrefix, '')
  const fullPath = path.join(uploadConfig.uploadDir, relativePath)

  log.info('FileService', '文件保存成功', {
    category,
    filename: file.filename,
    url,
    storage: 'local'
  })

  return {
    url,
    path: fullPath,
    filename: file.filename
  }
}

async function saveToOSS(
  file: Express.Multer.File,
  category: string
): Promise<SaveFileResult> {
  const ossConfig = getOSSConfig()

  if (!ossConfig) {
    log.warn('FileService', 'OSS配置缺失，回退到本地存储')
    return saveToLocal(file, category)
  }

  log.warn('FileService', 'OSS存储尚未实现，回退到本地存储')
  return saveToLocal(file, category)
}

export async function deleteFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl) {
    return false
  }

  const storageType = uploadConfig.storageType

  if (storageType === 'oss' && fileUrl.includes('aliyuncs.com')) {
    return deleteFromOSS(fileUrl)
  }

  return deleteUploadedFile(fileUrl)
}

async function deleteFromOSS(fileUrl: string): Promise<boolean> {
  log.warn('FileService', 'OSS删除尚未实现', { fileUrl })
  return false
}

export function validateFile(file: Express.Multer.File): ValidationResult {
  if (!file) {
    return { valid: false, error: '未提供文件' }
  }

  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${file.mimetype}`
    }
  }

  if (file.size > uploadConfig.maxSize) {
    return {
      valid: false,
      error: `文件大小超出限制，最大允许 ${Math.round(uploadConfig.maxSize / (1024 * 1024))}MB`
    }
  }

  return { valid: true }
}

export function fileExists(fileUrl: string): boolean {
  if (!fileUrl) return false

  const relativePath = fileUrl.replace(uploadConfig.urlPrefix, '')
  const fullPath = path.join(uploadConfig.uploadDir, relativePath)

  return fs.existsSync(fullPath)
}

export function getFileSize(fileUrl: string): number | null {
  if (!fileUrl) return null

  try {
    const relativePath = fileUrl.replace(uploadConfig.urlPrefix, '')
    const fullPath = path.join(uploadConfig.uploadDir, relativePath)

    if (!fs.existsSync(fullPath)) return null

    const stats = fs.statSync(fullPath)
    return stats.size
  } catch {
    return null
  }
}

export function cleanOldFile(oldFileUrl: string | null, newFileUrl: string): void {
  if (oldFileUrl && oldFileUrl !== newFileUrl) {
    deleteFile(oldFileUrl)
    log.info('FileService', '旧文件已清理', { oldFileUrl })
  }
}

export default {
  saveFile,
  deleteFile,
  validateFile,
  fileExists,
  getFileSize,
  cleanOldFile
}
