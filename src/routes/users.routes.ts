import { Router } from 'express'

const router = Router()

router.get('/me', (_req, res) => {
  res.json({ success: true, message: '获取用户信息接口待实现' })
})

router.put('/me', (_req, res) => {
  res.json({ success: true, message: '更新用户信息接口待实现' })
})

router.post('/me/avatar', (_req, res) => {
  res.json({ success: true, message: '上传头像接口待实现' })
})

export default router
