import prisma from '../config/database'
import { config } from '../config'
import { AppError } from '../middlewares/error.middleware'
import { generateSessionId } from '../utils/idGenerator'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const createSession = async (userId: number, title?: string) => {
  return prisma.aiSession.create({
    data: {
      sessionId: generateSessionId(),
      userId,
      title: title || '新对话'
    }
  })
}

export const getSessions = async (userId: number) => {
  return prisma.aiSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      sessionId: true,
      title: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export const getSession = async (userId: number, sessionId: string) => {
  const session = await prisma.aiSession.findFirst({
    where: { sessionId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!session) {
    throw new AppError('会话不存在', 'SESSION_NOT_FOUND', 404)
  }

  return session
}

export const deleteSession = async (userId: number, sessionId: string) => {
  const session = await prisma.aiSession.findFirst({
    where: { sessionId, userId }
  })

  if (!session) {
    throw new AppError('会话不存在', 'SESSION_NOT_FOUND', 404)
  }

  await prisma.aiSession.delete({
    where: { id: session.id }
  })
}

export const chat = async (
  userId: number,
  sessionId: string,
  message: string
): Promise<string> => {
  const session = await prisma.aiSession.findFirst({
    where: { sessionId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 20
      }
    }
  })

  if (!session) {
    throw new AppError('会话不存在', 'SESSION_NOT_FOUND', 404)
  }

  await prisma.aiMessage.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: message
    }
  })

  const messages: ChatMessage[] = session.messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content
  }))
  messages.push({ role: 'user', content: message })

  let assistantMessage: string

  if (!config.ai.apiKey || !config.ai.apiUrl) {
    assistantMessage = 'AI服务未配置，请联系管理员。'
  } else {
    try {
      const response = await fetch(`${config.ai.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error('AI API request failed')
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> }
      assistantMessage = data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
    } catch {
      assistantMessage = '抱歉，AI服务暂时不可用，请稍后再试。'
    }
  }

  await prisma.aiMessage.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: assistantMessage
    }
  })

  if (!session.title || session.title === '新对话') {
    await prisma.aiSession.update({
      where: { id: session.id },
      data: { title: message.substring(0, 50) }
    })
  }

  return assistantMessage
}
