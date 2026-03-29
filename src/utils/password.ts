import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }
  
  if (password.length > 128) {
    errors.push('密码长度不能超过128位')
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('密码必须包含字母')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength
}
