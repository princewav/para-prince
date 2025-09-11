import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        area: {
          select: {
            id: true,
            name: true
          }
        },
        tasks: {
          orderBy: [
            { priority: 'asc' },
            { dueDate: 'asc' }
          ]
        },
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
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status, priority, dueDate, areaId } = body

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        areaId,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true
          }
        },
        tasks: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false }
            }
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}