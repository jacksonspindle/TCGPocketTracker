import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's collection with counts
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collection = await prisma.cardCollection.findMany({
      where: {
        userId: session.user.id,
        count: { gt: 0 },
      },
      select: {
        cardId: true,
        count: true,
      },
    })

    // Return as a map of cardId -> count
    const cards: Record<string, number> = {}
    for (const item of collection) {
      cards[item.cardId] = item.count
    }
    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}

// POST - Add card to collection (or increment count)
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cardId, count } = await request.json()

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 })
    }

    // If count is provided, set to that value; otherwise set to 1
    const newCount = typeof count === 'number' ? count : 1

    await prisma.cardCollection.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
      update: { count: newCount },
      create: {
        userId: session.user.id,
        cardId,
        count: newCount,
      },
    })

    return NextResponse.json({ success: true, count: newCount })
  } catch (error) {
    console.error('Error adding card:', error)
    return NextResponse.json({ error: 'Failed to add card' }, { status: 500 })
  }
}

// PATCH - Update card count
export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cardId, count } = await request.json()

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 })
    }

    if (typeof count !== 'number' || count < 0) {
      return NextResponse.json({ error: 'Valid count required' }, { status: 400 })
    }

    await prisma.cardCollection.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
      update: { count },
      create: {
        userId: session.user.id,
        cardId,
        count,
      },
    })

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Error updating card count:', error)
    return NextResponse.json({ error: 'Failed to update card count' }, { status: 500 })
  }
}

// DELETE - Remove card from collection (set count to 0)
export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cardId } = await request.json()

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 })
    }

    await prisma.cardCollection.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
      update: { count: 0 },
      create: {
        userId: session.user.id,
        cardId,
        count: 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing card:', error)
    return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 })
  }
}
