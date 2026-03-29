import { Request, Response } from 'express'
import { success } from '../utils/response'
import * as userService from '../services/user.service'

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const profile = await userService.getProfile(userId)
  return success(res, profile)
}

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const profile = await userService.updateProfile(userId, req.body)
  return success(res, profile)
}

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  await userService.changePassword(userId, req.body)
  return success(res, { message: '密码修改成功' })
}

export const getStats = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.userId
  const stats = await userService.getUserStats(userId)
  return success(res, stats)
}
