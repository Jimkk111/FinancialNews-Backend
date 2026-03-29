import { z } from 'zod'

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, '用户名必须以字母开头，只能包含字母、数字和下划线')
    .optional(),
  email: z
    .string()
    .email('邮箱格式不正确')
    .max(100, '邮箱最多100个字符')
    .optional()
}).refine(
  (data) => data.username !== undefined || data.email !== undefined,
  { message: '至少提供一个要更新的字段' }
)

export type UpdateUserInput = z.infer<typeof updateUserSchema>
