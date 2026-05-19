import prisma from '../config/database'
import { aiConfig, ChatMessage, ChatCompletionResponse } from '../config/ai'
import { generateSessionId } from '../utils/idGenerator'
import { NotFoundError, ForbiddenError, BadRequestError } from '../types'
import { log } from '../utils/logger'

interface SessionInfo {
  sessionId: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  lastMessage?: string
}

interface ChatRequest {
  messages: ChatMessage[]
  sessionId?: string
  stream?: boolean
}

interface ChatResponse {
  role: 'assistant'
  content: string
  sessionId: string
}

const TITLE_MAX_LENGTH = 30

async function generateSessionTitle(userMessage: string): Promise<string> {
  if (!aiConfig.apiKey) {
    return userMessage.substring(0, TITLE_MAX_LENGTH)
  }

  try {
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: '请用简短的中文标题概括以下对话主题，不超过15个字，只返回标题，不要其他内容。'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      return userMessage.substring(0, TITLE_MAX_LENGTH)
    }

    const result = (await response.json()) as ChatCompletionResponse
    const title = result.choices[0]?.message?.content?.trim() || userMessage.substring(0, TITLE_MAX_LENGTH)
    
    return title.substring(0, TITLE_MAX_LENGTH)
  } catch {
    return userMessage.substring(0, TITLE_MAX_LENGTH)
  }
}

export async function getSessions(userId: number): Promise<SessionInfo[]> {
  const sessions = await prisma.aiSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      sessionId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true }
      }
    }
  })

  return sessions.map(session => ({
    sessionId: session.sessionId,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    lastMessage: session.messages[0]?.content?.substring(0, 100)
  }))
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId()

  await prisma.aiSession.create({
    data: {
      sessionId,
      userId
    }
  })

  log.info('AIService', '创建会话成功', { userId, sessionId })

  return sessionId
}

export async function getSessionMessages(
  sessionId: string,
  userId: number
): Promise<Array<{ role: string; content: string; createdAt: Date }>> {
  const session = await prisma.aiSession.findUnique({
    where: { sessionId }
  })

  if (!session) {
    throw new NotFoundError('会话不存在')
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('无权访问此会话')
  }

  const messages = await prisma.aiMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    select: {
      role: true,
      content: true,
      createdAt: true
    }
  })

  return messages
}

export async function updateSessionTitle(
  sessionId: string,
  userId: number,
  title: string
): Promise<void> {
  const session = await prisma.aiSession.findUnique({
    where: { sessionId }
  })

  if (!session) {
    throw new NotFoundError('会话不存在')
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('无权访问此会话')
  }

  await prisma.aiSession.update({
    where: { sessionId },
    data: { title }
  })

  log.info('AIService', '更新会话标题成功', { userId, sessionId, title })
}

export async function deleteSession(sessionId: string, userId: number): Promise<void> {
  const session = await prisma.aiSession.findUnique({
    where: { sessionId }
  })

  if (!session) {
    throw new NotFoundError('会话不存在')
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('无权访问此会话')
  }

  await prisma.aiSession.delete({
    where: { sessionId }
  })

  log.info('AIService', '删除会话成功', { userId, sessionId })
}

export async function chat(userId: number, data: ChatRequest): Promise<ChatResponse> {
  if (!aiConfig.apiKey) {
    throw new BadRequestError('AI服务未配置')
  }

  let sessionId = data.sessionId
  let session = null

  if (sessionId) {
    session = await prisma.aiSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      throw new NotFoundError('会话不存在')
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('无权访问此会话')
    }
  } else {
    sessionId = generateSessionId()
    session = await prisma.aiSession.create({
      data: {
        sessionId,
        userId
      }
    })
  }

  const messagesToSend: ChatMessage[] = data.messages.slice(-20)

  try {
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: messagesToSend,
        max_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error('AIService', 'AI API调用失败', { status: response.status, error: errorText })
      throw new BadRequestError('AI服务调用失败')
    }

    const result = (await response.json()) as ChatCompletionResponse
    const assistantContent = result.choices[0]?.message?.content || ''

    const userMessage = messagesToSend[messagesToSend.length - 1]?.content || ''
    const shouldGenerateTitle = !session.title
    let generatedTitle: string | null = null

    if (shouldGenerateTitle) {
      generatedTitle = await generateSessionTitle(userMessage)
    }

    await prisma.$transaction([
      prisma.aiMessage.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: userMessage
        }
      }),
      prisma.aiMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: assistantContent
        }
      }),
      prisma.aiSession.update({
        where: { id: session.id },
        data: {
          updatedAt: new Date(),
          ...(generatedTitle && { title: generatedTitle })
        }
      })
    ])

    log.info('AIService', 'AI对话成功', { userId, sessionId })

    return {
      role: 'assistant',
      content: assistantContent,
      sessionId
    }
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error
    }
    log.error('AIService', 'AI对话异常', undefined, error instanceof Error ? error : undefined)
    throw new BadRequestError('AI服务暂时不可用')
  }
}

export async function chatStream(
  userId: number,
  data: ChatRequest,
  onChunk: (chunk: string) => void
): Promise<ChatResponse> {
  if (!aiConfig.apiKey) {
    throw new BadRequestError('AI服务未配置')
  }

  let sessionId = data.sessionId
  let session = null

  if (sessionId) {
    session = await prisma.aiSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      throw new NotFoundError('会话不存在')
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('无权访问此会话')
    }
  } else {
    sessionId = generateSessionId()
    session = await prisma.aiSession.create({
      data: {
        sessionId,
        userId
      }
    })
  }

  const messagesToSend: ChatMessage[] = data.messages.slice(-20)

  try {
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: messagesToSend,
        max_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        stream: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error('AIService', 'AI API调用失败', { status: response.status, error: errorText })
      throw new BadRequestError('AI服务调用失败')
    }

    if (!response.body) {
      throw new BadRequestError('AI服务响应异常')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    const userMessage = messagesToSend[messagesToSend.length - 1]?.content || ''
    const shouldGenerateTitle = !session.title

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

      for (const line of lines) {
        const data = line.replace('data:', '').trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices[0]?.delta?.content || ''
          if (content) {
            fullContent += content
            onChunk(content)
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    let generatedTitle: string | null = null
    if (shouldGenerateTitle) {
      generatedTitle = await generateSessionTitle(userMessage)
    }

    await prisma.$transaction([
      prisma.aiMessage.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: userMessage
        }
      }),
      prisma.aiMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: fullContent
        }
      }),
      prisma.aiSession.update({
        where: { id: session.id },
        data: {
          updatedAt: new Date(),
          ...(generatedTitle && { title: generatedTitle })
        }
      })
    ])

    log.info('AIService', 'AI流式对话成功', { userId, sessionId })

    return {
      role: 'assistant',
      content: fullContent,
      sessionId
    }
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error
    }
    log.error('AIService', 'AI流式对话异常', undefined, error instanceof Error ? error : undefined)
    throw new BadRequestError('AI服务暂时不可用')
  }
}

export default {
  getSessions,
  createSession,
  getSessionMessages,
  updateSessionTitle,
  deleteSession,
  chat,
  chatStream
}
