import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const resourceId = parseInt(id)

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        project: {
          select: { id: true, name: true }
        },
        area: {
          select: { id: true, name: true }
        }
      }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const resourceId = parseInt(id)

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, type, url, projectId, areaId } = body

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        name,
        description,
        type,
        url,
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

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const resourceId = parseInt(id)

    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    await prisma.archive.create({
      data: {
        name: resource.name,
        description: resource.description,
        type: 'RESOURCE',
        originalId: resource.id,
        archivedData: resource
      }
    })

    await prisma.resource.delete({
      where: { id: resourceId }
    })

    return NextResponse.json({ message: 'Resource archived successfully' })
  } catch (error) {
    console.error('Error archiving resource:', error)
    return NextResponse.json(
      { error: 'Failed to archive resource' },
      { status: 500 }
    )
  }
}