import Redis from 'ioredis'
import { log } from '../utils/logger'

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number): number | null => {
    if (times > 3) {
      log.error('Redis', '连接重试次数超过限制')
      return null
    }
    const delay = Math.min(times * 200, 2000)
    log.warn('Redis', `连接重试中，第${times}次，延迟${delay}ms`)
    return delay
  },
  maxRetriesPerRequest: 3
}

const redis = new Redis(redisConfig)

redis.on('connect', () => {
  log.info('Redis', '连接成功', { host: redisConfig.host, port: redisConfig.port })
})

redis.on('ready', () => {
  log.info('Redis', '准备就绪')
})

redis.on('error', (err) => {
  log.error('Redis', '连接错误', undefined, err)
})

redis.on('close', () => {
  log.warn('Redis', '连接关闭')
})

redis.on('reconnecting', () => {
  log.info('Redis', '正在重连')
})

export const isRedisReady = (): boolean => {
  return redis.status === 'ready'
}

export const getRedisStatus = (): string => {
  return redis.status
}

export default redis
