import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ success: true, message: '获取新闻列表接口待实现' })
})

router.get('/categories', (_req, res) => {
  res.json({ success: true, message: '获取分类列表接口待实现' })
})

router.get('/tags', (_req, res) => {
  res.json({ success: true, message: '获取标签列表接口待实现' })
})

router.get('/search', (_req, res) => {
  res.json({ success: true, message: '搜索新闻接口待实现' })
})

router.get('/:id', (_req, res) => {
  res.json({ success: true, message: '获取新闻详情接口待实现' })
})

router.post('/:id/views', (_req, res) => {
  res.json({ success: true, message: '增加浏览量接口待实现' })
})

export default router
