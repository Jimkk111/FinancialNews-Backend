import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as aiService from '../services/ai.service'

export const createSession = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const { title } = req.body
  const session = await aiService.createSession(userId, title)
  return success(res, session, 201)
}

export const getSessions = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const sessions = await aiService.getSessions(userId)
  return success(res, sessions)
}

export const getSession = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const session = await aiService.getSession(userId, req.params.sessionId)
  return success(res, session)
}

export const deleteSession = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  await aiService.deleteSession(userId, req.params.sessionId)
  return success(res, { message: '删除成功' })
}

export const chat = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const { message } = req.body
  const reply = await aiService.chat(userId, req.params.sessionId, message)
  return success(res, { reply })
}
