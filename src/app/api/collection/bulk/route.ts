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
    const { cardIds, cards } = await request.json()

    // Support both formats:
    // 1. cardIds: string[] - sets count to 1 for each
    // 2. cards: Record<string, number> - sets specific counts

    if (cards && typeof cards === 'object') {
      // New format with counts
      const entries = Object.entries(cards) as [string, number][]

      for (const [cardId, count] of entries) {
        await prisma.cardCollection.upsert({
          where: {
            userId_cardId: {
              userId: session.user.id!,
              cardId,
            },
          },
          update: { count },
          create: {
            userId: session.user.id!,
            cardId,
            count,
          },
        })
      }

      return NextResponse.json({ success: true, count: entries.length })
    }

    if (Array.isArray(cardIds)) {
      // Legacy format - set count to 1 for each card
      await prisma.cardCollection.createMany({
        data: cardIds.map(cardId => ({
          userId: session.user.id!,
          cardId,
          count: 1,
        })),
        skipDuplicates: true,
      })

      // Update any existing records that were set to count: 0
      await prisma.cardCollection.updateMany({
        where: {
          userId: session.user.id,
          cardId: { in: cardIds },
          count: 0,
        },
        data: { count: 1 },
      })

      return NextResponse.json({ success: true, count: cardIds.length })
    }

    return NextResponse.json({ error: 'Card IDs array or cards object required' }, { status: 400 })
  } catch (error) {
    console.error('Error bulk importing cards:', error)
    return NextResponse.json({ error: 'Failed to import cards' }, { status: 500 })
  }
}
