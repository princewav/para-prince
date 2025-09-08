import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, status, priority, dueDate } = body

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
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
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Archive the project instead of deleting
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true, resources: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create archive entry
    await prisma.archive.create({
      data: {
        name: project.name,
        description: project.description,
        type: 'PROJECT',
        originalId: project.id,
        archivedData: project
      }
    })

    // Delete the project (cascading will handle tasks)
    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ message: 'Project archived successfully' })
  } catch (error) {
    console.error('Error archiving project:', error)
    return NextResponse.json(
      { error: 'Failed to archive project' },
      { status: 500 }
    )
  }
}