import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as userController from '../controllers/user.controller'
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator'

const router = Router()

router.use(authMiddleware)

router.get('/profile', userController.getProfile)
router.put('/profile', validate(updateProfileSchema), userController.updateProfile)
router.put('/password', validate(changePasswordSchema), userController.changePassword)
router.get('/stats', userController.getStats)

export default router
