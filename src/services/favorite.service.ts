import prisma from '../config/database'
import { log } from '../utils/logger'

export interface ListOptions {
  page: number
  pageSize: number
}

export interface FavoriteNewsItem {
  id: number
  title: string
  summary: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  tags: { id: number; name: string }[]
  favoriteAt: Date
}

export interface FavoriteListResult {
  data: FavoriteNewsItem[]
  total: number
  page: number
  pageSize: number
}

export interface AddFavoriteData {
  newsId: number
}

export class FavoriteError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'FavoriteError'
  }
}

export async function getFavoriteList(userId: number, options: ListOptions): Promise<FavoriteListResult> {
  const { page, pageSize } = options
  const skip = (page - 1) * pageSize

  const where = {
    userId,
    news: { deletedAt: null }
  }

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            summary: true,
            publishTime: true,
            source: true,
            views: true,
            hasImage: true,
            imageUrl: true,
            categoryId: true,
            category: {
              select: { id: true, name: true }
            },
            newsTags: {
              select: {
                tag: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    }),
    prisma.favorite.count({ where })
  ])

  const data: FavoriteNewsItem[] = favorites.map((item) => ({
    id: item.news.id,
    title: item.news.title,
    summary: item.news.summary,
    publishTime: item.news.publishTime,
    source: item.news.source,
    views: item.news.views,
    hasImage: item.news.hasImage,
    imageUrl: item.news.imageUrl,
    categoryId: item.news.categoryId,
    category: item.news.category,
    tags: item.news.newsTags.map((nt) => nt.tag),
    favoriteAt: item.createdAt
  }))

  log.info('FavoriteService', '获取收藏列表', { userId, page, pageSize, total })

  return { data, total, page, pageSize }
}

export async function addFavorite(userId: number, data: AddFavoriteData): Promise<void> {
  const { newsId } = data

  const news = await prisma.news.findFirst({
    where: { id: newsId, deletedAt: null },
    select: { id: true }
  })

  if (!news) {
    log.warn('FavoriteService', '新闻不存在', { userId, newsId })
    throw new FavoriteError('新闻不存在', 'NOT_FOUND')
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })

  if (existingFavorite) {
    log.warn('FavoriteService', '已收藏该新闻', { userId, newsId })
    throw new FavoriteError('已收藏该新闻', 'CONFLICT')
  }

  await prisma.favorite.create({
    data: { userId, newsId }
  })

  log.info('FavoriteService', '添加收藏成功', { userId, newsId })
}

export async function removeFavorite(userId: number, newsId: number): Promise<void> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })

  if (!favorite) {
    log.warn('FavoriteService', '收藏记录不存在', { userId, newsId })
    throw new FavoriteError('未收藏该新闻', 'NOT_FOUND')
  }

  await prisma.favorite.delete({
    where: { id: favorite.id }
  })

  log.info('FavoriteService', '取消收藏成功', { userId, newsId })
}

export async function checkFavorite(userId: number, newsId: number): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_newsId: { userId, newsId }
    }
  })

  const isFavorite = !!favorite

  log.info('FavoriteService', '检查收藏状态', { userId, newsId, isFavorite })

  return isFavorite
}

export default {
  getFavoriteList,
  addFavorite,
  removeFavorite,
  checkFavorite
}
