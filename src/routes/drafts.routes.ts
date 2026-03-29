import { Router } from 'express'
import { validate } from '../middlewares/validate.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as draftController from '../controllers/draft.controller'
import { createDraftSchema, updateDraftSchema, getDraftsSchema } from '../validators/draft.validator'

const router = Router()

router.use(authMiddleware)

router.get('/', validate(getDraftsSchema), draftController.getList)
router.post('/', validate(createDraftSchema), draftController.create)
router.get('/:id', draftController.getDetail)
router.put('/:id', validate(updateDraftSchema), draftController.update)
router.delete('/:id', draftController.remove)

export default router
