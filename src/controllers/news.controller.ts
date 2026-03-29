import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as newsService from '../services/news.service'

export const getList = async (req: Request, res: Response): Promise<Response> => {
  const result = await newsService.getNewsList(req.query as unknown as newsService.GetNewsListInput)
  return success(res, result)
}

export const getDetail = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id, 10)
  const userId = req.user?.userId
  const news = await newsService.getNewsDetail(id, userId)
  
  if (!news) {
    return success(res, null)
  }
  
  return success(res, news)
}

export const getCategories = async (_req: Request, res: Response): Promise<Response> => {
  const categories = await newsService.getCategories()
  return success(res, categories)
}

export const getHot = async (req: Request, res: Response): Promise<Response> => {
  const limit = parseInt(req.query.limit as string, 10) || 10
  const news = await newsService.getHotNews(limit)
  return success(res, news)
}
