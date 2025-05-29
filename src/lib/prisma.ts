import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e: any) => {
    console.log('Query:', e.query)
    console.log('Duration:', e.duration + 'ms')
  })
}

export const db = prisma
export default prisma 