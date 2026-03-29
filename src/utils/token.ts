import jwt from 'jsonwebtoken'
import { config } from '../config'
import { JwtPayload } from '../types'

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload
  } catch {
    return null
  }
}
