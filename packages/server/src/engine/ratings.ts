import type { Player, Position, Team } from "../../../shared/types.js";
import { STARTER_COUNTS } from "../generators/players.js";

function startersAvg(players: Player[], position: Position, count: number): number {
  const atPosition = players
    .filter((p) => p.position === position)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, count);
  if (atPosition.length === 0) return 50;
  return atPosition.reduce((sum, p) => sum + p.overall, 0) / atPosition.length;
}

const OFFENSE_WEIGHTS: Partial<Record<Position, number>> = {
  QB: 3,
  RB: 1.5,
  WR: 1.5,
  TE: 1,
  OL: 2,
  K: 0.3,
};

const DEFENSE_WEIGHTS: Partial<Record<Position, number>> = {
  DL: 2,
  LB: 1.5,
  CB: 1.5,
  S: 1,
  P: 0.3,
};

function weightedRating(players: Player[], weights: Partial<Record<Position, number>>): number {
  let totalWeight = 0;
  let totalValue = 0;
  for (const [position, weight] of Object.entries(weights) as [Position, number][]) {
    const avg = startersAvg(players, position, STARTER_COUNTS[position]);
    totalValue += avg * weight;
    totalWeight += weight;
  }
  return totalWeight === 0 ? 50 : totalValue / totalWeight;
}

export function computeTeamRatings(team: Team, roster: Player[]): Team {
  const offenseRating = Math.round(weightedRating(roster, OFFENSE_WEIGHTS));
  const defenseRating = Math.round(weightedRating(roster, DEFENSE_WEIGHTS));
  const overallRating = Math.round((offenseRating + defenseRating) / 2);
  return { ...team, offenseRating, defenseRating, overallRating };
}

export function recomputeAllRatings(teams: Team[], players: Player[]): Team[] {
  return teams.map((team) => {
    const roster = players.filter((p) => p.teamId === team.id);
    return computeTeamRatings(team, roster);
  });
}
