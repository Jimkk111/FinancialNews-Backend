import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { validateBody } from '../middlewares/validate.middleware'
import { loginSchema, registerSchema, sendCodeSchema, resetPasswordSchema } from '../validators/auth.validator'

const router = Router()

router.post('/login', validateBody(loginSchema), authController.login)
router.post('/register', validateBody(registerSchema), authController.register)
router.post('/logout', authController.logout)
router.post('/send-code', validateBody(sendCodeSchema), authController.sendCode)
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword)

export default router
