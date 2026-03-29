import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { success } from '../utils/response'
import { log } from '../utils/logger'

interface LoginRequest {
  username: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  code: string
}

interface SendCodeRequest {
  email: string
  username?: string
}

interface ResetPasswordRequest {
  username: string
  email: string
  code: string
  password: string
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body as LoginRequest

    const result = await authService.validateUser(username, password)

    log.info('AuthController', '登录成功', { username })

    success(res, {
      access_token: result.accessToken,
      user: result.user
    })
  } catch (error) {
    next(error)
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as RegisterRequest

    const result = await authService.registerUser(data)

    log.info('AuthController', '注册成功', { username: data.username })

    success(res, {
      access_token: result.accessToken,
      user: result.user
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    success(res, { message: '登出成功' })
  } catch (error) {
    next(error)
  }
}

export async function sendCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username } = req.body as SendCodeRequest

    await authService.createVerificationCode(email, username)

    log.info('AuthController', '验证码发送成功', { email })

    success(res, { message: '验证码已发送' })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as ResetPasswordRequest

    await authService.resetPassword(data)

    log.info('AuthController', '密码重置成功', { username: data.username })

    success(res, { message: '密码重置成功' })
  } catch (error) {
    next(error)
  }
}

export default {
  login,
  register,
  logout,
  sendCode,
  resetPassword
}
