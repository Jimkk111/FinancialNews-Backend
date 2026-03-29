import { v4 as uuidv4 } from 'uuid'

export const generateUid = (): string => {
  return `uid_${uuidv4().replace(/-/g, '').substring(0, 16)}`
}

export const generateDisplayId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateSessionId = (): string => {
  return `session_${uuidv4().replace(/-/g, '').substring(0, 16)}`
}

export const generateDraftId = (): string => {
  return `draft_${uuidv4().replace(/-/g, '').substring(0, 16)}`
}
