import redis from '../config/redis'

const CACHE_PREFIX = 'cache:'

export const get = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(`${CACHE_PREFIX}${key}`)
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export const set = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
  const data = JSON.stringify(value)
  if (ttlSeconds) {
    await redis.setex(`${CACHE_PREFIX}${key}`, ttlSeconds, data)
  } else {
    await redis.set(`${CACHE_PREFIX}${key}`, data)
  }
}

export const del = async (key: string): Promise<void> => {
  await redis.del(`${CACHE_PREFIX}${key}`)
}

export const delPattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
