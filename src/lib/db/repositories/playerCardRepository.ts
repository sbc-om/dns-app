import { getDatabase, generateId } from '../lmdb';

export interface PhysicalTests {
  verticalJump?: number; // cm
  broadJump?: number; // cm
  sprint10m?: number; // seconds
  sprint20m?: number; // seconds
  sprint30m?: number; // seconds
  illinoisAgilityTest?: number; // seconds
  tTest?: number; // seconds
  agility505Test?: number; // seconds
  singleLegBalance?: number; // seconds
  plankHold?: number; // seconds
  enduranceTest?: number; // meters or time
  pullUpTest?: number; // count
}

export interface PlayerCardData {
  id: string;
  userId: string; // The kid
  
  // Basic Info
  name: string;
  age: number;
  position: string;
  preferredFoot: 'left' | 'right' | 'both';
  height?: number; // cm
  weight?: number; // kg
  playerPhoto?: string; // URL
  countryFlag?: string; // ISO code or URL
  
  // Physical Tests (raw data)
  physicalTests: PhysicalTests;
  
  // Calculated Ratings (1-99)
  ratings: {
    pace: number; // PAC - Speed
    dribbling: number; // DRI - Motor Control
    physical: number; // PHY - Physical Strength
    strength: number; // STR - Upper Body Strength
    agility: number; // AGI - Agility
    endurance: number; // END - Endurance
  };
  
  // Overall Rating (calculated from all stats)
  overallRating: number;
  
  // Card Color/Stage
  cardColor: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  dnaStage: string;
  
  // Metadata
  createdBy: string; // Admin/Coach who created the card
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerCardInput {
  userId: string;
  name: string;
  age: number;
  position: string;
  preferredFoot: 'left' | 'right' | 'both';
  height?: number;
  weight?: number;
  playerPhoto?: string;
  countryFlag?: string;
  physicalTests: PhysicalTests;
  createdBy: string;
}

const PLAYER_CARDS_PREFIX = 'player_cards:';
const PLAYER_CARDS_BY_USER_PREFIX = 'player_cards_by_user:';

/**
 * Calculate rating from raw test data
 */
function calculateRatings(tests: PhysicalTests, age: number): PlayerCardData['ratings'] {
  // Speed (PAC) - based on sprints
  const pace = calculatePaceRating(tests.sprint10m, tests.sprint20m, tests.sprint30m, age);
  
  // Agility (AGI) - based on agility tests
  const agility = calculateAgilityRating(tests.illinoisAgilityTest, tests.tTest, tests.agility505Test, age);
  
  // Physical Strength (PHY) - based on jumps
  const physical = calculatePhysicalRating(tests.verticalJump, tests.broadJump, age);
  
  // Upper Body Strength (STR) - based on pull-ups and plank
  const strength = calculateStrengthRating(tests.pullUpTest, tests.plankHold, age);
  
  // Motor Control (DRI) - based on balance
  const dribbling = calculateDribblingRating(tests.singleLegBalance, age);
  
  // Endurance (END)
  const endurance = calculateEnduranceRating(tests.enduranceTest, age);
  
  return { pace, dribbling, physical, strength, agility, endurance };
}

function calculatePaceRating(sprint10?: number, sprint20?: number, sprint30?: number, age?: number): number {
  if (!sprint10 && !sprint20 && !sprint30) return 50;
  
  // Lower time = better rating
  let score = 0;
  let count = 0;
  
  if (sprint10) {
    // 10m sprint: <1.8s = 90+, 1.8-2.0s = 75-89, 2.0-2.2s = 60-74, >2.2s = <60
    score += sprint10 < 1.8 ? 95 : sprint10 < 2.0 ? 80 : sprint10 < 2.2 ? 65 : 45;
    count++;
  }
  if (sprint20) {
    score += sprint20 < 3.0 ? 95 : sprint20 < 3.3 ? 80 : sprint20 < 3.6 ? 65 : 45;
    count++;
  }
  if (sprint30) {
    score += sprint30 < 4.2 ? 95 : sprint30 < 4.6 ? 80 : sprint30 < 5.0 ? 65 : 45;
    count++;
  }
  
  return Math.round(count > 0 ? score / count : 50);
}

function calculateAgilityRating(illinois?: number, tTest?: number, agility505?: number, age?: number): number {
  if (!illinois && !tTest && !agility505) return 50;
  
  let score = 0;
  let count = 0;
  
  if (illinois) {
    score += illinois < 15.0 ? 95 : illinois < 16.5 ? 80 : illinois < 18.0 ? 65 : 45;
    count++;
  }
  if (tTest) {
    score += tTest < 9.5 ? 95 : tTest < 10.5 ? 80 : tTest < 11.5 ? 65 : 45;
    count++;
  }
  if (agility505) {
    score += agility505 < 2.3 ? 95 : agility505 < 2.5 ? 80 : agility505 < 2.7 ? 65 : 45;
    count++;
  }
  
  return Math.round(count > 0 ? score / count : 50);
}

function calculatePhysicalRating(verticalJump?: number, broadJump?: number, age?: number): number {
  if (!verticalJump && !broadJump) return 50;
  
  let score = 0;
  let count = 0;
  
  if (verticalJump) {
    score += verticalJump > 50 ? 95 : verticalJump > 40 ? 80 : verticalJump > 30 ? 65 : 45;
    count++;
  }
  if (broadJump) {
    score += broadJump > 200 ? 95 : broadJump > 180 ? 80 : broadJump > 160 ? 65 : 45;
    count++;
  }
  
  return Math.round(count > 0 ? score / count : 50);
}

function calculateStrengthRating(pullUps?: number, plankHold?: number, age?: number): number {
  if (!pullUps && !plankHold) return 50;
  
  let score = 0;
  let count = 0;
  
  if (pullUps) {
    score += pullUps > 10 ? 95 : pullUps > 7 ? 80 : pullUps > 4 ? 65 : 45;
    count++;
  }
  if (plankHold) {
    score += plankHold > 90 ? 95 : plankHold > 60 ? 80 : plankHold > 40 ? 65 : 45;
    count++;
  }
  
  return Math.round(count > 0 ? score / count : 50);
}

function calculateDribblingRating(balance?: number, age?: number): number {
  if (!balance) return 50;
  
  return balance > 40 ? 95 : balance > 30 ? 80 : balance > 20 ? 65 : 45;
}

function calculateEnduranceRating(endurance?: number, age?: number): number {
  if (!endurance) return 50;
  
  // Assuming endurance is in meters (Yo-Yo or Cooper test)
  return endurance > 2000 ? 95 : endurance > 1600 ? 80 : endurance > 1200 ? 65 : 45;
}

/**
 * Calculate overall rating from individual ratings
 */
function calculateOverallRating(ratings: PlayerCardData['ratings']): number {
  const { pace, dribbling, physical, strength, agility, endurance } = ratings;
  const average = (pace + dribbling + physical + strength + agility + endurance) / 6;
  return Math.round(average);
}

/**
 * Determine card color based on overall rating
 */
function determineCardColor(overallRating: number): PlayerCardData['cardColor'] {
  if (overallRating >= 85) return 'diamond';
  if (overallRating >= 75) return 'platinum';
  if (overallRating >= 65) return 'gold';
  if (overallRating >= 55) return 'silver';
  return 'bronze';
}

/**
 * Determine DNA stage based on overall rating
 */
function determineDNAStage(overallRating: number): string {
  if (overallRating >= 85) return 'Elite';
  if (overallRating >= 75) return 'Advanced';
  if (overallRating >= 65) return 'Intermediate';
  if (overallRating >= 55) return 'Developing';
  return 'Foundation';
}

/**
 * Create a new player card
 */
export async function createPlayerCard(input: CreatePlayerCardInput): Promise<PlayerCardData> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  // Calculate ratings from physical tests
  const ratings = calculateRatings(input.physicalTests, input.age);
  const overallRating = calculateOverallRating(ratings);
  const cardColor = determineCardColor(overallRating);
  const dnaStage = determineDNAStage(overallRating);
  
