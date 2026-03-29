import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ success: true, message: '获取草稿列表接口待实现' })
})

router.post('/', (_req, res) => {
  res.json({ success: true, message: '创建草稿接口待实现' })
})

router.get('/:id', (_req, res) => {
  res.json({ success: true, message: '获取草稿详情接口待实现' })
})

router.put('/:id', (_req, res) => {
  res.json({ success: true, message: '更新草稿接口待实现' })
})

router.delete('/:id', (_req, res) => {
  res.json({ success: true, message: '删除草稿接口待实现' })
})

router.post('/:id/publish', (_req, res) => {
  res.json({ success: true, message: '发布草稿接口待实现' })
})

export default router
