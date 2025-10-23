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
        OR: [
          {
            AND: [
              { start: { lt: endOfDay } },
              { end: { gt: startOfDay } }
            ]
          }
        ]
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

    // Check for conflicts - including hierarchical checks
    const bookables = await prisma.bookable.findMany({
        where: {
          id: {
            in: bookableIds,
          },
        },
        include: {
          parent: true,
          children: true,
        },
      })
  
      // Collect all IDs that would conflict (including hierarchy)
      const conflictCheckIds = new Set<number>()
      
      for (const bookable of bookables) {
        conflictCheckIds.add(bookable.id)
        
        // If booking a FLOOR, check all its children (areas and desks)
        if (bookable.type === 'FLOOR') {
          const allChildren = await prisma.bookable.findMany({
            where: {
              OR: [
                { parentId: bookable.id }, // Direct children (areas)
                { 
                  parent: { 
                    parentId: bookable.id  // Grandchildren (desks in areas)
                  } 
                }
              ]
            }
          })
          allChildren.forEach(child => conflictCheckIds.add(child.id))
        }
        
        // If booking an AREA, check its parent (floor) and children (desks)
        if (bookable.type === 'AREA') {
          if (bookable.parentId) {
            conflictCheckIds.add(bookable.parentId) // Add floor
          }
          const desks = await prisma.bookable.findMany({
            where: { parentId: bookable.id }
          })
          desks.forEach(desk => conflictCheckIds.add(desk.id))
        }
        
        // If booking a DESK, check its parent (area) and grandparent (floor)
        if (bookable.type === 'PLACE' && bookable.parent) {
          conflictCheckIds.add(bookable.parent.id) // Add area
          if (bookable.parent.parentId) {
            conflictCheckIds.add(bookable.parent.parentId) // Add floor
          }
        }
      }
  
      const conflicts = await prisma.booking.findMany({
        where: {
          bookableId: {
            in: Array.from(conflictCheckIds),
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
              type: c.bookable.type,
              start: c.start,
              end: c.end,
            })),
          },
          { status: 409 }
        )
      }

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