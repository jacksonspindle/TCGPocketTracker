export interface FilterAction {
  type: 'filter';
  label: string;
  filters: {
    search?: string;
    rarity?: string;
    type?: string;
    stage?: string;
    collectionFilter?: 'all' | 'owned' | 'missing' | 'wishlist';
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  filterAction?: FilterAction;
  timestamp: Date;
}

export interface CollectionSummary {
  totalCards: number;
  ownedCards: number;
  completionPercentage: number;
  wishlistedCards: number;
  byRarity: Record<string, { owned: number; total: number; wishlisted: number }>;
  byType: Record<string, { owned: number; total: number; wishlisted: number }>;
  byCategory: Record<string, { owned: number; total: number; wishlisted: number }>;
  byStage: Record<string, { owned: number; total: number }>;
  // Cross-dimensional breakdowns for nuanced queries
  byRarityAndCategory: Record<string, Record<string, { owned: number; total: number }>>;
  byRarityAndType: Record<string, Record<string, { owned: number; total: number }>>;
}

export interface BoosterSummary {
  id: string;
  name: string;
  setId: string;
  setName: string;
  totalCards: number;
  ownedCards: number;
  completionPercentage: number;
  missingByRarity: Record<string, number>;
}

export interface ChatContextData {
  collectionSummary: CollectionSummary;
  boosterSummaries: BoosterSummary[];
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeAPIResponse {
  id: string;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
