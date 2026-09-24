import type { ScheduleGame, Team } from "../../../shared/types.js";
import { clamp, gaussian } from "../util/random.js";

const HOME_FIELD_BONUS = 2.5;
const BASE_SCORE = 21;
const RATING_SCALE = 0.45;
const NOISE_STD_DEV = 9;

function scoreFor(offenseRating: number, opponentDefenseRating: number, homeBonus: number): number {
  const expected =
    BASE_SCORE + (offenseRating - opponentDefenseRating) * RATING_SCALE + homeBonus;
  const withNoise = gaussian(expected, NOISE_STD_DEV);
  return Math.round(clamp(withNoise, 0, 70));
}

export function simulateGame(home: Team, away: Team): { homeScore: number; awayScore: number } {
  let homeScore = scoreFor(home.offenseRating, away.defenseRating, HOME_FIELD_BONUS);
  let awayScore = scoreFor(away.offenseRating, home.defenseRating, 0);

  if (homeScore === awayScore) {
    // Simple overtime: give it to the team with the better overall rating,
    // with a chance for the underdog, then add a field goal.
    const homeWinsOt = Math.random() < 0.5 + (home.overallRating - away.overallRating) / 200;
    if (homeWinsOt) homeScore += 3;
    else awayScore += 3;
  }

  return { homeScore, awayScore };
}

export function simulateWeek(games: ScheduleGame[], teamsById: Map<string, Team>): ScheduleGame[] {
  return games.map((game) => {
    const home = teamsById.get(game.homeTeamId);
    const away = teamsById.get(game.awayTeamId);
    if (!home || !away) return game;
    const { homeScore, awayScore } = simulateGame(home, away);
    return { ...game, played: true, homeScore, awayScore };
  });
}

export function applyResultsToRecords(teams: Team[], games: ScheduleGame[]): Team[] {
  const byId = new Map(teams.map((t) => [t.id, { ...t }]));
  for (const game of games) {
    if (!game.played || game.homeScore === null || game.awayScore === null) continue;
    const home = byId.get(game.homeTeamId);
    const away = byId.get(game.awayTeamId);
    if (!home || !away) continue;
    if (game.homeScore > game.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }
  return Array.from(byId.values());
}
