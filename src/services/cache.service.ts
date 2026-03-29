import redis, { isRedisReady } from '../config/redis'
import { log } from '../utils/logger'

const DEFAULT_TTL = 300
const KEY_PREFIX = 'cls:'

export interface CacheOptions {
  ttl?: number
  prefix?: string
}

export async function get<T>(key: string, options?: CacheOptions): Promise<T | null> {
  if (!isRedisReady()) {
    log.warn('CacheService', 'Redis未就绪，跳过缓存读取', { key })
    return null
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    const data = await redis.get(fullKey)
    
    if (data === null) {
      log.debug('CacheService', '缓存未命中', { key: fullKey })
      return null
    }

    log.debug('CacheService', '缓存命中', { key: fullKey })
    return JSON.parse(data) as T
  } catch (error) {
    log.error('CacheService', '获取缓存失败', { key, error })
    return null
  }
}

export async function set(key: string, value: unknown, ttl?: number, options?: CacheOptions): Promise<boolean> {
  if (!isRedisReady()) {
    log.warn('CacheService', 'Redis未就绪，跳过缓存写入', { key })
    return false
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    const serializedValue = JSON.stringify(value)
    const actualTtl = ttl || DEFAULT_TTL

    await redis.setex(fullKey, actualTtl, serializedValue)
    log.debug('CacheService', '缓存已设置', { key: fullKey, ttl: actualTtl })
    return true
  } catch (error) {
    log.error('CacheService', '设置缓存失败', { key, error })
    return false
  }
}

export async function del(key: string, options?: CacheOptions): Promise<boolean> {
  if (!isRedisReady()) {
    log.warn('CacheService', 'Redis未就绪，跳过缓存删除', { key })
    return false
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    await redis.del(fullKey)
    log.debug('CacheService', '缓存已删除', { key: fullKey })
    return true
  } catch (error) {
    log.error('CacheService', '删除缓存失败', { key, error })
    return false
  }
}

export async function delPattern(pattern: string, options?: CacheOptions): Promise<number> {
  if (!isRedisReady()) {
    log.warn('CacheService', 'Redis未就绪，跳过批量删除', { pattern })
    return 0
  }

  try {
    const fullPattern = buildKey(pattern, options?.prefix)
    const keys = await redis.keys(fullPattern)
    
    if (keys.length === 0) {
      log.debug('CacheService', '未找到匹配的缓存键', { pattern: fullPattern })
      return 0
    }

    const deleted = await redis.del(...keys)
    log.debug('CacheService', '批量删除缓存', { pattern: fullPattern, count: deleted })
    return deleted
  } catch (error) {
    log.error('CacheService', '批量删除缓存失败', { pattern, error })
    return 0
  }
}

export async function exists(key: string, options?: CacheOptions): Promise<boolean> {
  if (!isRedisReady()) {
    return false
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    const result = await redis.exists(fullKey)
    return result === 1
  } catch (error) {
    log.error('CacheService', '检查缓存存在失败', { key, error })
    return false
  }
}

export async function expire(key: string, ttl: number, options?: CacheOptions): Promise<boolean> {
  if (!isRedisReady()) {
    return false
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    const result = await redis.expire(fullKey, ttl)
    return result === 1
  } catch (error) {
    log.error('CacheService', '设置过期时间失败', { key, error })
    return false
  }
}

export async function ttl(key: string, options?: CacheOptions): Promise<number> {
  if (!isRedisReady()) {
    return -1
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    return await redis.ttl(fullKey)
  } catch (error) {
    log.error('CacheService', '获取过期时间失败', { key, error })
    return -1
  }
}

export async function incr(key: string, options?: CacheOptions): Promise<number> {
  if (!isRedisReady()) {
    return 0
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    return await redis.incr(fullKey)
  } catch (error) {
    log.error('CacheService', '自增失败', { key, error })
    return 0
  }
}

export async function incrBy(key: string, increment: number, options?: CacheOptions): Promise<number> {
  if (!isRedisReady()) {
    return 0
  }

  try {
    const fullKey = buildKey(key, options?.prefix)
    return await redis.incrby(fullKey, increment)
  } catch (error) {
    log.error('CacheService', '自增失败', { key, error })
    return 0
  }
}

function buildKey(key: string, prefix?: string): string {
  const actualPrefix = prefix || KEY_PREFIX
  return `${actualPrefix}${key}`
}

export async function warmup(): Promise<void> {
  log.info('CacheService', '开始缓存预热')
  
  try {
    const { default: prisma } = await import('../config/database')
    
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' }
    })
    await set('news:categories', categories, 3600)
    
    const tags = await prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' }
    })
    await set('news:tags', tags, 3600)
    
    log.info('CacheService', '缓存预热完成', { 
      categoriesCount: categories.length, 
      tagsCount: tags.length 
    })
  } catch (err) {
    log.error('CacheService', '缓存预热失败', undefined, err instanceof Error ? err : undefined)
  }
}

export default {
  get,
  set,
  del,
  delPattern,
  exists,
  expire,
  ttl,
  incr,
  incrBy,
  warmup
}
