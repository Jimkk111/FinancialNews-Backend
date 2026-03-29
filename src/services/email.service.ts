import nodemailer from 'nodemailer'
import { log } from '../utils/logger'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@example.com'
  }
}

function createTransporter() {
  const config = getSmtpConfig()

  if (!config.user || !config.pass) {
    log.warn('EmailService', 'SMTP配置不完整，邮件功能可能无法正常工作')
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass
          }
        : undefined
  })
}

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  const config = getSmtpConfig()
  const transporter = createTransporter()

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>验证码通知</h2>
        <p>您好，您的验证码是：</p>
        <p class="code">${code}</p>
        <p>验证码有效期为5分钟，请尽快使用。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿回复。</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: '验证码通知',
      html
    })
    log.info('EmailService', '验证码邮件发送成功', { email })
  } catch (error) {
    log.error('EmailService', '验证码邮件发送失败', { email, error })
    throw error
  }
}

export default {
  sendVerificationCode
}
