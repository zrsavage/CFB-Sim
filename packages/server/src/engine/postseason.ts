import { v4 as uuid } from "uuid";
import type { RecapEntry, ScheduleGame, Team } from "../../../shared/types.js";
import { INDEPENDENTS } from "../data/cfbTeams.js";
import { BOWL_NAMES } from "../data/bowlNames.js";
import { clamp, shuffle } from "../util/random.js";

interface ConferenceRecord {
  team: Team;
  wins: number;
  losses: number;
}

function conferenceStandings(
  teams: Team[],
  schedule: ScheduleGame[],
  conference: string
): ConferenceRecord[] {
  const confTeams = teams.filter((t) => t.conference === conference);
  const teamIds = new Set(confTeams.map((t) => t.id));
  const records = new Map<string, { wins: number; losses: number }>(
    confTeams.map((t) => [t.id, { wins: 0, losses: 0 }])
  );

  for (const game of schedule) {
    if (!game.played || game.homeScore === null || game.awayScore === null) continue;
    if (!teamIds.has(game.homeTeamId) || !teamIds.has(game.awayTeamId)) continue;
    const home = records.get(game.homeTeamId)!;
    const away = records.get(game.awayTeamId)!;
    if (game.homeScore > game.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  return confTeams
    .map((team) => ({ team, ...records.get(team.id)! }))
    .sort((a, b) => {
      const aPct = a.wins / Math.max(1, a.wins + a.losses);
      const bPct = b.wins / Math.max(1, b.wins + b.losses);
      return bPct - aPct || b.wins - a.wins;
    });
}

// One championship game per conference (skipping independents, who have no
// conference to crown a champion of), matching the top two teams by
// conference record.
export function generateChampionshipGames(
  teams: Team[],
  schedule: ScheduleGame[],
  week: number,
  season: number
): ScheduleGame[] {
  const conferences = Array.from(new Set(teams.map((t) => t.conference))).filter(
    (c) => c !== INDEPENDENTS
  );

  const games: ScheduleGame[] = [];
  for (const conference of conferences) {
    const standings = conferenceStandings(teams, schedule, conference);
    if (standings.length < 2) continue;
    const [first, second] = standings;
    games.push({
      id: uuid(),
      week,
      season,
      homeTeamId: first.team.id,
      awayTeamId: second.team.id,
      played: false,
      homeScore: null,
      awayScore: null,
      label: `${conference} Championship`,
    });
  }
  return games;
}

const MAX_BOWL_GAMES = 40;

// Bowl-eligible teams (winning record) get paired up by strength for one
// last game of the year. Adjacent-strength pairing keeps most bowls close.
export function generateBowlGames(teams: Team[], week: number, season: number): ScheduleGame[] {
  const eligible = teams
    .filter((t) => t.wins > t.losses)
    .sort((a, b) => b.overallRating - a.overallRating || b.wins - a.wins)
    .slice(0, MAX_BOWL_GAMES * 2);

  const paired = eligible.length % 2 === 0 ? eligible : eligible.slice(0, -1);
  // Shuffle once; the modulo below only repeats a name if the slate somehow
  // needs more games than there are bowl names.
  const bowlNames = shuffle([...BOWL_NAMES]);

  const games: ScheduleGame[] = [];
  for (let i = 0; i < paired.length; i += 2) {
    const home = paired[i];
    const away = paired[i + 1];
    const bowlIndex = i / 2;
    const name = bowlNames[bowlIndex % bowlNames.length];
    games.push({
      id: uuid(),
      week,
      season,
      homeTeamId: home.id,
      awayTeamId: away.id,
      played: false,
      homeScore: null,
      awayScore: null,
      label: name,
    });
  }
  return games;
}

// Awards a small prestige bump to the winner of each played, labeled
// postseason game (championship or bowl), and surfaces it in the recap when
// it involves the user's team.
export function applyPostseasonPrestige(
  games: ScheduleGame[],
  teams: Team[],
  userTeamId: string,
  prestigeBoost: number
): { teams: Team[]; recap: RecapEntry[] } {
  const teamById = new Map(teams.map((t) => [t.id, { ...t }]));
  const recap: RecapEntry[] = [];

  for (const game of games) {
    if (!game.played || game.homeScore === null || game.awayScore === null || !game.label) continue;
    const winnerId = game.homeScore > game.awayScore ? game.homeTeamId : game.awayTeamId;
    const loserId = winnerId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
    const winner = teamById.get(winnerId);
    if (!winner) continue;

    winner.prestige = clamp(winner.prestige + prestigeBoost, 30, 99);

    if (winnerId === userTeamId || loserId === userTeamId) {
      const won = winnerId === userTeamId;
      const opponent = teamById.get(won ? loserId : winnerId);
      recap.push({
        message: `${game.label}: ${won ? "You won" : "You lost"} against ${opponent?.name} ${opponent?.mascot}${
          won ? ` (+${prestigeBoost} prestige)` : ""
        }.`,
      });
    }
  }

  return { teams: Array.from(teamById.values()), recap };
}
