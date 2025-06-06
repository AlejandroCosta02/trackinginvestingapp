import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      investments: true
    }
  })

  console.log('\nUsers in database:')
  console.log('=================\n')
  
  users.forEach(user => {
    console.log(`ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Investments: ${user.investments.length}`)
    console.log('-------------------\n')
  })

  console.log(`Total users: ${users.length}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 