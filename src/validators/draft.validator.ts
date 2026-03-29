import { z } from 'zod'

export const draftIdParamsSchema = z.object({
  id: z.string().min(1).max(50)
})

export const createDraftSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  content: z.string().max(50000, '内容不能超过50000个字符').nullable().optional(),
  coverImage: z.string().url('封面图必须是有效的URL').max(500, '封面图URL不能超过500个字符').nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional()
})

export const updateDraftSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  content: z.string().max(50000, '内容不能超过50000个字符').nullable().optional(),
  coverImage: z.string().url('封面图必须是有效的URL').max(500, '封面图URL不能超过500个字符').nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional()
})

export type DraftIdParams = z.infer<typeof draftIdParamsSchema>
export type CreateDraftBody = z.infer<typeof createDraftSchema>
export type UpdateDraftBody = z.infer<typeof updateDraftSchema>

export default {
  draftIdParamsSchema,
  createDraftSchema,
  updateDraftSchema
}
