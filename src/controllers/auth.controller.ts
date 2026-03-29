import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import * as authService from '../services/auth.service'
import * as emailService from '../services/email.service'

export const register = async (req: Request, res: Response): Promise<Response> => {
  const result = await authService.register(req.body)
  return success(res, result, 201)
}

export const login = async (req: Request, res: Response): Promise<Response> => {
  const result = await authService.login(req.body)
  return success(res, result)
}

export const sendCode = async (req: Request, res: Response): Promise<Response> => {
  const { email, username, type } = req.body
  
  if (type === 'register') {
    await authService.sendRegisterCode({ email, username })
  } else if (type === 'reset') {
    await authService.sendResetCode(email)
  } else {
    await emailService.sendVerificationEmail(email, username)
  }
  
  return success(res, { message: '验证码已发送' })
}

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  await authService.resetPassword(req.body)
  return success(res, { message: '密码重置成功' })
}

export const getMe = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return error(res, '未认证', 'UNAUTHORIZED', 401)
  }
  
  const user = await authService.login({ 
    email: '', 
    password: '' 
  }).catch(() => null)
  
  return success(res, { user: req.user })
}
