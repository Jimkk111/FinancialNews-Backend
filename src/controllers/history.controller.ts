import { Request, Response, NextFunction } from 'express'
import * as historyService from '../services/history.service'
import { success, notFound } from '../utils/response'
import { log } from '../utils/logger'
import { HistoryError } from '../services/history.service'
import { HistoryListQuery, AddHistoryBody } from '../validators/history.validator'

export async function getHistoryList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const query = req.query as unknown as HistoryListQuery
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10

    const result = await historyService.getHistoryList(userId, { page, pageSize })

    log.info('HistoryController', '获取浏览历史', { userId, total: result.total })

    const totalPages = Math.ceil(result.total / pageSize)
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function addHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { newsId } = req.body as AddHistoryBody

    await historyService.addHistory(userId, { newsId })

    log.info('HistoryController', '添加浏览记录成功', { userId, newsId })

    success(res, { message: '添加浏览记录成功' })
  } catch (err) {
    if (err instanceof HistoryError) {
      if (err.code === 'NOT_FOUND') {
        notFound(res, err.message)
        return
      }
    }
    next(err)
  }
}

export async function clearHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    await historyService.clearHistory(userId)

    log.info('HistoryController', '清空浏览历史成功', { userId })

    success(res, { message: '清空浏览历史成功' })
  } catch (err) {
    next(err)
  }
}

export default {
  getHistoryList,
  addHistory,
  clearHistory
}
