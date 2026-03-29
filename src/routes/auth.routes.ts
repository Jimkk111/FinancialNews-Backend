import { Router } from 'express'

const router = Router()

router.post('/login', (_req, res) => {
  res.json({ success: true, message: '登录接口待实现' })
})

router.post('/register', (_req, res) => {
  res.json({ success: true, message: '注册接口待实现' })
})

router.post('/logout', (_req, res) => {
  res.json({ success: true, message: '登出接口待实现' })
})

router.post('/send-code', (_req, res) => {
  res.json({ success: true, message: '发送验证码接口待实现' })
})

router.post('/reset-password', (_req, res) => {
  res.json({ success: true, message: '重置密码接口待实现' })
})

export default router
