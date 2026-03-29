import prisma from '../config/database'
import { GetHistoryInput } from '../validators/history.validator'
import { PaginatedResult } from '../types'

interface HistoryItem {
  id: number
  viewedAt: Date
  news: {
    id: number
    title: string
    summary: string | null
    source: string | null
    hasImage: boolean
    imageUrl: string | null
  }
}

export const getHistory = async (
  userId: number,
  params: GetHistoryInput
): Promise<PaginatedResult<HistoryItem>> => {
  const { page, pageSize } = params
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    prisma.history.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { viewedAt: 'desc' },
      select: {
        id: true,
        viewedAt: true,
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
    prisma.history.count({ where: { userId } })
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export const clearHistory = async (userId: number) => {
  await prisma.history.deleteMany({
    where: { userId }
  })
}

export const removeHistoryItem = async (userId: number, historyId: number) => {
  const history = await prisma.history.findFirst({
    where: { id: historyId, userId }
  })

  if (!history) {
    return false
  }

  await prisma.history.delete({
    where: { id: historyId }
  })

  return true
}