  const playerCard: PlayerCardData = {
    id,
    userId: input.userId,
    name: input.name,
    age: input.age,
    position: input.position,
    preferredFoot: input.preferredFoot,
    height: input.height,
    weight: input.weight,
    playerPhoto: input.playerPhoto,
    countryFlag: input.countryFlag,
    physicalTests: input.physicalTests,
    ratings,
    overallRating,
    cardColor,
    dnaStage,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  
  // Store player card
  await db.put(`${PLAYER_CARDS_PREFIX}${id}`, playerCard);
  
  // Index by user
  await db.put(`${PLAYER_CARDS_BY_USER_PREFIX}${input.userId}:${id}`, id);
  
  return playerCard;
}

/**
 * Get player card by ID
 */
export async function getPlayerCardById(id: string): Promise<PlayerCardData | null> {
  const db = getDatabase();
  return (await db.get(`${PLAYER_CARDS_PREFIX}${id}`)) || null;
}

/**
 * Get all player cards for a user
 */
export async function getPlayerCardsByUserId(userId: string): Promise<PlayerCardData[]> {
  const db = getDatabase();
  const cards: PlayerCardData[] = [];
  
  for await (const { value } of db.getRange({
    start: `${PLAYER_CARDS_BY_USER_PREFIX}${userId}:`,
    end: `${PLAYER_CARDS_BY_USER_PREFIX}${userId}:\xFF`,
  })) {
    const cardId = value as string;
    const card = await getPlayerCardById(cardId);
    if (card) {
      cards.push(card);
    }
  }
  
  // Sort by creation date descending
  return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Update player card
 */
export async function updatePlayerCard(
  id: string,
  updates: Partial<CreatePlayerCardInput>
): Promise<PlayerCardData | null> {
  const db = getDatabase();
  const card = await getPlayerCardById(id);
  
  if (!card) {
    return null;
  }
  
  // Recalculate ratings if physical tests changed
  let ratings = card.ratings;
  let overallRating = card.overallRating;
  let cardColor = card.cardColor;
  let dnaStage = card.dnaStage;
  
  if (updates.physicalTests) {
    const age = updates.age || card.age;
    ratings = calculateRatings(updates.physicalTests, age);
    overallRating = calculateOverallRating(ratings);
    cardColor = determineCardColor(overallRating);
    dnaStage = determineDNAStage(overallRating);
  }
  
  const updatedCard: PlayerCardData = {
    ...card,
    ...updates,
    ratings,
    overallRating,
    cardColor,
    dnaStage,
    updatedAt: new Date().toISOString(),
  };
  
  await db.put(`${PLAYER_CARDS_PREFIX}${id}`, updatedCard);
  return updatedCard;
}

/**
 * Delete player card
 */
export async function deletePlayerCard(id: string): Promise<boolean> {
  const db = getDatabase();
  const card = await getPlayerCardById(id);
  
  if (!card) {
    return false;
  }
  
  await db.remove(`${PLAYER_CARDS_PREFIX}${id}`);
  await db.remove(`${PLAYER_CARDS_BY_USER_PREFIX}${card.userId}:${id}`);
  
  return true;
}
