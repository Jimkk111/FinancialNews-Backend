import { Router } from 'express'
import authRoutes from './auth.routes'
import usersRoutes from './users.routes'
import newsRoutes from './news.routes'
import favoritesRoutes from './favorites.routes'
import historyRoutes from './history.routes'
import draftsRoutes from './drafts.routes'
import aiRoutes from './ai.routes'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: '财经新闻API服务',
      version: '1.0.0'
    }
  })
})

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/news', newsRoutes)
router.use('/favorites', favoritesRoutes)
router.use('/history', historyRoutes)
router.use('/drafts', draftsRoutes)
router.use('/ai', aiRoutes)

export default router
