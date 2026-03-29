import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as draftService from '../services/draft.service'

export const getList = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const result = await draftService.getDrafts(userId, req.query as unknown as draftService.GetDraftsInput)
  return success(res, result)
}

export const getDetail = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const draft = await draftService.getDraft(userId, req.params.id)
  return success(res, draft)
}

export const create = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const draft = await draftService.createDraft(userId, req.body)
  return success(res, draft, 201)
}

export const update = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const draft = await draftService.updateDraft(userId, req.params.id, req.body)
  return success(res, draft)
}

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  await draftService.deleteDraft(userId, req.params.id)
  return success(res, { message: '删除成功' })
}
