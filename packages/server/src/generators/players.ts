import { v4 as uuid } from "uuid";
import type { DevTrait, Player, PlayerYear, Position } from "../../../shared/types.js";
import { FIRST_NAMES, LAST_NAMES, randomFrom } from "../data/names.js";
import { clamp, randInt, gaussian, weightedPick } from "../util/random.js";

// Roster composition: 70 total players across position groups.
export const ROSTER_COMPOSITION: Record<Position, number> = {
  QB: 4,
  RB: 6,
  WR: 10,
  TE: 4,
  OL: 12,
  DL: 10,
  LB: 8,
  CB: 8,
  S: 6,
  K: 1,
  P: 1,
};

export const STARTER_COUNTS: Record<Position, number> = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1,
  OL: 5,
  DL: 4,
  LB: 3,
  CB: 2,
  S: 2,
  K: 1,
  P: 1,
};

const YEARS: PlayerYear[] = ["FR", "SO", "JR", "SR"];

const YEAR_OVERALL_ADJUST: Record<PlayerYear, number> = {
  FR: -5,
  SO: -2,
  JR: 1,
  SR: 3,
};

const YEAR_REMAINING_FACTOR: Record<PlayerYear, number> = {
  FR: 1,
  SO: 0.7,
  JR: 0.4,
  SR: 0.1,
};

const YEAR_AGE: Record<PlayerYear, number> = {
  FR: 18,
  SO: 19,
  JR: 20,
  SR: 21,
};

function rollDevTrait(): DevTrait {
  return weightedPick<DevTrait>([
    { value: "Slow", weight: 35 },
    { value: "Normal", weight: 40 },
    { value: "Fast", weight: 20 },
    { value: "Star", weight: 5 },
  ]);
}

function headroomForTrait(trait: DevTrait): number {
  switch (trait) {
    case "Slow":
      return randInt(2, 6);
    case "Normal":
      return randInt(6, 14);
    case "Fast":
      return randInt(14, 24);
    case "Star":
      return randInt(24, 35);
  }
}

export function generatePlayer(
  position: Position,
  teamPrestige: number,
  year?: PlayerYear,
  teamId: string | null = null
): Player {
  const playerYear = year ?? randomFrom(YEARS);
  const base = 55 + (teamPrestige - 70) * 0.25 + gaussian(0, 7) + YEAR_OVERALL_ADJUST[playerYear];
  const overall = Math.round(clamp(base, 40, 99));
  const devTrait = rollDevTrait();
  const headroom = headroomForTrait(devTrait) * YEAR_REMAINING_FACTOR[playerYear];
  const potential = Math.round(clamp(overall + headroom, overall, 99));

  return {
    id: uuid(),
    teamId,
    firstName: randomFrom(FIRST_NAMES),
    lastName: randomFrom(LAST_NAMES),
    position,
    year: playerYear,
    overall,
    potential,
    devTrait,
    age: YEAR_AGE[playerYear] + randInt(0, 1),
  };
}

export function generateRoster(teamId: string, teamPrestige: number): Player[] {
  const roster: Player[] = [];
  for (const position of Object.keys(ROSTER_COMPOSITION) as Position[]) {
    const count = ROSTER_COMPOSITION[position];
    for (let i = 0; i < count; i++) {
      // Spread players roughly evenly across class years so the roster doesn't
      // graduate in one giant wave.
      const year = YEARS[i % YEARS.length];
      roster.push(generatePlayer(position, teamPrestige, year, teamId));
    }
  }
  return roster;
}
