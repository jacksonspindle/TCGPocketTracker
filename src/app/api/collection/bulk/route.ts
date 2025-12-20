import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Bulk import cards to collection
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cardIds } = await request.json()

    if (!Array.isArray(cardIds)) {
      return NextResponse.json({ error: 'Card IDs array required' }, { status: 400 })
    }

    // Use createMany with skipDuplicates for efficiency
    await prisma.cardCollection.createMany({
      data: cardIds.map(cardId => ({
        userId: session.user.id!,
        cardId,
        owned: true,
      })),
      skipDuplicates: true,
    })

    // Update any existing records that were set to owned: false
    await prisma.cardCollection.updateMany({
      where: {
        userId: session.user.id,
        cardId: { in: cardIds },
        owned: false,
      },
      data: { owned: true },
    })

    return NextResponse.json({ success: true, count: cardIds.length })
  } catch (error) {
    console.error('Error bulk importing cards:', error)
    return NextResponse.json({ error: 'Failed to import cards' }, { status: 500 })
  }
}
