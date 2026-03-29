import prisma from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { GetFavoritesInput } from '../validators/favorite.validator'
import { PaginatedResult } from '../types'

interface FavoriteItem {
  id: number
  createdAt: Date
  news: {
    id: number
    title: string
    summary: string | null
    source: string | null
    hasImage: boolean
    imageUrl: string | null
  }
}

export const getFavorites = async (
  userId: number,
  params: GetFavoritesInput
): Promise<PaginatedResult<FavoriteItem>> => {
  const { page, pageSize } = params
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            summary: true,
            source: true,
            hasImage: true,
            imageUrl: true
          }
        }
      }
    }),
    prisma.favorite.count({ where: { userId } })
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export const addFavorite = async (userId: number, newsId: number) => {
  const news = await prisma.news.findUnique({
    where: { id: newsId }
  })

  if (!news) {
    throw new AppError('新闻不存在', 'NEWS_NOT_FOUND', 404)
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })

  if (existing) {
    throw new AppError('已收藏该新闻', 'ALREADY_FAVORITED', 422)
  }

  return prisma.favorite.create({
    data: { userId, newsId }
  })
}

export const removeFavorite = async (userId: number, newsId: number) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })

  if (!favorite) {
    throw new AppError('未收藏该新闻', 'NOT_FAVORITED', 404)
  }

  await prisma.favorite.delete({
    where: { id: favorite.id }
  })
}

export const checkFavorite = async (userId: number, newsId: number): Promise<boolean> => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })
  return !!favorite
}
