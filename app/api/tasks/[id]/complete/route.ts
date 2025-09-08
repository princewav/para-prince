import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
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
    const { completed } = body

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: completed,
        status: completed ? 'COMPLETED' : 'TODO'
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
    console.error('Error toggling task completion:', error)
    return NextResponse.json(
      { error: 'Failed to update task completion status' },
      { status: 500 }
    )
  }
}