import { z } from 'zod'

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
  password: z.string().min(6, '密码长度至少6位').max(128, '密码长度不能超过128位')
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, '用户名长度至少3位')
    .max(50, '用户名不能超过50个字符')
    .regex(usernameRegex, '用户名必须以字母开头，只能包含字母、数字和下划线'),
  email: z.string().email('邮箱格式不正确').max(100, '邮箱不能超过100个字符'),
  password: z
    .string()
    .min(8, '密码长度至少8位')
    .max(128, '密码长度不能超过128位')
    .regex(/[a-zA-Z]/, '密码必须包含字母')
    .regex(/[0-9]/, '密码必须包含数字'),
  code: z.string().length(6, '验证码必须是6位数字').regex(/^\d{6}$/, '验证码必须是6位数字')
})

export const sendCodeSchema = z.object({
  email: z.string().email('邮箱格式不正确').max(100, '邮箱不能超过100个字符'),
  username: z.string().max(50, '用户名不能超过50个字符').optional()
})

export const resetPasswordSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
  email: z.string().email('邮箱格式不正确').max(100, '邮箱不能超过100个字符'),
  code: z.string().length(6, '验证码必须是6位数字').regex(/^\d{6}$/, '验证码必须是6位数字'),
  password: z
    .string()
    .min(8, '密码长度至少8位')
    .max(128, '密码长度不能超过128位')
    .regex(/[a-zA-Z]/, '密码必须包含字母')
    .regex(/[0-9]/, '密码必须包含数字')
})

export default {
  loginSchema,
  registerSchema,
  sendCodeSchema,
  resetPasswordSchema
}
