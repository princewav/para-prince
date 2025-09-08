import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const taskId = parseInt(id)

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true }
        },
        area: {
          select: { id: true, name: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const taskId = parseInt(id)

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      status, 
      priority, 
      energy, 
      context, 
      notes, 
      dueDate, 
      completed,
      projectId, 
      areaId 
    } = body

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(energy !== undefined && { energy }),
        ...(context !== undefined && { context }),
        ...(notes !== undefined && { notes }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completed !== undefined && { completed }),
        ...(projectId !== undefined && { projectId: projectId ? parseInt(projectId) : null }),
        ...(areaId !== undefined && { areaId: areaId ? parseInt(areaId) : null }),
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        area: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const taskId = parseInt(id)

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Archive the task instead of deleting
    await prisma.archive.create({
      data: {
        name: task.name,
        description: task.description,
        type: 'TASK',
        originalId: task.id,
        archivedData: task
      }
    })

    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ message: 'Task archived successfully' })
  } catch (error) {
    console.error('Error archiving task:', error)
    return NextResponse.json(
      { error: 'Failed to archive task' },
      { status: 500 }
    )
  }
}