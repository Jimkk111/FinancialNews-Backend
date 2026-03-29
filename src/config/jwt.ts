export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-secret-key-please-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: 'cls-financial-news',
  audience: 'cls-financial-news-users'
}

export interface TokenPayload {
  userId: number
  uid: string
  username: string
  iat: number
  exp: number
}

export default jwtConfig
