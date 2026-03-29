import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody } from '../middlewares/validate.middleware'
import { createUploadMiddleware } from '../middlewares/upload.middleware'
import { uploadLimiter } from '../middlewares/rateLimit.middleware'
import * as userController from '../controllers/user.controller'
import { updateUserSchema } from '../validators/user.validator'

const router = Router()

router.get('/me', authenticate, userController.getCurrentUser)

router.put('/me', authenticate, validateBody(updateUserSchema), userController.updateCurrentUser)

router.post(
  '/me/avatar',
  authenticate,
  uploadLimiter,
  createUploadMiddleware({ 
    fieldName: 'avatar', 
    maxSize: 2 * 1024 * 1024,
    category: 'avatars'
  }),
  userController.uploadAvatar
)

export default router
