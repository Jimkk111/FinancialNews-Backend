import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as historyService from '../services/history.service'

export const getList = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const result = await historyService.getHistory(userId, req.query as unknown as historyService.GetHistoryInput)
  return success(res, result)
}

export const clear = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  await historyService.clearHistory(userId)
  return success(res, { message: '历史记录已清空' })
}

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const historyId = parseInt(req.params.id, 10)
  await historyService.removeHistoryItem(userId, historyId)
  return success(res, { message: '删除成功' })
}
