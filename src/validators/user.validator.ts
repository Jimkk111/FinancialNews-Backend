import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符').optional(),
    avatar: z.string().url('头像必须是有效的URL').optional()
  })
})

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, '旧密码不能为空'),
    newPassword: z.string().min(6, '新密码至少6个字符').max(100, '新密码最多100个字符')
  })
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body']
