export interface CardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface Attack {
  cost: string[];
  name: string;
  effect?: string;
  damage?: string | number;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Booster {
  id: string;
  name: string;
}

// Extended booster info for UI display
export interface BoosterInfo {
  id: string;
  name: string;
  setId: string;
  setName: string;
  image: string;
  cardCount: number;
}

export interface SetInfo {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    total: number;
    official: number;
  };
}

export interface Card {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category: string;
  illustrator?: string;
  rarity?: string;
  hp?: number;
  types?: string[];
  stage?: string;
  evolveFrom?: string;
  attacks?: Attack[];
  weaknesses?: Weakness[];
  retreat?: number;
  description?: string;
  set: SetInfo;
  boosters?: Booster[];
  variants?: {
    normal?: boolean;
    reverse?: boolean;
    holo?: boolean;
    firstEdition?: boolean;
  };
  legal?: {
    standard: boolean;
    expanded: boolean;
  };
}

export interface TCGPocketSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: {
    total: number;
    official: number;
  };
  cards?: CardBrief[];
  boosters?: Booster[];
}

export interface TCGPocketSeries {
  id: string;
  name: string;
  sets: TCGPocketSet[];
}

export type SortField = 'name' | 'hp' | 'rarity' | 'localId';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  rarity: string;
  type: string;
  stage: string;
}

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export type Collection = Record<string, boolean>;
