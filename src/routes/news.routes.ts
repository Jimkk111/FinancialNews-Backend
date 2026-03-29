import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { optionalAuthMiddleware } from '../middlewares/auth.middleware'
import * as newsController from '../controllers/news.controller'
import { getNewsListSchema, getNewsDetailSchema } from '../validators/news.validator'

const router = Router()

router.get('/', validate(getNewsListSchema), newsController.getList)
router.get('/categories', newsController.getCategories)
router.get('/hot', newsController.getHot)
router.get('/:id', validate(getNewsDetailSchema), optionalAuthMiddleware, newsController.getDetail)

export default router
