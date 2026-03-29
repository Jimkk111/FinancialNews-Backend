import * as cacheService from '../services/cache.service'
import { log } from './logger'

const DEFAULT_TTL = 300

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheService.get<T>(key)
  if (cached !== null) {
    log.debug('CacheWrapper', '缓存命中', { key })
    return cached
  }

  log.debug('CacheWrapper', '缓存未命中，执行数据获取', { key })
  const data = await fetcher()
  
  await cacheService.set(key, data, ttl)
  log.debug('CacheWrapper', '数据已缓存', { key, ttl })
  
  return data
}

export async function withCacheNullable<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttl: number = DEFAULT_TTL
): Promise<T | null> {
  const cached = await cacheService.get<T>(key)
  if (cached !== null) {
    log.debug('CacheWrapper', '缓存命中', { key })
    return cached
  }

  log.debug('CacheWrapper', '缓存未命中，执行数据获取', { key })
  const data = await fetcher()
  
  if (data !== null) {
    await cacheService.set(key, data, ttl)
    log.debug('CacheWrapper', '数据已缓存', { key, ttl })
  }
  
  return data
}

export async function invalidateCache(key: string): Promise<void> {
  await cacheService.del(key)
  log.debug('CacheWrapper', '缓存已失效', { key })
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const count = await cacheService.delPattern(pattern)
  log.debug('CacheWrapper', '批量缓存已失效', { pattern, count })
}

export function buildListCacheKey(
  resource: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  
  return `${resource}:list:${Buffer.from(sortedParams).toString('base64')}`
}

export default {
  withCache,
  withCacheNullable,
  invalidateCache,
  invalidateCachePattern,
  buildListCacheKey
}
