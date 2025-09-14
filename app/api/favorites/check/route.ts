import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FavoriteType } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/favorites/check - Check if an item is favorited
export async function GET(request: NextRequest) {
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

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_itemId_itemType: {
          userId,
          itemId: parseInt(itemId),
          itemType: itemType as FavoriteType,
        },
      },
    });

    return NextResponse.json({ 
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null 
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}