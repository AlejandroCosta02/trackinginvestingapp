import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn', 'info'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Log all database queries in development
if (process.env.NODE_ENV !== 'production') {
  db.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

// Handle connection errors
db.$use(async (params, next) => {
  try {
    const result = await next(params)
    return result
  } catch (error) {
    console.error('Database error:', {
      error: error,
      params: params,
      modelName: params.model,
      operation: params.action
    })
    throw error
  }
})

export default db 