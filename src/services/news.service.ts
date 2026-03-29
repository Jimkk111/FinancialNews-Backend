import prisma from '../config/database'
import { log } from '../utils/logger'

export interface NewsListOptions {
  page: number
  pageSize: number
  categoryId?: number
  sort?: 'newest' | 'popular'
}

export interface NewsListItem {
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
}

export interface NewsListResult {
  data: NewsListItem[]
  total: number
  page: number
  pageSize: number
}

export interface NewsDetail {
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
  tags: { id: number; name: string }[]
  createdAt: Date
}

export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}

export interface SearchOptions {
  keyword: string
  page: number
  pageSize: number
}

export interface SearchResult {
  data: NewsListItem[]
  total: number
  page: number
  pageSize: number
  keyword: string
}

export async function getNewsList(options: NewsListOptions): Promise<NewsListResult> {
  const { page, pageSize, categoryId, sort } = options
  const skip = (page - 1) * pageSize

  const where = {
    deletedAt: null,
    ...(categoryId && { categoryId })
  }

  const orderBy = sort === 'popular' ? { views: 'desc' as const } : { publishTime: 'desc' as const }

  const [news, total] = await Promise.all([
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
    }),
    prisma.news.count({ where })
  ])

  const data: NewsListItem[] = news.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    publishTime: item.publishTime,
    source: item.source,
    views: item.views,
    hasImage: item.hasImage,
    imageUrl: item.imageUrl,
    categoryId: item.categoryId,
    category: item.category,
    tags: item.newsTags.map((nt) => nt.tag)
  }))

  log.info('NewsService', '获取新闻列表', { page, pageSize, categoryId, sort, total })

  return { data, total, page, pageSize }
}

export async function getNewsById(id: number): Promise<NewsDetail | null> {
  const news = await prisma.news.findFirst({
    where: {
      id,
      deletedAt: null
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
      },
      newsTags: {
        select: {
          tag: { select: { id: true, name: true } }
        }
      }
    }
  })

  if (!news) {
    log.warn('NewsService', '新闻不存在', { id })
    return null
  }

  const result: NewsDetail = {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    publishTime: news.publishTime,
    source: news.source,
    views: news.views,
    hasImage: news.hasImage,
    imageUrl: news.imageUrl,
    categoryId: news.categoryId,
    category: news.category,
    tags: news.newsTags.map((nt) => nt.tag),
    createdAt: news.createdAt
  }

  log.info('NewsService', '获取新闻详情', { id })

  return result
}

export async function incrementViews(id: number): Promise<{ id: number; views: number } | null> {
  const news = await prisma.news.findFirst({
    where: { id, deletedAt: null },
    select: { id: true }
  })

  if (!news) {
    log.warn('NewsService', '新闻不存在，无法增加浏览量', { id })
    return null
  }

  const updated = await prisma.news.update({
    where: { id },
    data: { views: { increment: 1 } },
    select: { id: true, views: true }
  })

  log.info('NewsService', '增加浏览量', { id, views: updated.views })

  return updated
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' }
  })

  log.info('NewsService', '获取分类列表', { count: categories.length })

  return categories
}

export async function getTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' }
  })

  log.info('NewsService', '获取标签列表', { count: tags.length })

  return tags
}

export async function searchNews(options: SearchOptions): Promise<SearchResult> {
  const { keyword, page, pageSize } = options
  const skip = (page - 1) * pageSize

  const where = {
    deletedAt: null,
    OR: [
      { title: { contains: keyword } },
      { summary: { contains: keyword } }
    ]
  }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { publishTime: 'desc' },
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
    }),
    prisma.news.count({ where })
  ])

  const data: NewsListItem[] = news.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    publishTime: item.publishTime,
    source: item.source,
    views: item.views,
    hasImage: item.hasImage,
    imageUrl: item.imageUrl,
    categoryId: item.categoryId,
    category: item.category,
    tags: item.newsTags.map((nt) => nt.tag)
  }))

  log.info('NewsService', '搜索新闻', { keyword, page, pageSize, total })

  return { data, total, page, pageSize, keyword }
}

export default {
  getNewsList,
  getNewsById,
  incrementViews,
  getCategories,
  getTags,
  searchNews
}
