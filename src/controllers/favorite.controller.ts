import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as favoriteService from '../services/favorite.service'

export const getList = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const result = await favoriteService.getFavorites(userId, req.query as unknown as favoriteService.GetFavoritesInput)
  return success(res, result)
}

export const add = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const { newsId } = req.body
  const favorite = await favoriteService.addFavorite(userId, newsId)
  return success(res, favorite, 201)
}

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const newsId = parseInt(req.params.newsId, 10)
  await favoriteService.removeFavorite(userId, newsId)
  return success(res, { message: '取消收藏成功' })
}

export const check = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const newsId = parseInt(req.params.newsId, 10)
  const isFavorited = await favoriteService.checkFavorite(userId, newsId)
  return success(res, { isFavorited })
}
