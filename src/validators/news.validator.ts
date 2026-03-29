import { z } from 'zod'

export const newsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  categoryId: z.coerce.number().int().positive().optional(),
  sort: z.enum(['newest', 'popular']).optional()
})

export const newsIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const searchQuerySchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词不能超过100个字符'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
})

export type NewsListQuery = z.infer<typeof newsListQuerySchema>
export type NewsIdParams = z.infer<typeof newsIdParamsSchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>

export default {
  newsListQuerySchema,
  newsIdParamsSchema,
  searchQuerySchema
}
