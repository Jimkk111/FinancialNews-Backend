import prisma from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken } from '../utils/token'
import { generateUid, generateDisplayId } from '../utils/idGenerator'
import { RegisterInput, LoginInput, SendCodeInput, ResetPasswordInput } from '../validators/auth.validator'
import { sendVerificationEmail, verifyCode } from './email.service'

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username }
      ]
    }
  })

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new AppError('邮箱已被注册', 'EMAIL_EXISTS', 422)
    }
    throw new AppError('用户名已被使用', 'USERNAME_EXISTS', 422)
  }

  const isValidCode = await verifyCode(data.email, data.code)
  if (!isValidCode) {
    throw new AppError('验证码无效或已过期', 'INVALID_CODE', 422)
  }

  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: {
      uid: generateUid(),
      displayId: generateDisplayId(),
      username: data.username,
      email: data.email,
      passwordHash
    }
  })

  const token = generateToken({ userId: user.id, uid: user.uid })

  return {
    user: {
      id: user.id,
      uid: user.uid,
      displayId: user.displayId,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    },
    token
  }
}

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new AppError('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
  }

  const isValidPassword = await comparePassword(data.password, user.passwordHash)
  if (!isValidPassword) {
    throw new AppError('邮箱或密码错误', 'INVALID_CREDENTIALS', 401)
  }

  const token = generateToken({ userId: user.id, uid: user.uid })

  return {
    user: {
      id: user.id,
      uid: user.uid,
      displayId: user.displayId,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    },
    token
  }
}

export const sendRegisterCode = async (data: SendCodeInput) => {
  if (data.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })
    if (existingUser) {
      throw new AppError('用户名已被使用', 'USERNAME_EXISTS', 422)
    }
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email }
  })
  if (existingEmail) {
    throw new AppError('邮箱已被注册', 'EMAIL_EXISTS', 422)
  }

  await sendVerificationEmail(data.email, data.username)
}

export const sendResetCode = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new AppError('该邮箱未注册', 'EMAIL_NOT_FOUND', 404)
  }

  await sendVerificationEmail(email)
}

export const resetPassword = async (data: ResetPasswordInput) => {
  const isValidCode = await verifyCode(data.email, data.code)
  if (!isValidCode) {
    throw new AppError('验证码无效或已过期', 'INVALID_CODE', 422)
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new AppError('用户不存在', 'USER_NOT_FOUND', 404)
  }

  const passwordHash = await hashPassword(data.newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  })
}
