import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ success: true, message: '获取浏览历史接口待实现' })
})

router.post('/', (_req, res) => {
  res.json({ success: true, message: '添加浏览记录接口待实现' })
})

router.delete('/', (_req, res) => {
  res.json({ success: true, message: '清空历史接口待实现' })
})

export default router
