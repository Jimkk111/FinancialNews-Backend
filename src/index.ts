import 'dotenv/config'
import app from './app'
import { log } from './utils/logger'

const PORT = parseInt(process.env.PORT || '3000', 10)

const server = app.listen(PORT, () => {
  log.info('Server', `服务器启动成功`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  })
})

process.on('SIGTERM', () => {
  log.info('Server', '收到SIGTERM信号，正在关闭服务器...')
  server.close(() => {
    log.info('Server', '服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  log.info('Server', '收到SIGINT信号，正在关闭服务器...')
  server.close(() => {
    log.info('Server', '服务器已关闭')
    process.exit(0)
  })
})

process.on('uncaughtException', (error) => {
  log.error('UncaughtException', '未捕获的异常', {}, error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log.error('UnhandledRejection', '未处理的Promise拒绝', { reason: String(reason) })
})
