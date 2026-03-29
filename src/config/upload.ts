import { log } from '../utils/logger'

export type StorageType = 'local' | 'oss'

export interface UploadConfig {
  storageType: StorageType
  maxSize: number
  allowedMimeTypes: string[]
  uploadDir: string
  urlPrefix: string
}

export interface OSSConfig {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string
  endpoint: string
}

const ALLOWED_MIME_TYPES = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,image/webp')
  .split(',')
  .map((t) => t.trim())

const uploadConfig: UploadConfig = {
  storageType: (process.env.UPLOAD_STORAGE_TYPE as StorageType) || 'local',
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'),
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  urlPrefix: process.env.UPLOAD_URL_PREFIX || '/uploads'
}

const ossConfig: OSSConfig | null = process.env.OSS_ACCESS_KEY_ID
  ? {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.OSS_BUCKET || '',
      region: process.env.OSS_REGION || '',
      endpoint: process.env.OSS_ENDPOINT || ''
    }
  : null

export function getUploadConfig(): UploadConfig {
  return { ...uploadConfig }
}

export function getOSSConfig(): OSSConfig | null {
  return ossConfig ? { ...ossConfig } : null
}

export function isAllowedMimeType(mimeType: string): boolean {
  return uploadConfig.allowedMimeTypes.includes(mimeType)
}

export function isFileSizeAllowed(size: number): boolean {
  return size <= uploadConfig.maxSize
}

export function getMaxSizeMB(): number {
  return Math.round(uploadConfig.maxSize / (1024 * 1024))
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
}

export function validateFileType(mimeType: string): { valid: boolean; error?: string } {
  if (!isAllowedMimeType(mimeType)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${mimeType}。支持的类型: ${uploadConfig.allowedMimeTypes.join(', ')}`
    }
  }
  return { valid: true }
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (!isFileSizeAllowed(size)) {
    return {
      valid: false,
      error: `文件大小超出限制。最大允许: ${getMaxSizeMB()}MB`
    }
  }
  return { valid: true }
}

log.info('UploadConfig', '文件上传配置已加载', {
  storageType: uploadConfig.storageType,
  maxSize: `${getMaxSizeMB()}MB`,
  allowedMimeTypes: uploadConfig.allowedMimeTypes
})

export default {
  getUploadConfig,
  getOSSConfig,
  isAllowedMimeType,
  isFileSizeAllowed,
  getMaxSizeMB,
  getFileExtension,
  validateFileType,
  validateFileSize
}
