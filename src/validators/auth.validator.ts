import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
    code: z.string().length(6, '验证码必须是6位')
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(1, '密码不能为空')
  })
})

export const sendCodeSchema = z.object({
  body: z.object({
    email: z.string().email('邮箱格式不正确'),
    username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符').optional()
  })
})

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('邮箱格式不正确'),
    code: z.string().length(6, '验证码必须是6位'),
    newPassword: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符')
  })
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type SendCodeInput = z.infer<typeof sendCodeSchema>['body']
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body']
