import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First delete all investments as they depend on users
  await prisma.investment.deleteMany()
  
  // Then delete all users
  const deletedUsers = await prisma.user.deleteMany()

  console.log(`\nDeleted ${deletedUsers.count} users and their associated data.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 