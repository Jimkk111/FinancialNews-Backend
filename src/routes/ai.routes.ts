import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as aiController from '../controllers/ai.controller'

const router = Router()

router.use(authMiddleware)

router.post('/sessions', aiController.createSession)
router.get('/sessions', aiController.getSessions)
router.get('/sessions/:sessionId', aiController.getSession)
router.delete('/sessions/:sessionId', aiController.deleteSession)
router.post('/chat/:sessionId', aiController.chat)

export default router
