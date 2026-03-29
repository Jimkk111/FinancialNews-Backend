import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateQuery } from '../middlewares/validate.middleware'
import { historyListQuerySchema, addHistorySchema } from '../validators/history.validator'
import * as historyController from '../controllers/history.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  validateQuery(historyListQuerySchema),
  historyController.getHistoryList
)

router.post('/',
  validateBody(addHistorySchema),
  historyController.addHistory
)

router.delete('/',
  historyController.clearHistory
)

export default router
