import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ArchiveType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    const where = {
      ...(type && { type: type.toUpperCase() as ArchiveType })
    }

    const archives = await prisma.archive.findMany({
      where,
      orderBy: {
        archivedAt: 'desc'
      }
    })

    return NextResponse.json(archives)
  } catch (error) {
    console.error('Error fetching archives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty ids array' },
        { status: 400 }
      )
    }

    const deletedArchives = await prisma.archive.deleteMany({
      where: {
        id: {
          in: ids.map((id: string) => parseInt(id))
        }
      }
    })

    return NextResponse.json({ 
      message: `${deletedArchives.count} archive(s) permanently deleted` 
    })
  } catch (error) {
    console.error('Error deleting archives:', error)
    return NextResponse.json(
      { error: 'Failed to delete archives' },
      { status: 500 }
    )
  }
}