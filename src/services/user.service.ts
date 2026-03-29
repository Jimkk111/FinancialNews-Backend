import prisma from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { hashPassword, comparePassword } from '../utils/password'
import { UpdateProfileInput, ChangePasswordInput } from '../validators/user.validator'

export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      uid: true,
      displayId: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true
    }
  })

  if (!user) {
    throw new AppError('用户不存在', 'USER_NOT_FOUND', 404)
  }

  return user
}

export const updateProfile = async (userId: number, data: UpdateProfileInput) => {
  if (data.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: userId }
      }
    })

    if (existingUser) {
      throw new AppError('用户名已被使用', 'USERNAME_EXISTS', 422)
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      uid: true,
      displayId: true,
      username: true,
      email: true,
      avatar: true
    }
  })

  return user
}

export const changePassword = async (userId: number, data: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new AppError('用户不存在', 'USER_NOT_FOUND', 404)
  }

  const isValidPassword = await comparePassword(data.oldPassword, user.passwordHash)
  if (!isValidPassword) {
    throw new AppError('旧密码错误', 'INVALID_PASSWORD', 422)
  }

  const passwordHash = await hashPassword(data.newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  })
}

export const getUserStats = async (userId: number) => {
  const [favoritesCount, historyCount, draftsCount] = await Promise.all([
    prisma.favorite.count({ where: { userId } }),
    prisma.history.count({ where: { userId } }),
    prisma.draft.count({ where: { userId } })
  ])

  return {
    favoritesCount,
    historyCount,
    draftsCount
  }
}
