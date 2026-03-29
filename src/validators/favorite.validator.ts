import { z } from 'zod'

export const addFavoriteSchema = z.object({
  body: z.object({
    newsId: z.number().int().positive('新闻ID必须是正整数')
  })
})

export const removeFavoriteSchema = z.object({
  params: z.object({
    newsId: z.string().regex(/^\d+$/).transform(Number)
  })
})

export const getFavoritesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    pageSize: z.string().regex(/^\d+$/).transform(Number).default('10')
  })
})

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>['body']
export type RemoveFavoriteInput = z.infer<typeof removeFavoriteSchema>['params']
export type GetFavoritesInput = z.infer<typeof getFavoritesSchema>['query']
