import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FavoriteType } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/favorites - Get all favorites for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user'; // For now, using default user
    
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group favorites by type and get additional data
    const groupedFavorites: Record<FavoriteType, any[]> = {
      AREA: [],
      PROJECT: [],
      TASK: [],
    };

    for (const favorite of favorites) {
      try {
        let item = null;
        
        switch (favorite.itemType) {
          case 'AREA':
            item = await prisma.area.findUnique({
              where: { id: favorite.itemId },
            });
            break;
          case 'PROJECT':
            item = await prisma.project.findUnique({
              where: { id: favorite.itemId },
              include: { area: true },
            });
            break;
          case 'TASK':
            item = await prisma.task.findUnique({
              where: { id: favorite.itemId },
              include: { project: true, area: true },
            });
            break;
        }
        
        if (item) {
          groupedFavorites[favorite.itemType].push({
            favoriteId: favorite.id,
            itemId: favorite.itemId,
            type: favorite.itemType,
            item,
            createdAt: favorite.createdAt,
          });
        }
      } catch (error) {
        // Skip if item no longer exists
        console.warn(`Favorite item not found: ${favorite.itemType} ${favorite.itemId}`);
      }
    }

    return NextResponse.json(groupedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a new favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, itemType, userId = 'default-user' } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId and itemType are required' },
        { status: 400 }
      );
    }

    // Verify the item exists before creating the favorite
    let itemExists = false;
    try {
      switch (itemType) {
        case 'AREA':
          const area = await prisma.area.findUnique({ where: { id: itemId } });
          itemExists = !!area;
          break;
        case 'PROJECT':
          const project = await prisma.project.findUnique({ where: { id: itemId } });
          itemExists = !!project;
          break;
        case 'TASK':
          const task = await prisma.task.findUnique({ where: { id: itemId } });
          itemExists = !!task;
          break;
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid item type or item not found' },
        { status: 400 }
      );
    }

    if (!itemExists) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        itemId: parseInt(itemId),
        itemType: itemType as FavoriteType,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error creating favorite:', error);
    
    // Handle unique constraint violation (already favorited)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Item already favorited' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const userId = searchParams.get('userId') || 'default-user';

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'itemId and itemType are required' },
        { status: 400 }
      );
    }

    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId,
        itemId: parseInt(itemId),
        itemType: itemType as FavoriteType,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}