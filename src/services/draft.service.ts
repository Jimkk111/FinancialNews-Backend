import prisma from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { generateDraftId } from '../utils/idGenerator'
import { CreateDraftInput, UpdateDraftInput, GetDraftsInput } from '../validators/draft.validator'
import { PaginatedResult } from '../types'

interface DraftItem {
  id: string
  title: string | null
  coverImage: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  category: { id: number; name: string } | null
}

export const getDrafts = async (
  userId: number,
  params: GetDraftsInput
): Promise<PaginatedResult<DraftItem>> => {
  const { page, pageSize, status } = params
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = { userId }
  if (status) {
    where.status = status
  }

  const [items, total] = await Promise.all([
    prisma.draft.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        coverImage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.draft.count({ where })
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export const getDraft = async (userId: number, id: string) => {
  const draft = await prisma.draft.findFirst({
    where: { id, userId },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  })

  if (!draft) {
    throw new AppError('草稿不存在', 'DRAFT_NOT_FOUND', 404)
  }

  return draft
}

export const createDraft = async (userId: number, data: CreateDraftInput) => {
  return prisma.draft.create({
    data: {
      id: generateDraftId(),
      userId,
      ...data
    }
  })
}

export const updateDraft = async (userId: number, id: string, data: UpdateDraftInput) => {
  const draft = await prisma.draft.findFirst({
    where: { id, userId }
  })

  if (!draft) {
    throw new AppError('草稿不存在', 'DRAFT_NOT_FOUND', 404)
  }

  return prisma.draft.update({
    where: { id },
    data
  })
}

export const deleteDraft = async (userId: number, id: string) => {
  const draft = await prisma.draft.findFirst({
    where: { id, userId }
  })

  if (!draft) {
    throw new AppError('草稿不存在', 'DRAFT_NOT_FOUND', 404)
  }

  await prisma.draft.delete({
    where: { id }
  })
}
