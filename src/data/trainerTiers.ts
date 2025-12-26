// Trainer tier data based on competitive tier list
// Tiers: S, A+, A, B, C, D, F

export type TrainerTier = 'S' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface TierInfo {
  name: TrainerTier
  color: string
  bgColor: string
}

export const tierConfig: TierInfo[] = [
  { name: 'S', color: '#ffffff', bgColor: '#ff7f7f' },
  { name: 'A+', color: '#000000', bgColor: '#ffdf7f' },
  { name: 'A', color: '#000000', bgColor: '#ffbf7f' },
  { name: 'B', color: '#000000', bgColor: '#ffff7f' },
  { name: 'C', color: '#000000', bgColor: '#bfff7f' },
  { name: 'D', color: '#000000', bgColor: '#7fff7f' },
  { name: 'F', color: '#000000', bgColor: '#7fff7f' },
]

// Map trainer names to their tiers
// Names should match the card names from TCGDex API
export const trainerTiers: Record<string, TrainerTier> = {
  // S Tier
  "Professor's Research": 'S',

  // A+ Tier
  'Cyrus': 'A+',

  // A Tier
  'Sabrina': 'A',
  'Mars': 'A',
  'Red': 'A',
  'Lillie': 'A',
  'May': 'A',
  'Lisia': 'A',
  'Giovanni': 'A',

  // B Tier
  'Leaf': 'B',
  'Pokémon Center Lady': 'B',
  'Pokemon Center Lady': 'B',
  'Irida': 'B',
  'Erika': 'B',
  'Lusamine': 'B',
  'Roxanne': 'B',

  // C Tier
  'Blue': 'C',
  'Guzma': 'C',
  'Misty': 'C',

  // D Tier
  'Cynthia': 'D',
  'Lyra': 'D',
  'Dawn': 'D',
  "Team Rocket's Greed": 'D',
  'Will': 'D',
  'Gladion': 'D',

  // F Tier
  'Adaman': 'F',
  'Acerola': 'F',
  'Barry': 'F',
  'Volkner': 'F',
  'Celio': 'F',
  "Colress's Tenacity": 'F',
  "Colress's Experiment": 'F',
  'Team Galactic Grunt': 'F',
  'Blaine': 'F',
  'Budding Expeditioner': 'F',
  'Koga': 'F',
  'Brock': 'F',
  'Lt. Surge': 'F',
  'Jasmine': 'F',
  'Hiker': 'F',
  'Fisher': 'F',
  'Poké Kid': 'F',
  'Hau': 'F',
  'Looker': 'F',
  'Mallow': 'F',
  'Sophocles': 'F',
  'Elio': 'F',
  'Lana': 'F',
  'Hala': 'F',
  'Marlon': 'F',
  'Whitney': 'F',
  'Fantina': 'F',
  'Traveling Merchant': 'F',
  'Morty': 'F',
  'Selene': 'F',
  'RPokemon Breeder': 'F',
  'Pokémon Breeder': 'F',
  'Pokemon Breeder': 'F',
  'Lass': 'F',
  'Youngster': 'F',
  'Swimmer': 'F',
  'Picnicker': 'F',
  'Camper': 'F',
  'Schoolgirl': 'F',
  'Schoolboy': 'F',
  'Parasol Lady': 'F',
  'Channeler': 'F',
  'Old Amber': 'F',
  'Dome Fossil': 'F',
  'Helix Fossil': 'F',
  'Gear': 'F',
  'Fossil': 'F',
}

// Helper to get tier for a card name
export function getTrainerTier(cardName: string): TrainerTier | null {
  // Try exact match first
  if (trainerTiers[cardName]) {
    return trainerTiers[cardName]
  }

  // Try matching the base name (before any special characters)
  const baseName = cardName.split(' -')[0].split(' (')[0].trim()
  if (trainerTiers[baseName]) {
    return trainerTiers[baseName]
  }

  return null
}

// Get tier config by name
export function getTierConfig(tier: TrainerTier): TierInfo {
  return tierConfig.find(t => t.name === tier) || tierConfig[tierConfig.length - 1]
}
