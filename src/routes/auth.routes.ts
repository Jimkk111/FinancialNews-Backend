import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { validateBody } from '../middlewares/validate.middleware'
import { loginSchema, registerSchema, sendCodeSchema, resetPasswordSchema } from '../validators/auth.validator'
import { authLimiter, sendCodeLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.post('/login', authLimiter, validateBody(loginSchema), authController.login)
router.post('/register', authLimiter, validateBody(registerSchema), authController.register)
router.post('/logout', authController.logout)
router.post('/send-code', sendCodeLimiter, validateBody(sendCodeSchema), authController.sendCode)
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), authController.resetPassword)

export default router
