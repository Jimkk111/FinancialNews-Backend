import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as favoriteController from '../controllers/favorite.controller'
import { addFavoriteSchema, removeFavoriteSchema, getFavoritesSchema } from '../validators/favorite.validator'

const router = Router()

router.use(authMiddleware)

router.get('/', validate(getFavoritesSchema), favoriteController.getList)
router.post('/', validate(addFavoriteSchema), favoriteController.add)
router.delete('/:newsId', validate(removeFavoriteSchema), favoriteController.remove)
router.get('/check/:newsId', favoriteController.check)

export default router
