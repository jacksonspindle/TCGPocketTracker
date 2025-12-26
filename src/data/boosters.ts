// Booster image mappings by booster ID
export const boosterImages: Record<string, string> = {
  // Genetic Apex (A1) - 3 boosters
  'boo_A1-mewtwo': 'genetic-apex-mewtwo.webp',
  'boo_A1-charizard': 'genetic-apex-charizard.webp',
  'boo_A1-pikachu': 'genetic-apex-pikachu.webp',

  // Space-Time Smackdown (A2) - 2 boosters
  'boo_A2-dialga': 'dialga-booster.webp',
  'boo_A2-palkia': 'palkia-booster.webp',

  // Celestial Guardians (A3) - 2 boosters
  'boo_A3-solgaleo': 'solgaleo-booster.webp',
  'boo_A3-lunala': 'lunala-booster.webp',

  // Wisdom of Sea and Sky (A4) - 2 boosters
  'boo_A4-ho-oh': 'ho-oh-booster.webp',
  'boo_A4-lugia': 'lugia-booster.webp',

  // Mega Rising (B1) - 3 boosters
  'boo_B1-mega-blaziken': 'mega-blaziken.webp',
  'boo_B1-mega-gyarados': 'mega-gyarados.webp',
  'boo_B1-mega-altaria': 'mega-altaria.webp',

  // Promos
  'boo_P-A-promos': 'promos.webp',

  // Mini-sets (single booster each)
  'boo_A1a-mew': 'mythical-island-mew-booster.webp',
  'boo_A2a-arceus': 'triumphant-light.webp',
  'boo_A2b-shining': 'shining-revelry.webp',
  'boo_A3a-extradimensional': 'extradimensional-crisis.webp',
  'boo_A3b-eevee': 'eevee-grove-booster.webp',
  'boo_A4a-suicune': 'secluded-springs-booster.webp',
  'boo_B1a-crimson': 'crimson-blaze.webp',
};

// Order for displaying boosters within sets
export const boosterOrder: Record<string, string[]> = {
  'P-A': ['boo_P-A-promos'],
  'A1': ['boo_A1-charizard', 'boo_A1-mewtwo', 'boo_A1-pikachu'],
  'A2': ['boo_A2-dialga', 'boo_A2-palkia'],
  'A3': ['boo_A3-solgaleo', 'boo_A3-lunala'],
  'A4': ['boo_A4-ho-oh', 'boo_A4-lugia'],
  'B1': ['boo_B1-mega-blaziken', 'boo_B1-mega-gyarados', 'boo_B1-mega-altaria'],
  'A1a': ['boo_A1a-mew'],
  'A2a': ['boo_A2a-arceus'],
  'A2b': ['boo_A2b-shining'],
  'A3a': ['boo_A3a-extradimensional'],
  'A3b': ['boo_A3b-eevee'],
  'A4a': ['boo_A4a-suicune'],
  'B1a': ['boo_B1a-crimson'],
};

// Sets to exclude from the booster selector entirely
export const excludedSets = new Set<string>();

// Map booster IDs to their parent set ID (for filtering)
export const boosterToSetId: Record<string, string> = {
  'boo_P-A-promos': 'P-A',
  'boo_A1-mewtwo': 'A1',
  'boo_A1-charizard': 'A1',
  'boo_A1-pikachu': 'A1',
  'boo_A2-dialga': 'A2',
  'boo_A2-palkia': 'A2',
  'boo_A3-solgaleo': 'A3',
  'boo_A3-lunala': 'A3',
  'boo_A4-ho-oh': 'A4',
  'boo_A4-lugia': 'A4',
  'boo_B1-mega-blaziken': 'B1',
  'boo_B1-mega-gyarados': 'B1',
  'boo_B1-mega-altaria': 'B1',
  'boo_A1a-mew': 'A1a',
  'boo_A2a-arceus': 'A2a',
  'boo_A2b-shining': 'A2b',
  'boo_A3a-extradimensional': 'A3a',
  'boo_A3b-eevee': 'A3b',
  'boo_A4a-suicune': 'A4a',
  'boo_B1a-crimson': 'B1a',
};

// Sets with only one booster (mini-sets) - filter by set ID instead of booster
export const singleBoosterSets = new Set(['P-A', 'A1a', 'A2a', 'A2b', 'A3a', 'A3b', 'A4a', 'B1a']);

export function getBoosterImageUrl(boosterId: string): string {
  const filename = boosterImages[boosterId];
  return filename ? `/boosters/${filename}` : '';
}
