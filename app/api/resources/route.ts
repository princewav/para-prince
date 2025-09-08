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

    const resources = await prisma.resource.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true }
        },
        area: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, url, projectId, areaId } = body

    const resource = await prisma.resource.create({
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

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}