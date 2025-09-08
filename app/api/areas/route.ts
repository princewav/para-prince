import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      include: {
        tasks: {
          orderBy: [
            { priority: 'asc' },
            { dueDate: 'asc' }
          ]
        },
        resources: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false }
            }
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(areas)
  } catch (error) {
    console.error('Error fetching areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, priority } = body

    const area = await prisma.area.create({
      data: {
        name,
        description,
        priority: priority || 'P2',
      },
      include: {
        tasks: true,
        resources: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false }
            }
          }
        }
      }
    })

    return NextResponse.json(area, { status: 201 })
  } catch (error) {
    console.error('Error creating area:', error)
    return NextResponse.json(
      { error: 'Failed to create area' },
      { status: 500 }
    )
  }
}