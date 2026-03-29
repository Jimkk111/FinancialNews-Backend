import prisma from '../config/database'
import { GetNewsListInput } from '../validators/news.validator'
import { PaginatedResult } from '../types'

interface NewsItem {
  id: number
  title: string
  summary: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  category: { id: number; name: string } | null
}

export const getNewsList = async (params: GetNewsListInput): Promise<PaginatedResult<NewsItem>> => {
  const { page, pageSize, category, keyword, sortBy } = params
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}
  if (category) {
    where.category = { name: category }
  }
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { summary: { contains: keyword } }
    ]
  }

  const orderBy = sortBy === 'popular' ? { views: 'desc' as const } : { publishTime: 'desc' as const }

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        title: true,
        summary: true,
        publishTime: true,
        source: true,
        views: true,
        hasImage: true,
        imageUrl: true,
        category: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.news.count({ where })
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export const getNewsDetail = async (id: number, userId?: number) => {
  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true }
      },
      newsTags: {
        include: {
          tag: { select: { id: true, name: true } }
        }
      }
    }
  })

  if (!news) {
    return null
  }

  await prisma.news.update({
    where: { id },
    data: { views: { increment: 1 } }
  })

  if (userId) {
    await prisma.history.upsert({
      where: {
        userId_newsId: { userId, newsId: id }
      },
      update: { viewedAt: new Date() },
      create: { userId, newsId: id }
    })
  }

  return {
    ...news,
    tags: news.newsTags.map(nt => nt.tag)
  }
}

export const getCategories = async () => {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' }
  })
}

export const getHotNews = async (limit = 10) => {
  return prisma.news.findMany({
    take: limit,
    orderBy: { views: 'desc' },
    select: {
      id: true,
      title: true,
      views: true,
      hasImage: true,
      imageUrl: true
    }
  })
}
