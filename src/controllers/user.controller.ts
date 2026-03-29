import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { success, error } from '../utils/response'
import { log } from '../utils/logger'
import { saveFile, cleanOldFile } from '../services/file.service'

export interface UserInfo {
  uid: string
  displayId: string
  username: string
  email: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

function toUserInfo(user: {
  uid: string
  displayId: string
  username: string
  email: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}): UserInfo {
  return {
    uid: user.uid,
    displayId: user.displayId,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      error(res, 'UNAUTHORIZED', '未授权访问', 401)
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        uid: true,
        displayId: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      error(res, 'USER_NOT_FOUND', '用户不存在', 404)
      return
    }

    log.info('UserController', '获取用户信息成功', { uid: user.uid })

    success(res, toUserInfo(user))
  } catch (err) {
    log.error('UserController', '获取用户信息失败', undefined, err instanceof Error ? err : undefined)
    next(err)
  }
}

export async function updateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId
    const { username, email } = req.body

    if (!userId) {
      error(res, 'UNAUTHORIZED', '未授权访问', 401)
      return
    }

    const updateData: { username?: string; email?: string } = {}
    
    if (username !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })
      
      if (existingUser) {
        error(res, 'USERNAME_EXISTS', '用户名已被使用', 422)
        return
      }
      updateData.username = username
    }

    if (email !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      })
      
      if (existingUser) {
        error(res, 'EMAIL_EXISTS', '邮箱已被使用', 422)
        return
      }
      updateData.email = email
    }

    if (Object.keys(updateData).length === 0) {
      error(res, 'NO_UPDATE_DATA', '没有要更新的数据', 422)
      return
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        uid: true,
        displayId: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    log.info('UserController', '更新用户信息成功', { uid: user.uid, fields: Object.keys(updateData) })

    success(res, toUserInfo(user))
  } catch (err) {
    log.error('UserController', '更新用户信息失败', undefined, err instanceof Error ? err : undefined)
    next(err)
  }
}

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId
    const file = req.file

    if (!userId) {
      error(res, 'UNAUTHORIZED', '未授权访问', 401)
      return
    }

    if (!file) {
      error(res, 'NO_FILE', '请选择要上传的头像', 422)
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { uid: true, avatar: true }
    })

    if (!user) {
      error(res, 'USER_NOT_FOUND', '用户不存在', 404)
      return
    }

    const result = await saveFile(file, 'avatars')

    const oldAvatar = user.avatar
    const newAvatarUrl = result.url

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: newAvatarUrl }
    })

    if (oldAvatar) {
      cleanOldFile(oldAvatar, newAvatarUrl)
    }

    log.info('UserController', '头像上传成功', { uid: user.uid, avatar: newAvatarUrl })

    success(res, { avatar: newAvatarUrl })
  } catch (err) {
    log.error('UserController', '头像上传失败', undefined, err instanceof Error ? err : undefined)
    next(err)
  }
}

export default {
  getCurrentUser,
  updateCurrentUser,
  uploadAvatar
}
