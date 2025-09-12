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
        area: true,
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
    const { name, description, status, priority, dueDate, areaId } = body

    // Only include fields that are being updated
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (areaId !== undefined) updateData.areaId = areaId || null

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        area: true,
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

    // Check if this is a force delete (hard delete)
    const { searchParams } = new URL(request.url)
    const forceDelete = searchParams.get('force') === 'true'

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

    if (forceDelete) {
      // Hard delete - permanently remove without archiving
      await prisma.project.delete({
        where: { id: projectId }
      })
      return NextResponse.json({ message: 'Project deleted permanently' })
    } else {
      // Archive the project instead of deleting
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
    }
  } catch (error) {
    console.error('Error processing project deletion:', error)
    return NextResponse.json(
      { error: 'Failed to process project deletion' },
      { status: 500 }
    )
  }
}