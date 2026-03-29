import { z } from 'zod'

export const historyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
})

export const addHistorySchema = z.object({
  newsId: z.number().int().positive('新闻ID必须是正整数'),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  source: z.string().max(100, '来源不能超过100个字符').nullable().optional(),
  publish_time: z.string().datetime({ message: '发布时间格式不正确' }).nullable().optional(),
  views: z.number().int().min(0, '浏览量不能为负数').default(0)
})

export type HistoryListQuery = z.infer<typeof historyListQuerySchema>
export type AddHistoryBody = z.infer<typeof addHistorySchema>

export default {
  historyListQuerySchema,
  addHistorySchema
}
