import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as historyController from '../controllers/history.controller'
import { getHistorySchema } from '../validators/history.validator'

const router = Router()

router.use(authMiddleware)

router.get('/', validate(getHistorySchema), historyController.getList)
router.delete('/', historyController.clear)
router.delete('/:id', historyController.remove)

export default router
