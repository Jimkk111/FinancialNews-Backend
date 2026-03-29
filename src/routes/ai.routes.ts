import { Router } from 'express'
import * as aiController from '../controllers/ai.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateParams } from '../middlewares/validate.middleware'
import { updateSessionSchema, chatSchema, sessionIdParamSchema } from '../validators/ai.validator'
import { aiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.get('/sessions', authenticate, aiController.getSessions)

router.post('/sessions', authenticate, aiController.createSession)

router.get(
  '/sessions/:sessionId/messages',
  authenticate,
  validateParams(sessionIdParamSchema),
  aiController.getSessionMessages
)

router.put(
  '/sessions/:sessionId',
  authenticate,
  validateParams(sessionIdParamSchema),
  validateBody(updateSessionSchema),
  aiController.updateSession
)

router.delete(
  '/sessions/:sessionId',
  authenticate,
  validateParams(sessionIdParamSchema),
  aiController.deleteSession
)

router.post('/chat', authenticate, aiLimiter, validateBody(chatSchema), aiController.chat)

router.get('/health', aiController.healthCheck)

export default router
