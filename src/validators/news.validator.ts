import { z } from 'zod'

export const getNewsListSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10'),
    category: z.string().optional(),
    keyword: z.string().optional(),
    sortBy: z.enum(['latest', 'popular']).default('latest')
  })
})

export const getNewsDetailSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  })
})

export type GetNewsListInput = z.infer<typeof getNewsListSchema>['query']
export type GetNewsDetailInput = z.infer<typeof getNewsDetailSchema>['params']
