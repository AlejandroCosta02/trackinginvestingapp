import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  }).$extends({
    query: {
      $allOperations({ query, args }) {
        const startTime = Date.now()
        return query(args)
          .then((result) => {
            const duration = Date.now() - startTime
            if (process.env.NODE_ENV !== 'production') {
              console.log(`Query took ${duration}ms`)
            }
            return result
          })
          .catch((error) => {
            console.error('Database operation failed:', {
              error: error instanceof Error ? error.message : 'Unknown error',
              args,
              duration: Date.now() - startTime
            })
            throw error
          })
      }
    }
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Log all database queries in development
if (process.env.NODE_ENV !== 'production') {
  db.$on('query' as never, (e: any) => {
    console.log('Query:', e.query)
    console.log('Duration:', e.duration + 'ms')
  })
}

// Enhanced error handling middleware with retries
db.$use(async (params, next) => {
  const maxRetries = 3
  let retries = 0
  
  while (retries < maxRetries) {
    const startTime = Date.now()
    try {
      const result = await next(params)
      const endTime = Date.now()
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`${params.model}.${params.action} took ${endTime - startTime}ms`)
      }
      
      return result
    } catch (error) {
      retries++
      console.error(`Database operation failed (attempt ${retries}/${maxRetries}):`, {
        model: params.model,
        action: params.action,
        args: params.args,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
        } : error,
        duration: Date.now() - startTime
      })
      
      if (retries === maxRetries) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002':
              throw new Error('A unique constraint violation occurred.')
            case 'P2025':
              throw new Error('Record not found.')
            default:
              throw error
          }
        }
        if (error instanceof Prisma.PrismaClientInitializationError) {
          console.error('Connection details:', {
            url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
            nodeEnv: process.env.NODE_ENV
          })
          throw new Error('Could not connect to the database. Please try again later.')
        }
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
    }
  }
})

// Handle connection events
process.on('beforeExit', async () => {
  await db.$disconnect()
})

export default db 