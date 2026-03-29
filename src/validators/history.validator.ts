import { z } from 'zod'

export const getHistorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10')
  })
})

export type GetHistoryInput = z.infer<typeof getHistorySchema>['query']
