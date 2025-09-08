import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const areaId = searchParams.get('areaId')

    const where = {
      ...(projectId && { projectId: parseInt(projectId) }),
      ...(areaId && { areaId: parseInt(areaId) })
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true }
        },
        area: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      projectId, 
      areaId 
    } = body

    const task = await prisma.task.create({
      data: {
        name,
        description,
        status: status || 'TODO',
        priority,
        energy,
        context,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId ? parseInt(projectId) : null,
        areaId: areaId ? parseInt(areaId) : null,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}