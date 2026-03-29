import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database'
import { config } from '../config'
import { AppError } from '../middlewares/error.middleware'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
})

const CODE_EXPIRY_MINUTES = 10

export const sendVerificationEmail = async (email: string, username?: string) => {
  const code = Math.random().toString().slice(-6)
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      username,
      expiresAt
    }
  })

  const mailOptions = {
    from: config.smtp.user,
    to: email,
    subject: '财经新闻 - 验证码',
    html: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>验证码</h2>
        <p>您的验证码是：<strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
        <p>验证码将在 ${CODE_EXPIRY_MINUTES} 分钟后过期。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    throw new AppError('邮件发送失败', 'EMAIL_SEND_ERROR', 500)
  }
}

export const verifyCode = async (email: string, code: string): Promise<boolean> => {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!record) {
    return false
  }

  await prisma.verificationCode.delete({
    where: { id: record.id }
  })

  return true
}
