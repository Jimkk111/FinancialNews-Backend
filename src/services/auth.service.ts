import prisma from '../config/database'
import { comparePassword } from '../utils/password'
import { generateToken } from '../utils/token'
import { UnauthorizedError } from '../types'
import { log } from '../utils/logger'

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

export async function validateUser(identifier: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier }
      ],
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

export default {
  validateUser,
  getUserById,
  getUserByUid,
  checkUsernameExists,
  checkEmailExists
}
