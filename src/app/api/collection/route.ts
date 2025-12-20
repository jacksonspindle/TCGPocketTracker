import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's collection
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collection = await prisma.cardCollection.findMany({
      where: {
        userId: session.user.id,
        owned: true,
      },
      select: {
        cardId: true,
      },
    })

    const cardIds = collection.map(item => item.cardId)
    return NextResponse.json({ cards: cardIds })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}

// POST - Add card to collection
export async function POST(request: NextRequest) {
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
      update: { owned: true },
      create: {
        userId: session.user.id,
        cardId,
        owned: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding card:', error)
    return NextResponse.json({ error: 'Failed to add card' }, { status: 500 })
  }
}

// DELETE - Remove card from collection
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
      update: { owned: false },
      create: {
        userId: session.user.id,
        cardId,
        owned: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing card:', error)
    return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 })
  }
}
