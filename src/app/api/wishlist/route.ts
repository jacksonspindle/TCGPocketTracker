import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's wishlist
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { cardId: true },
    })

    return NextResponse.json({ cards: wishlist.map(w => w.cardId) })
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

// POST - Add card to wishlist
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = await request.json()

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    await prisma.wishlist.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        cardId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

// DELETE - Remove card from wishlist
export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = await request.json()

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        cardId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
