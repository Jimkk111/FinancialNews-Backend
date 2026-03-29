import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware'
import {
  favoriteListQuerySchema,
  addFavoriteSchema,
  newsIdParamsSchema
} from '../validators/favorite.validator'
import * as favoriteController from '../controllers/favorite.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  validateQuery(favoriteListQuerySchema),
  favoriteController.getFavoriteList
)

router.post('/',
  validateBody(addFavoriteSchema),
  favoriteController.addFavorite
)

router.delete('/:newsId',
  validateParams(newsIdParamsSchema),
  favoriteController.removeFavorite
)

router.get('/check/:newsId',
  validateParams(newsIdParamsSchema),
  favoriteController.checkFavorite
)

export default router
