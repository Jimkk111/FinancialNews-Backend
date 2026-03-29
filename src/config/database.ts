import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
export { prisma }
