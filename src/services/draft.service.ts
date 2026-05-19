import prisma from '../config/database'
import { log } from '../utils/logger'
import { generateDraftId } from '../utils/idGenerator'
import { NotFoundError, BadRequestError } from '../types'

export interface DraftListItem {
  id: string
  title: string | null
  content: string | null
  coverImage: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface DraftDetail {
  id: string
  title: string | null
  content: string | null
  coverImage: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDraftData {
  title: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}

export interface UpdateDraftData {
  title?: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}

export interface PublishedNews {
  id: number
  title: string
  summary: string | null
  content: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  createdAt: Date
}

export class DraftError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'DraftError'
  }
}

export async function getDraftList(userId: number): Promise<DraftListItem[]> {
  const drafts = await prisma.draft.findMany({
    where: {
      userId,
      status: 'draft'
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      coverImage: true,
      categoryId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, name: true }
      }
    }
  })

  log.info('DraftService', '获取草稿列表', { userId, count: drafts.length })

  return drafts
}

export async function getDraftById(userId: number, draftId: string): Promise<DraftDetail | null> {
  const draft = await prisma.draft.findFirst({
    where: {
      id: draftId,
      userId
    },
    select: {
      id: true,
      title: true,
      content: true,
      coverImage: true,
      categoryId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, name: true }
      }
    }
  })

  if (!draft) {
    log.warn('DraftService', '草稿不存在', { userId, draftId })
    return null
  }

  log.info('DraftService', '获取草稿详情', { userId, draftId })

  return draft
}

export async function createDraft(userId: number, data: CreateDraftData): Promise<DraftDetail> {
  const { title, content, coverImage, categoryId } = data

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      log.warn('DraftService', '分类不存在', { userId, categoryId })
      throw new BadRequestError('分类不存在')
    }
  }

  const draftId = generateDraftId()

  const draft = await prisma.draft.create({
    data: {
      id: draftId,
      userId,
      title,
      content: content ?? null,
      coverImage: coverImage ?? null,
      categoryId: categoryId ?? null,
      status: 'draft'
    },
    select: {
      id: true,
      title: true,
      content: true,
      coverImage: true,
      categoryId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, name: true }
      }
    }
  })

  log.info('DraftService', '创建草稿成功', { userId, draftId: draft.id })

  return draft
}

export async function updateDraft(
  userId: number,
  draftId: string,
  data: UpdateDraftData
): Promise<DraftDetail> {
  const existingDraft = await prisma.draft.findFirst({
    where: { id: draftId, userId }
  })

  if (!existingDraft) {
    log.warn('DraftService', '草稿不存在', { userId, draftId })
    throw new NotFoundError('草稿不存在')
  }

  if (existingDraft.status !== 'draft') {
    log.warn('DraftService', '草稿已发布，无法编辑', { userId, draftId })
    throw new BadRequestError('草稿已发布，无法编辑')
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      log.warn('DraftService', '分类不存在', { userId, categoryId: data.categoryId })
      throw new BadRequestError('分类不存在')
    }
  }

  const updateData: {
    title?: string
    content?: string | null
    coverImage?: string | null
    categoryId?: number | null
  } = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.content = data.content
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId

  const draft = await prisma.draft.update({
    where: { id: draftId },
    data: updateData,
    select: {
      id: true,
      title: true,
      content: true,
      coverImage: true,
      categoryId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, name: true }
      }
    }
  })

  log.info('DraftService', '更新草稿成功', { userId, draftId })

  return draft
}

export async function deleteDraft(userId: number, draftId: string): Promise<void> {
  const draft = await prisma.draft.findFirst({
    where: { id: draftId, userId }
  })

  if (!draft) {
    log.warn('DraftService', '草稿不存在', { userId, draftId })
    throw new NotFoundError('草稿不存在')
  }

  await prisma.draft.delete({
    where: { id: draftId }
  })

  log.info('DraftService', '删除草稿成功', { userId, draftId })
}

export async function publishDraft(userId: number, draftId: string): Promise<PublishedNews> {
  const draft = await prisma.draft.findFirst({
    where: { id: draftId, userId },
    include: {
      user: {
        select: { username: true }
      }
    }
  })

  if (!draft) {
    log.warn('DraftService', '草稿不存在', { userId, draftId })
    throw new NotFoundError('草稿不存在')
  }

  if (draft.status !== 'draft') {
    log.warn('DraftService', '草稿已发布', { userId, draftId })
    throw new BadRequestError('草稿已发布')
  }

  if (!draft.title) {
    log.warn('DraftService', '草稿标题为空', { userId, draftId })
    throw new BadRequestError('草稿标题不能为空')
  }

  const summary = draft.content ? draft.content.slice(0, 200) : null
  const hasImage = !!draft.coverImage

  const result = await prisma.$transaction(async (tx) => {
    const news = await tx.news.create({
      data: {
        title: draft.title!,
        summary,
        content: draft.content,
        publishTime: new Date(),
        source: draft.user.username,
        views: 0,
        hasImage,
        imageUrl: draft.coverImage,
        categoryId: draft.categoryId,
        userId: userId
      },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        publishTime: true,
        source: true,
        views: true,
        hasImage: true,
        imageUrl: true,
        categoryId: true,
        createdAt: true,
        category: {
          select: { id: true, name: true }
        }
      }
    })

    await tx.draft.update({
      where: { id: draftId },
      data: { status: 'published' }
    })

    return news
  })

  log.info('DraftService', '发布草稿成功', { userId, draftId, newsId: result.id })

  return result
}

export default {
  getDraftList,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft
}
