import { ChatContextData, ClaudeMessage, FilterAction } from '../types/chat'

export interface ChatResponse {
  text: string;
  filterAction?: FilterAction;
}

export async function sendChatMessage(
  messages: ClaudeMessage[],
  contextData: ChatContextData
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      contextData,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API request failed with status ${response.status}`)
  }

  const data = await response.json()
  return {
    text: data.text,
    filterAction: data.filterAction,
  }
}
