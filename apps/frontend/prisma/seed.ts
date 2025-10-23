import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inno3.de' },
    update: {},
    create: {
      email: 'admin@inno3.de',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const interne = await prisma.user.upsert({
    where: { email: 'user@higl.de' },
    update: {},
    create: {
      email: 'user@higl.de',
      name: 'Internal User',
      role: 'INTERNE',
    },
  })

  const innotrack = await prisma.user.upsert({
    where: { email: 'track@innotrack.de' },
    update: {},
    create: {
      email: 'track@innotrack.de',
      name: 'Innotrack User',
      role: 'INNOTRACK',
    },
  })

  // Create floor
  const floor = await prisma.bookable.create({
    data: {
      name: 'Stockwerk 1',
      type: 'FLOOR',
    },
  })

  // Create zones (areas)
  const zones = await Promise.all([
    prisma.bookable.create({
      data: {
        name: 'Balkon',
        type: 'AREA',
        parentId: floor.id,
      },
    }),
    prisma.bookable.create({
      data: {
        name: 'Mitte',
        type: 'AREA',
        parentId: floor.id,
      },
    }),
    prisma.bookable.create({
      data: {
        name: 'Fenster',
        type: 'AREA',
        parentId: floor.id,
      },
    }),
  ])

  // Create desks in each zone
  for (const zone of zones) {
    const zoneName = zone.name.toLowerCase()
    const deskCount = zoneName === 'balkon' ? 8 : zoneName === 'mitte' ? 6 : 10
    
    for (let i = 1; i <= deskCount; i++) {
      await prisma.bookable.create({
        data: {
          name: `${zone.name} - Platz ${i}`,
          type: 'PLACE',
          parentId: zone.id,
        },
      })
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })