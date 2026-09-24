import { v4 as uuid } from "uuid";
import type { Coach, CoachingStaff } from "../../../shared/types.js";
import { FIRST_NAMES, LAST_NAMES, randomFrom } from "../data/names.js";
import { PERSONALITY_TRAITS } from "../data/background.js";
import { clamp, gaussian, randInt } from "../util/random.js";

export function generateCoach(ratingMean: number, ratingStdDev = 10): Coach {
  return {
    id: uuid(),
    firstName: randomFrom(FIRST_NAMES),
    lastName: randomFrom(LAST_NAMES),
    rating: Math.round(clamp(gaussian(ratingMean, ratingStdDev), 35, 99)),
    trait: randomFrom(PERSONALITY_TRAITS),
    yearsAtSchool: randInt(0, 3),
  };
}

export function generateInitialStaff(teamPrestige: number): CoachingStaff {
  const base = 50 + (teamPrestige - 65) * 0.4;
  return {
    headCoach: generateCoach(base + 4),
    offensiveCoordinator: generateCoach(base),
    defensiveCoordinator: generateCoach(base),
  };
}

// A nationally available pool of candidates any program can try to hire,
// independent of team prestige — a fresh grad assistant and a proven
// coordinator both show up looking for work.
export function generateCoachingPool(size = 40): Coach[] {
  const pool: Coach[] = [];
  for (let i = 0; i < size; i++) {
    pool.push(generateCoach(60, 16));
  }
  return pool;
}
