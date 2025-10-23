import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookables = await prisma.bookable.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(bookables)
  } catch (error) {
    console.error('Error fetching bookables:', error)
    return NextResponse.json({ error: 'Failed to fetch bookables' }, { status: 500 })
  }
}