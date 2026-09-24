import { clamp } from "../util/random.js";

export interface DraftOutcome {
  drafted: boolean;
  round: number | null;
  prestigeBoost: number;
}

// Higher rounds are worth a bigger prestige bump, same as a real program's
// reputation getting a bigger boost from a first-rounder than a 7th-rounder.
const ROUND_PRESTIGE_BOOST: Record<number, number> = {
  1: 3,
  2: 2,
  3: 2,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
};

function roundForOverall(overall: number): number {
  if (overall >= 95) return 1;
  if (overall >= 90) return 2;
  if (overall >= 86) return 3;
  if (overall >= 82) return 4;
  if (overall >= 78) return 5;
  if (overall >= 74) return 6;
  return 7;
}

// Only players with a real NFL-caliber overall have a shot, and the chance
// climbs steeply from there — most FBS seniors go undrafted, same as real
// life (only ~250 of the ~2,600+ scholarship seniors get picked each year).
function draftProbability(overall: number): number {
  if (overall < 68) return 0;
  return clamp((overall - 70) * 0.04, 0, 0.95);
}

export function rollDraftOutcome(overall: number): DraftOutcome {
  if (Math.random() >= draftProbability(overall)) {
    return { drafted: false, round: null, prestigeBoost: 0 };
  }
  const round = roundForOverall(overall);
  return { drafted: true, round, prestigeBoost: ROUND_PRESTIGE_BOOST[round] };
}
