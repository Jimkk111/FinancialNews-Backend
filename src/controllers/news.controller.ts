import { Request, Response, NextFunction } from 'express'
import * as newsService from '../services/news.service'
import { success, paginated, notFound } from '../utils/response'
import { log } from '../utils/logger'
import { NewsListQuery, SearchQuery } from '../validators/news.validator'

export async function getNewsList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as NewsListQuery

    const result = await newsService.getNewsList({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 10,
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
      sort: query.sort
    })

    log.info('NewsController', '获取新闻列表成功', { page: query.page, pageSize: query.pageSize, total: result.total })

    paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (error) {
    next(error)
  }
}

export async function getNewsById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const newsId = parseInt(id, 10)

    const news = await newsService.getNewsById(newsId)

    if (!news) {
      log.warn('NewsController', '新闻不存在', { id: newsId })
      notFound(res, '新闻不存在')
      return
    }

    log.info('NewsController', '获取新闻详情成功', { id: newsId })

    success(res, news)
  } catch (error) {
    next(error)
  }
}

export async function incrementViews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const newsId = parseInt(id, 10)

    const result = await newsService.incrementViews(newsId)

    if (!result) {
      log.warn('NewsController', '新闻不存在，无法增加浏览量', { id: newsId })
      notFound(res, '新闻不存在')
      return
    }

    log.info('NewsController', '增加浏览量成功', { id: newsId, views: result.views })

    success(res, result)
  } catch (error) {
    next(error)
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await newsService.getCategories()

    log.info('NewsController', '获取分类列表成功', { count: categories.length })

    success(res, categories)
  } catch (error) {
    next(error)
  }
}

export async function getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await newsService.getTags()

    log.info('NewsController', '获取标签列表成功', { count: tags.length })

    success(res, tags)
  } catch (error) {
    next(error)
  }
}

export async function searchNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as SearchQuery

    const result = await newsService.searchNews({
      keyword: query.keyword,
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 10
    })

    log.info('NewsController', '搜索新闻成功', { keyword: query.keyword, total: result.total })

    paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (error) {
    next(error)
  }
}

export default {
  getNewsList,
  getNewsById,
  incrementViews,
  getCategories,
  getTags,
  searchNews
}
