import { Router } from 'express'
import authRoutes from './auth.routes'
import usersRoutes from './users.routes'
import newsRoutes from './news.routes'
import favoritesRoutes from './favorites.routes'
import historyRoutes from './history.routes'
import draftsRoutes from './drafts.routes'
import aiRoutes from './ai.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/news', newsRoutes)
router.use('/favorites', favoritesRoutes)
router.use('/history', historyRoutes)
router.use('/drafts', draftsRoutes)
router.use('/ai', aiRoutes)

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
