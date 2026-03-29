import { v4 as uuidv4 } from 'uuid'

export function generateUid(): string {
  const id = uuidv4().split('-')[0]
  return `user-${id}`
}

export function generateDisplayId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `U${timestamp}${random}`
}

export function generateDraftId(): string {
  const id = uuidv4().split('-')[0]
  return `draft-${id}`
}

export function generateSessionId(): string {
  const id = uuidv4().split('-')[0]
  return `session-${id}`
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default {
  generateUid,
  generateDisplayId,
  generateDraftId,
  generateSessionId,
  generateVerificationCode
}
