import prisma from '../config/database'
import { hashPassword } from '../utils/password'
import { generateUid, generateDisplayId } from '../utils/idGenerator'
import { DuplicateError, NotFoundError } from '../types'
import { log } from '../utils/logger'

interface CreateUserData {
  username: string
  email: string
  password: string
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

export async function createUser(data: CreateUserData): Promise<UserWithoutPassword> {
  const existingUsername = await prisma.user.findFirst({
    where: {
      username: data.username,
      deletedAt: null
    }
  })

  if (existingUsername) {
    log.warn('UserService', '用户名已存在', { username: data.username })
    throw new DuplicateError('用户名已被使用')
  }

  const existingEmail = await prisma.user.findFirst({
    where: {
      email: data.email,
      deletedAt: null
    }
  })

  if (existingEmail) {
    log.warn('UserService', '邮箱已存在', { email: data.email })
    throw new DuplicateError('邮箱已被使用')
  }

  const passwordHash = await hashPassword(data.password)
  const uid = generateUid()
  const displayId = generateDisplayId()

  const user = await prisma.user.create({
    data: {
      uid,
      displayId,
      username: data.username,
      email: data.email,
      passwordHash
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

  log.info('UserService', '用户创建成功', { userId: user.id, username: user.username })

  return user
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    }
  })

  if (!user) {
    throw new NotFoundError('用户不存在')
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  })

  log.info('UserService', '密码更新成功', { userId })
}

export async function findUserByUsernameOrEmail(identifier: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
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

export async function findUserByUsername(username: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findFirst({
    where: {
      username,
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

export async function findUserByEmail(email: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findFirst({
    where: {
      email,
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

export default {
  createUser,
  updateUserPassword,
  findUserByUsernameOrEmail,
  findUserByUsername,
  findUserByEmail
}
