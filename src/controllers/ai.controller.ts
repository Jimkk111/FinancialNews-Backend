import { Request, Response, NextFunction } from 'express'
import * as aiService from '../services/ai.service'
import { success } from '../utils/response'
import { log } from '../utils/logger'

interface UpdateSessionRequest {
  title: string
}

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  sessionId?: string
  stream?: boolean
}

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const sessions = await aiService.getSessions(userId)

    success(res, sessions)
  } catch (error) {
    next(error)
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const sessionId = await aiService.createSession(userId)

    log.info('AIController', '创建会话成功', { userId, sessionId })

    success(res, { session_id: sessionId })
  } catch (error) {
    next(error)
  }
}

export async function getSessionMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const sessionId = req.params.sessionId as string

    const messages = await aiService.getSessionMessages(sessionId, userId)

    success(res, messages)
  } catch (error) {
    next(error)
  }
}

export async function updateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const sessionId = req.params.sessionId as string
    const { title } = req.body as UpdateSessionRequest

    await aiService.updateSessionTitle(sessionId, userId, title)

    log.info('AIController', '更新会话标题成功', { userId, sessionId })

    success(res, { message: '更新成功' })
  } catch (error) {
    next(error)
  }
}

export async function deleteSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const sessionId = req.params.sessionId as string

    await aiService.deleteSession(sessionId, userId)

    log.info('AIController', '删除会话成功', { userId, sessionId })

    success(res, { message: '删除成功' })
  } catch (error) {
    next(error)
  }
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = req.body as ChatRequest

    if (data.stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const result = await aiService.chatStream(userId, data, (chunk: string) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      })

      res.write(`data: ${JSON.stringify({ sessionId: result.sessionId })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()

      log.info('AIController', '流式对话完成', { userId, sessionId: result.sessionId })
    } else {
      const result = await aiService.chat(userId, data)

      log.info('AIController', '对话完成', { userId, sessionId: result.sessionId })

      success(res, result)
    }
  } catch (error) {
    if (req.body?.stream && !res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'AI服务暂时不可用' })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }
    next(error)
  }
}

export function healthCheck(_req: Request, res: Response): void {
  res.json({ success: true, status: 'healthy' })
}

export default {
  getSessions,
  createSession,
  getSessionMessages,
  updateSession,
  deleteSession,
  chat,
  healthCheck
}
