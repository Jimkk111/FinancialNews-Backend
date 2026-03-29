import jwt from 'jsonwebtoken'
import { jwtConfig, TokenPayload } from '../config/jwt'

export function generateToken(payload: { userId: number; uid: string; username: string }): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: '7d',
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }) as TokenPayload
    return decoded
  } catch {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null
  }

  return parts[1]
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null
    if (!decoded || !decoded.exp) {
      return null
    }
    return new Date(decoded.exp * 1000)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token)
  if (!expiration) {
    return true
  }
  return expiration < new Date()
}

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  getTokenExpiration,
  isTokenExpired
}
