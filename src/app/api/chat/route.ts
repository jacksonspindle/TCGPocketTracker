import { NextRequest, NextResponse } from 'next/server'
import { ChatContextData, ClaudeMessage, ClaudeAPIResponse } from '@/types/chat'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

function buildSystemPrompt(contextData: ChatContextData): string {
  const { collectionSummary, boosterSummaries } = contextData

  // Format rarity stats (with wishlist)
  const rarityStats = Object.entries(collectionSummary.byRarity)
    .map(([rarity, stats]) => `${rarity}: ${stats.owned}/${stats.total} (${stats.wishlisted || 0} wishlisted)`)
    .join(', ')

  // Format type stats (with wishlist)
  const typeStats = Object.entries(collectionSummary.byType)
    .map(([type, stats]) => `${type}: ${stats.owned}/${stats.total} (${stats.wishlisted || 0} wishlisted)`)
    .join(', ')

  // Format category stats (with wishlist)
  const categoryStats = Object.entries(collectionSummary.byCategory)
    .map(([category, stats]) => `${category}: ${stats.owned}/${stats.total} (${stats.wishlisted || 0} wishlisted)`)
    .join(', ')

  // Format cross-dimensional: rarity + category
  const rarityByCategoryLines = Object.entries(collectionSummary.byRarityAndCategory)
    .map(([rarity, categories]) => {
      const catStats = Object.entries(categories)
        .map(([cat, stats]) => `${cat}: ${stats.owned}/${stats.total}`)
        .join(', ')
      return `${rarity}: { ${catStats} }`
    })
    .join('\n')

  // Format cross-dimensional: rarity + type
  const rarityByTypeLines = Object.entries(collectionSummary.byRarityAndType)
    .map(([rarity, types]) => {
      const tStats = Object.entries(types)
        .map(([type, stats]) => `${type}: ${stats.owned}/${stats.total}`)
        .join(', ')
      return `${rarity}: { ${tStats} }`
    })
    .join('\n')

  // Format booster summaries
  const boosterLines = boosterSummaries.map(b => {
    const missingRarities = Object.entries(b.missingByRarity)
      .filter(([, count]) => count > 0)
      .map(([rarity, count]) => `${count} ${rarity}`)
      .join(', ')
    return `- ${b.name} (${b.setName}): ${b.ownedCards}/${b.totalCards} (${b.completionPercentage}%)${missingRarities ? ` | Missing: ${missingRarities}` : ''}`
  }).join('\n')

  return `You are a helpful assistant for a Pokemon TCG Pocket card collection tracker app. You help users understand their collection, suggest which boosters to open, and answer questions about their cards.

CURRENT COLLECTION STATE:
- Total Cards: ${collectionSummary.totalCards}
- Owned: ${collectionSummary.ownedCards} (${collectionSummary.completionPercentage}% complete)
- Wishlisted: ${collectionSummary.wishlistedCards} cards

BY RARITY (owned/total, wishlisted):
${rarityStats}

BY TYPE (owned/total, wishlisted):
${typeStats}

BY CATEGORY (owned/total, wishlisted):
${categoryStats}

CARDS BY RARITY AND CATEGORY (for questions like "how many Two Star Trainers"):
${rarityByCategoryLines}

CARDS BY RARITY AND TYPE (for questions like "how many Crown Rare Fire Pokemon"):
${rarityByTypeLines}

BOOSTER PACK DETAILS:
${boosterLines}

GUIDELINES:
- Be concise and helpful
- Use the cross-dimensional data above to answer specific questions like "how many X rarity Y category/type cards"
- When recommending which booster to open, consider:
  1. Completion percentage (prioritize boosters closer to completion for collectors)
  2. Missing rare cards (prioritize boosters with valuable missing cards)
  3. User's stated preferences if any
- Use the actual data provided - do not make up card names or statistics
- Rarity tiers from common to rare: One Diamond < Two Diamond < Three Diamond < Four Diamond < One Star < Two Star < Three Star < Crown Rare
- Categories are: Pokemon, Trainer (includes Supporter items)
- If asked about specific card names not in the data, explain you have aggregate statistics only
- Format responses clearly with bullet points when listing multiple items
- Keep responses focused and actionable

SMART SEARCH FEATURE:
When the user asks to "show", "find", "filter", or "search" for cards, you can provide a filter action button.
Include a JSON block at the END of your response in this exact format:

\`\`\`filter
{"label": "View Fire Types", "filters": {"type": "Fire", "collectionFilter": "owned"}}
\`\`\`

Available filter options:
- search: string (card name search)
- rarity: "One Diamond" | "Two Diamond" | "Three Diamond" | "Four Diamond" | "One Star" | "Two Star" | "Three Star" | "Crown" | "One Shiny" | "Two Shiny"
- type: "Grass" | "Fire" | "Water" | "Lightning" | "Psychic" | "Fighting" | "Darkness" | "Metal" | "Dragon" | "Colorless"
- stage: "Basic" | "Stage 1" | "Stage 2"
- collectionFilter: "all" | "owned" | "missing" | "wishlist"

IMPORTANT: Use exact rarity values. "Crown" (not "Crown Rare") for the rarest cards.

Examples:
- "Show my water types" → filters: {"type": "Water", "collectionFilter": "owned"}
- "What Crown cards am I missing?" → filters: {"rarity": "Crown", "collectionFilter": "missing"}
- "Find Pikachu cards" → filters: {"search": "Pikachu"}
- "Show missing Fire Pokemon" → filters: {"type": "Fire", "collectionFilter": "missing"}
- "Show my shiny cards" → filters: {"rarity": "One Shiny", "collectionFilter": "owned"}

Only include the filter block when the user explicitly wants to see/find/filter cards. For general questions about stats, just answer normally.`
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages, contextData } = body as {
      messages: ClaudeMessage[]
      contextData: ChatContextData
    }

    const systemPrompt = buildSystemPrompt(contextData)

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `API request failed with status ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      console.error('Claude API error:', response.status, errorText)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data: ClaudeAPIResponse = await response.json()

    if (!data.content || data.content.length === 0) {
      return NextResponse.json({ error: 'Empty response from API' }, { status: 500 })
    }

    let text = data.content[0].text
    let filterAction = null

    // Extract filter action if present - try multiple patterns
    const filterMatch = text.match(/```filter\n([\s\S]*?)\n```/) ||
                        text.match(/```filter\s*([\s\S]*?)\s*```/) ||
                        text.match(/```json\n([\s\S]*?)\n```/)

    if (filterMatch) {
      try {
        const filterData = JSON.parse(filterMatch[1].trim())
        filterAction = {
          type: 'filter' as const,
          label: filterData.label,
          filters: filterData.filters,
        }
        // Remove the filter block from the text
        text = text.replace(/```(?:filter|json)\s*[\s\S]*?\s*```/, '').trim()
      } catch (e) {
        // Silently handle parse errors
      }
    }

    return NextResponse.json({ text, filterAction })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
