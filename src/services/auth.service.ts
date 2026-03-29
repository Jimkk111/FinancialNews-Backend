import prisma from '../config/database'
import { comparePassword } from '../utils/password'
import { generateToken } from '../utils/token'
import { UnauthorizedError, ValidationError, NotFoundError } from '../types'
import { log } from '../utils/logger'
import { generateVerificationCode } from '../utils/idGenerator'
import { sendVerificationCode as sendVerificationEmail } from './email.service'
import { createUser, findUserByUsername, findUserByEmail, updateUserPassword } from './user.service'

interface LoginResult {
  accessToken: string
  user: {
    id: number
    uid: string
    username: string
    email: string
    avatar: string | null
  }
}

interface UserWithoutPassword {
  id: number
  uid: string
  displayId: string
  username: string
  email: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

interface RegisterData {
  username: string
  email: string
  password: string
  code: string
}

interface RegisterResult {
  accessToken: string
  user: UserWithoutPassword
}

interface ResetPasswordData {
  username: string
  email: string
  code: string
  password: string
}

const CODE_EXPIRE_MINUTES = 5

export async function validateUser(identifier: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
      deletedAt: null
    }
  })

  if (!user) {
    log.warn('AuthService', '用户不存在', { identifier })
    throw new UnauthorizedError('用户名或密码错误')
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash)

  if (!isPasswordValid) {
    log.warn('AuthService', '密码错误', { identifier, userId: user.id })
    throw new UnauthorizedError('用户名或密码错误')
  }

  const accessToken = generateToken({
    userId: user.id,
    uid: user.uid,
    username: user.username
  })

  log.info('AuthService', '用户登录成功', { userId: user.id, username: user.username })

  return {
    accessToken,
    user: {
      id: user.id,
      uid: user.uid,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }
  }
}

export async function getUserById(userId: number): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    select: {
      id: true,
      uid: true,
      displayId: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return user
}

export async function getUserByUid(uid: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findFirst({
    where: {
      uid,
      deletedAt: null
    },
    select: {
      id: true,
      uid: true,
      displayId: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return user
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: {
      username,
      deletedAt: null
    }
  })
  return count > 0
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: {
      email,
      deletedAt: null
    }
  })
  return count > 0
}

export async function createVerificationCode(email: string, username?: string): Promise<string> {
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000)

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      username,
      expiresAt
    }
  })

  await sendVerificationEmail(email, code)

  log.info('AuthService', '验证码创建成功', { email })

  return code
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!record) {
    log.warn('AuthService', '验证码无效或已过期', { email })
    return false
  }

  await prisma.verificationCode.delete({
    where: { id: record.id }
  })

  log.info('AuthService', '验证码验证成功', { email })

  return true
}

export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  const isValidCode = await verifyCode(data.email, data.code)

  if (!isValidCode) {
    throw new ValidationError('验证码无效或已过期')
  }

  const user = await createUser({
    username: data.username,
    email: data.email,
    password: data.password
  })

  const accessToken = generateToken({
    userId: user.id,
    uid: user.uid,
    username: user.username
  })

  log.info('AuthService', '用户注册成功', { userId: user.id, username: user.username })

  return {
    accessToken,
    user
  }
}

export async function resetPassword(data: ResetPasswordData): Promise<void> {
  const user = await findUserByUsername(data.username)

  if (!user) {
    throw new NotFoundError('用户不存在')
  }

  if (user.email !== data.email) {
    throw new ValidationError('用户名与邮箱不匹配')
  }

  const isValidCode = await verifyCode(data.email, data.code)

  if (!isValidCode) {
    throw new ValidationError('验证码无效或已过期')
  }

  await updateUserPassword(user.id, data.password)

  log.info('AuthService', '密码重置成功', { userId: user.id, username: user.username })
}

export default {
  validateUser,
  getUserById,
  getUserByUid,
  checkUsernameExists,
  checkEmailExists,
  createVerificationCode,
  verifyCode,
  registerUser,
  resetPassword
}
