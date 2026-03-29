import { z } from 'zod'

const sessionIdRegex = /^session-[a-f0-9]{8}$/

export const updateSessionSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题不能超过100个字符')
})

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system'], { message: '角色必须是 user、assistant 或 system' }),
        content: z.string().min(1, '消息内容不能为空').max(4000, '消息内容不能超过4000个字符')
      })
    )
    .min(1, '消息列表不能为空')
    .max(50, '消息列表不能超过50条'),
  sessionId: z.string().regex(sessionIdRegex, '会话ID格式不正确').optional(),
  stream: z.boolean().optional()
})

export const sessionIdParamSchema = z.object({
  sessionId: z.string().regex(sessionIdRegex, '会话ID格式不正确')
})

export default {
  updateSessionSchema,
  chatSchema,
  sessionIdParamSchema
}
