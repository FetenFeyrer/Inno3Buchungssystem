import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const bookableId = searchParams.get('bookableId')

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const where: any = {
      start: {
        gte: startOfDay,
      },
      end: {
        lte: endOfDay,
      },
    }

    if (bookableId) {
      where.bookableId = parseInt(bookableId)
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        bookable: {
          select: {
            id: true,
            name: true,
            type: true,
            parentId: true,
          },
        },
      },
      orderBy: {
        start: 'asc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, bookableIds, start, end, date } = body

    // Validate required fields
    if (!userId || !bookableIds || !Array.isArray(bookableIds) || bookableIds.length === 0 || !start || !end || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, bookableIds, start, end, date' },
        { status: 400 }
      )
    }

    // Create DateTime objects
    const bookingDate = new Date(date)
    const [startHour, startMinute] = start.split(':').map(Number)
    const [endHour, endMinute] = end.split(':').map(Number)

    const startDateTime = new Date(bookingDate)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(bookingDate)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        bookableId: {
          in: bookableIds,
        },
        OR: [
          {
            AND: [
              { start: { lte: startDateTime } },
              { end: { gt: startDateTime } },
            ],
          },
          {
            AND: [
              { start: { lt: endDateTime } },
              { end: { gte: endDateTime } },
            ],
          },
          {
            AND: [
              { start: { gte: startDateTime } },
              { end: { lte: endDateTime } },
            ],
          },
        ],
      },
      include: {
        bookable: true,
      },
    })

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Booking conflict detected',
          conflicts: conflicts.map(c => ({
            bookable: c.bookable.name,
            start: c.start,
            end: c.end,
          })),
        },
        { status: 409 }
      )
    }

    // Create bookings
    const bookings = await Promise.all(
      bookableIds.map(bookableId =>
        prisma.booking.create({
          data: {
            userId,
            bookableId,
            start: startDateTime,
            end: endDateTime,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            bookable: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        })
      )
    )

    return NextResponse.json({ success: true, bookings }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}