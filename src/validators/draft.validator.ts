import { z } from 'zod'

export const createDraftSchema = z.object({
  body: z.object({
    title: z.string().max(200, '标题最多200个字符').optional(),
    content: z.string().optional(),
    coverImage: z.string().url('封面图必须是有效的URL').optional(),
    categoryId: z.number().int().positive('分类ID必须是正整数').optional()
  })
})

export const updateDraftSchema = z.object({
  params: z.object({
    id: z.string().min(1, '草稿ID不能为空')
  }),
  body: z.object({
    title: z.string().max(200, '标题最多200个字符').optional(),
    content: z.string().optional(),
    coverImage: z.string().url('封面图必须是有效的URL').optional(),
    categoryId: z.number().int().positive('分类ID必须是正整数').optional(),
    status: z.enum(['draft', 'published']).optional()
  })
})

export const getDraftsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10'),
    status: z.enum(['draft', 'published']).optional()
  })
})

export type CreateDraftInput = z.infer<typeof createDraftSchema>['body']
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>['body']
export type GetDraftsInput = z.infer<typeof getDraftsSchema>['query']
