import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateParams } from '../middlewares/validate.middleware'
import {
  draftIdParamsSchema,
  createDraftSchema,
  updateDraftSchema
} from '../validators/draft.validator'
import * as draftController from '../controllers/draft.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  draftController.getDraftList
)

router.post('/',
  validateBody(createDraftSchema),
  draftController.createDraft
)

router.get('/:id',
  validateParams(draftIdParamsSchema),
  draftController.getDraftById
)

router.put('/:id',
  validateParams(draftIdParamsSchema),
  validateBody(updateDraftSchema),
  draftController.updateDraft
)

router.delete('/:id',
  validateParams(draftIdParamsSchema),
  draftController.deleteDraft
)

router.post('/:id/publish',
  validateParams(draftIdParamsSchema),
  draftController.publishDraft
)

export default router
