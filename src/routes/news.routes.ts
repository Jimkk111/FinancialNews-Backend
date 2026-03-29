import { Router } from 'express'
import * as newsController from '../controllers/news.controller'
import { validateQuery, validateParams } from '../middlewares/validate.middleware'
import { newsListQuerySchema, newsIdParamsSchema, searchQuerySchema } from '../validators/news.validator'
import { searchLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.get('/',
  validateQuery(newsListQuerySchema),
  newsController.getNewsList
)

router.get('/categories',
  newsController.getCategories
)

router.get('/tags',
  newsController.getTags
)

router.get('/search',
  searchLimiter,
  validateQuery(searchQuerySchema),
  newsController.searchNews
)

router.get('/:id',
  validateParams(newsIdParamsSchema),
  newsController.getNewsById
)

router.post('/:id/views',
  validateParams(newsIdParamsSchema),
  newsController.incrementViews
)

export default router
