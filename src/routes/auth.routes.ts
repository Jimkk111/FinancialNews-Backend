import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import { authLimiter } from '../middlewares/rateLimit.middleware'
import * as authController from '../controllers/auth.controller'
import { registerSchema, loginSchema, sendCodeSchema, resetPasswordSchema } from '../validators/auth.validator'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/send-code', authLimiter, validate(sendCodeSchema), authController.sendCode)
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword)
router.get('/me', authMiddleware, authController.getMe)

export default router
