import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const archiveId = parseInt(id)

    if (isNaN(archiveId)) {
      return NextResponse.json(
        { error: 'Invalid archive ID' },
        { status: 400 }
      )
    }

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId }
    })

    if (!archive) {
      return NextResponse.json(
        { error: 'Archive not found' },
        { status: 404 }
      )
    }

    let restored = null

    switch (archive.type) {
      case 'PROJECT':
        const projectData = archive.archivedData as any
        restored = await prisma.project.create({
          data: {
            name: archive.name,
            description: archive.description,
            status: projectData.status || 'IN_PROGRESS',
            priority: projectData.priority,
            dueDate: projectData.dueDate ? new Date(projectData.dueDate) : null,
          }
        })
        break

      case 'AREA':
        const areaData = archive.archivedData as any
        restored = await prisma.area.create({
          data: {
            name: archive.name,
            description: archive.description,
            priority: areaData.priority || 'P2',
          }
        })
        break

      case 'RESOURCE':
        const resourceData = archive.archivedData as any
        restored = await prisma.resource.create({
          data: {
            name: archive.name,
            description: archive.description,
            type: resourceData.type,
            url: resourceData.url,
          }
        })
        break

      case 'TASK':
        const taskData = archive.archivedData as any
        restored = await prisma.task.create({
          data: {
            name: archive.name,
            description: archive.description,
            status: taskData.status || 'TODO',
            priority: taskData.priority,
            energy: taskData.energy,
            context: taskData.context,
            notes: taskData.notes,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            completed: taskData.completed || false,
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown archive type' },
          { status: 400 }
        )
    }

    // Delete the archive entry
    await prisma.archive.delete({
      where: { id: archiveId }
    })

    return NextResponse.json({
      message: `${archive.type.toLowerCase()} restored successfully`,
      restored
    })
  } catch (error) {
    console.error('Error restoring archive:', error)
    return NextResponse.json(
      { error: 'Failed to restore archive' },
      { status: 500 }
    )
  }
}