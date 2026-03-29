import { Router } from 'express'

const router = Router()

router.get('/sessions', (_req, res) => {
  res.json({ success: true, message: '获取会话列表接口待实现' })
})

router.post('/sessions', (_req, res) => {
  res.json({ success: true, message: '创建会话接口待实现' })
})

router.get('/sessions/:id/messages', (_req, res) => {
  res.json({ success: true, message: '获取会话消息接口待实现' })
})

router.put('/sessions/:id', (_req, res) => {
  res.json({ success: true, message: '更新会话标题接口待实现' })
})

router.delete('/sessions/:id', (_req, res) => {
  res.json({ success: true, message: '删除会话接口待实现' })
})

router.post('/chat', (_req, res) => {
  res.json({ success: true, message: 'AI对话接口待实现' })
})

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'healthy' })
})

export default router
