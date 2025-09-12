import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const areaId = parseInt(id)

    if (isNaN(areaId)) {
      return NextResponse.json(
        { error: 'Invalid area ID' },
        { status: 400 }
      )
    }

    const area = await prisma.area.findUnique({
      where: { id: areaId },
      include: {
        tasks: {
          orderBy: [
            { priority: 'asc' },
            { dueDate: 'asc' }
          ]
        },
        projects: {
          include: {
            _count: {
              select: {
                tasks: {
                  where: { completed: false }
                }
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        resources: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false }
            },
            projects: true
          }
        }
      }
    })

    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error fetching area:', error)
    return NextResponse.json(
      { error: 'Failed to fetch area' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const areaId = parseInt(id)

    if (isNaN(areaId)) {
      return NextResponse.json(
        { error: 'Invalid area ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, priority } = body

    const area = await prisma.area.update({
      where: { id: areaId },
      data: {
        name,
        description,
        priority,
      },
      include: {
        tasks: {
          orderBy: [
            { priority: 'asc' },
            { dueDate: 'asc' }
          ]
        },
        projects: {
          include: {
            _count: {
              select: {
                tasks: {
                  where: { completed: false }
                }
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        resources: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false }
            },
            projects: true
          }
        }
      }
    })

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error updating area:', error)
    return NextResponse.json(
      { error: 'Failed to update area' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const areaId = parseInt(id)

    if (isNaN(areaId)) {
      return NextResponse.json(
        { error: 'Invalid area ID' },
        { status: 400 }
      )
    }

    // Check if this is a force delete (hard delete)
    const { searchParams } = new URL(request.url)
    const forceDelete = searchParams.get('force') === 'true'

    const area = await prisma.area.findUnique({
      where: { id: areaId },
      include: { tasks: true, resources: true }
    })

    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      )
    }

    if (forceDelete) {
      // Hard delete - permanently remove without archiving
      await prisma.area.delete({
        where: { id: areaId }
      })
      return NextResponse.json({ message: 'Area deleted permanently' })
    } else {
      // Archive the area instead of deleting
      await prisma.archive.create({
        data: {
          name: area.name,
          description: area.description,
          type: 'AREA',
          originalId: area.id,
          archivedData: area
        }
      })

      await prisma.area.delete({
        where: { id: areaId }
      })

      return NextResponse.json({ message: 'Area archived successfully' })
    }
  } catch (error) {
    console.error('Error processing area deletion:', error)
    return NextResponse.json(
      { error: 'Failed to process area deletion' },
      { status: 500 }
    )
  }
}