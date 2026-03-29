import prisma from '../config/database'
import { log } from '../utils/logger'

export interface ListOptions {
  page: number
  pageSize: number
}

export interface HistoryNewsItem {
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
  viewedAt: Date
}

export interface HistoryListResult {
  data: HistoryNewsItem[]
  total: number
  page: number
  pageSize: number
}

export interface AddHistoryData {
  newsId: number
}

export class HistoryError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'HistoryError'
  }
}

export async function getHistoryList(userId: number, options: ListOptions): Promise<HistoryListResult> {
  const { page, pageSize } = options
  const skip = (page - 1) * pageSize

  const where = {
    userId,
    news: { deletedAt: null }
  }

  const [historyItems, total] = await Promise.all([
    prisma.history.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { viewedAt: 'desc' },
      select: {
        viewedAt: true,
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
    prisma.history.count({ where })
  ])

  const data: HistoryNewsItem[] = historyItems.map((item) => ({
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
    viewedAt: item.viewedAt
  }))

  log.info('HistoryService', '获取浏览历史', { userId, page, pageSize, total })

  return { data, total, page, pageSize }
}

export async function addHistory(userId: number, data: AddHistoryData): Promise<void> {
  const { newsId } = data

  const news = await prisma.news.findFirst({
    where: { id: newsId, deletedAt: null },
    select: { id: true }
  })

  if (!news) {
    log.warn('HistoryService', '新闻不存在', { userId, newsId })
    throw new HistoryError('新闻不存在', 'NOT_FOUND')
  }

  const existingHistory = await prisma.history.findFirst({
    where: { userId, newsId }
  })

  if (existingHistory) {
    await prisma.history.update({
      where: { id: existingHistory.id },
      data: { viewedAt: new Date() }
    })
  } else {
    await prisma.history.create({
      data: { userId, newsId }
    })
  }

  log.info('HistoryService', '添加浏览记录成功', { userId, newsId })
}

export async function clearHistory(userId: number): Promise<void> {
  const result = await prisma.history.deleteMany({
    where: { userId }
  })

  log.info('HistoryService', '清空浏览历史', { userId, count: result.count })
}

export default {
  getHistoryList,
  addHistory,
  clearHistory
}
