import type { Facilities, FacilityKey, Team } from "../../../shared/types.js";
import { clamp, randInt } from "../util/random.js";

export const MAX_FACILITY_LEVEL = 5;
export const STARTING_PROGRAM_POINTS = 20;

// Cost in Program Points to go from level-1 to level.
export const LEVEL_UPGRADE_COST: Record<number, number> = {
  2: 30,
  3: 60,
  4: 100,
  5: 150,
};

export const FACILITY_LABELS: Record<FacilityKey, string> = {
  stadium: "Stadium & Fan Support",
  training: "Training Facility",
  academics: "Academic Center",
  nil: "NIL Collective",
};

function facilityLevelFromPrestige(prestige: number): number {
  if (prestige >= 88) return 5;
  if (prestige >= 75) return 4;
  if (prestige >= 60) return 3;
  if (prestige >= 45) return 2;
  return 1;
}

export function generateInitialFacilities(prestige: number): Facilities {
  const base = facilityLevelFromPrestige(prestige);
  const jitter = () => clamp(base + randInt(-1, 1), 1, MAX_FACILITY_LEVEL);
  return {
    stadium: jitter(),
    training: jitter(),
    academics: jitter(),
    nil: jitter(),
  };
}

export function upgradeCost(currentLevel: number): number | null {
  const nextLevel = currentLevel + 1;
  if (nextLevel > MAX_FACILITY_LEVEL) return null;
  return LEVEL_UPGRADE_COST[nextLevel];
}

export function upgradeFacility(
  team: Team,
  facility: FacilityKey
): { team: Team; error?: string } {
  const currentLevel = team.facilities[facility];
  const cost = upgradeCost(currentLevel);
  if (cost === null) {
    return { team, error: `${FACILITY_LABELS[facility]} is already at max level` };
  }
  if (team.programPoints < cost) {
    return { team, error: `Not enough Program Points (need ${cost}, have ${team.programPoints})` };
  }

  return {
    team: {
      ...team,
      programPoints: team.programPoints - cost,
      facilities: { ...team.facilities, [facility]: currentLevel + 1 },
    },
  };
}

// Season-end Program Points income for every team, driven by stadium level,
// win total, and how many players that program got drafted this cycle.
export function applySeasonIncome(
  teams: Team[],
  draftPicksThisSeason: Map<string, number>
): Team[] {
  return teams.map((team) => {
    const picks = draftPicksThisSeason.get(team.id) ?? 0;
    const income = 15 + team.facilities.stadium * 8 + team.wins * 3 + picks * 10;
    return { ...team, programPoints: team.programPoints + income };
  });
}
