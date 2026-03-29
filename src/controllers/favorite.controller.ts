import { Request, Response, NextFunction } from 'express'
import * as favoriteService from '../services/favorite.service'
import { success, error, notFound, conflict } from '../utils/response'
import { log } from '../utils/logger'
import { FavoriteError } from '../services/favorite.service'
import { FavoriteListQuery, AddFavoriteBody, NewsIdParams } from '../validators/favorite.validator'

export async function getFavoriteList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const query = req.query as unknown as FavoriteListQuery
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10

    const result = await favoriteService.getFavoriteList(userId, { page, pageSize })

    log.info('FavoriteController', '获取收藏列表', { userId, total: result.total })

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

export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { newsId } = req.body as AddFavoriteBody

    await favoriteService.addFavorite(userId, { newsId })

    log.info('FavoriteController', '添加收藏成功', { userId, newsId })

    success(res, { message: '收藏成功' })
  } catch (err) {
    if (err instanceof FavoriteError) {
      if (err.code === 'NOT_FOUND') {
        notFound(res, err.message)
        return
      }
      if (err.code === 'CONFLICT') {
        conflict(res, err.message)
        return
      }
    }
    next(err)
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { newsId } = req.params as unknown as NewsIdParams

    await favoriteService.removeFavorite(userId, newsId)

    log.info('FavoriteController', '取消收藏成功', { userId, newsId })

    success(res, { message: '取消收藏成功' })
  } catch (err) {
    if (err instanceof FavoriteError) {
      if (err.code === 'NOT_FOUND') {
        notFound(res, err.message)
        return
      }
    }
    next(err)
  }
}

export async function checkFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { newsId } = req.params as unknown as NewsIdParams

    const isFavorite = await favoriteService.checkFavorite(userId, newsId)

    log.info('FavoriteController', '检查收藏状态', { userId, newsId, isFavorite })

    success(res, { is_favorite: isFavorite })
  } catch (err) {
    next(err)
  }
}

export default {
  getFavoriteList,
  addFavorite,
  removeFavorite,
  checkFavorite
}
