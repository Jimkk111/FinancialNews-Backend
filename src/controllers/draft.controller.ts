import { Request, Response, NextFunction } from 'express'
import * as draftService from '../services/draft.service'
import { success, created, notFound } from '../utils/response'
import { log } from '../utils/logger'
import { CreateDraftBody, UpdateDraftBody } from '../validators/draft.validator'

export async function getDraftList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const drafts = await draftService.getDraftList(userId)

    log.info('DraftController', '获取草稿列表成功', { userId, count: drafts.length })

    success(res, drafts)
  } catch (error) {
    next(error)
  }
}

export async function getDraftById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const draftId = String(req.params.id)

    const draft = await draftService.getDraftById(userId, draftId)

    if (!draft) {
      log.warn('DraftController', '草稿不存在', { userId, draftId })
      notFound(res, '草稿不存在')
      return
    }

    log.info('DraftController', '获取草稿详情成功', { userId, draftId })

    success(res, draft)
  } catch (error) {
    next(error)
  }
}

export async function createDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const body = req.body as CreateDraftBody

    const draft = await draftService.createDraft(userId, {
      title: body.title,
      content: body.content,
      coverImage: body.coverImage,
      categoryId: body.categoryId
    })

    log.info('DraftController', '创建草稿成功', { userId, draftId: draft.id })

    created(res, draft)
  } catch (error) {
    next(error)
  }
}

export async function updateDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const draftId = String(req.params.id)
    const body = req.body as UpdateDraftBody

    const draft = await draftService.updateDraft(userId, draftId, {
      title: body.title,
      content: body.content,
      coverImage: body.coverImage,
      categoryId: body.categoryId
    })

    log.info('DraftController', '更新草稿成功', { userId, draftId })

    success(res, draft)
  } catch (error) {
    next(error)
  }
}

export async function deleteDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const draftId = String(req.params.id)

    await draftService.deleteDraft(userId, draftId)

    log.info('DraftController', '删除草稿成功', { userId, draftId })

    success(res, { message: '草稿删除成功' })
  } catch (error) {
    next(error)
  }
}

export async function publishDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const draftId = String(req.params.id)

    const news = await draftService.publishDraft(userId, draftId)

    log.info('DraftController', '发布草稿成功', { userId, draftId, newsId: news.id })

    created(res, news)
  } catch (error) {
    next(error)
  }
}

export default {
  getDraftList,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft
}
