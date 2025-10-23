import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json(user)
    }

    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}