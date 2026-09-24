import { v4 as uuid } from "uuid";
import type { ScheduleGame, Team } from "../../../shared/types.js";
import { shuffle } from "../util/random.js";

// Standard "circle method" round-robin: with N teams (N even) produces N-1
// rounds where every team plays every other team exactly once.
export function generateSchedule(teams: Team[], season: number): ScheduleGame[] {
  const ids = shuffle(teams.map((t) => t.id));
  const n = ids.length;
  if (n % 2 !== 0) {
    throw new Error("generateSchedule requires an even number of teams");
  }

  const rounds: [string, string][][] = [];
  const fixed = ids[0];
  let rotating = ids.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const roundIds = [fixed, ...rotating];
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      pairs.push([roundIds[i], roundIds[n - 1 - i]]);
    }
    rounds.push(pairs);
    // rotate
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  const games: ScheduleGame[] = [];
  rounds.forEach((pairs, roundIdx) => {
    // Alternate home/away based on round parity so nobody gets all home or away games.
    pairs.forEach(([a, b], pairIdx) => {
      const flip = (roundIdx + pairIdx) % 2 === 0;
      const homeTeamId = flip ? a : b;
      const awayTeamId = flip ? b : a;
      games.push({
        id: uuid(),
        week: roundIdx + 1,
        season,
        homeTeamId,
        awayTeamId,
        played: false,
        homeScore: null,
        awayScore: null,
      });
    });
  });

  return games;
}

export function totalWeeksFor(teamCount: number): number {
  return teamCount - 1;
}
