import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ success: true, message: '获取收藏列表接口待实现' })
})

router.post('/', (_req, res) => {
  res.json({ success: true, message: '添加收藏接口待实现' })
})

router.delete('/:newsId', (_req, res) => {
  res.json({ success: true, message: '取消收藏接口待实现' })
})

router.get('/check/:newsId', (_req, res) => {
  res.json({ success: true, message: '检查收藏状态接口待实现' })
})

export default router
