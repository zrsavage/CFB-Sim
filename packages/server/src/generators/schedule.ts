import { v4 as uuid } from "uuid";
import type { Division, ScheduleGame, Team } from "../../../shared/types.js";
import { shuffle } from "../util/random.js";

// Real conferences don't play a full round robin once they get past ~10
// teams, and non-conference "buy games" fill out the rest of the slate.
// These targets roughly mirror how many conference vs. non-conference games
// real Power/Group-of-Five/independent teams play in a season.
const CONFERENCE_GAMES: Record<Division, number> = { power: 9, group5: 8, independent: 0 };
const NONCONFERENCE_GAMES: Record<Division, number> = { power: 3, group5: 4, independent: 12 };

interface Edge {
  a: string;
  b: string;
}

const BYE = "__BYE__";

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// Standard "circle method" round robin, truncated to the first `rounds`
// rounds. Every round is a complete perfect matching, so taking just the
// first `rounds` of the full (n-1)-round robin still gives each team
// `rounds` distinct opponents (one fewer if their bye falls in that span,
// for odd-sized conferences).
function truncatedRoundRobinEdges(teamIds: string[], rounds: number): Edge[] {
  const ids = shuffle(teamIds);
  if (ids.length % 2 !== 0) ids.push(BYE);
  const n = ids.length;
  const fixed = ids[0];
  let rotating = ids.slice(1);
  const edges: Edge[] = [];
  const maxRounds = Math.min(rounds, n - 1);

  for (let round = 0; round < maxRounds; round++) {
    const roundIds = [fixed, ...rotating];
    for (let i = 0; i < n / 2; i++) {
      const t1 = roundIds[i];
      const t2 = roundIds[n - 1 - i];
      if (t1 !== BYE && t2 !== BYE) {
        edges.push({ a: t1, b: t2 });
      }
    }
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)];
  }

  return edges;
}

function generateConferenceEdges(teams: Team[]): Edge[] {
  const byConference = new Map<string, Team[]>();
  for (const team of teams) {
    if (!byConference.has(team.conference)) byConference.set(team.conference, []);
    byConference.get(team.conference)!.push(team);
  }

  const edges: Edge[] = [];
  for (const confTeams of byConference.values()) {
    if (confTeams.length < 2) continue;
    const target = CONFERENCE_GAMES[confTeams[0].division];
    if (target <= 0) continue;
    edges.push(...truncatedRoundRobinEdges(confTeams.map((t) => t.id), target));
  }
  return edges;
}

// Greedy randomized matching: repeatedly scans the pool of teams that still
// need non-conference games and pairs up whoever hasn't already played.
// Bounded by maxAttempts so it always terminates; a handful of teams can
// end up a game short if the pool gets awkward near the end, which is fine.
function generateNonConferenceEdges(teams: Team[], alreadyPlayed: Set<string>): Edge[] {
  const remaining = new Map<string, number>();
  for (const team of teams) {
    remaining.set(team.id, NONCONFERENCE_GAMES[team.division]);
  }
  const played = new Set(alreadyPlayed);
  const edges: Edge[] = [];
  const maxAttempts = teams.length * 40;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pool = shuffle(teams.filter((t) => (remaining.get(t.id) ?? 0) > 0));
    if (pool.length < 2) break;

    let progressed = false;
    for (let i = 0; i < pool.length; i++) {
      const a = pool[i];
      if ((remaining.get(a.id) ?? 0) <= 0) continue;
      for (let j = i + 1; j < pool.length; j++) {
        const b = pool[j];
        if ((remaining.get(b.id) ?? 0) <= 0) continue;
        const key = pairKey(a.id, b.id);
        if (played.has(key)) continue;
        played.add(key);
        edges.push({ a: a.id, b: b.id });
        remaining.set(a.id, (remaining.get(a.id) ?? 0) - 1);
        remaining.set(b.id, (remaining.get(b.id) ?? 0) - 1);
        progressed = true;
        break;
      }
    }
    if (!progressed) break;
  }

  return edges;
}

// Greedy graph coloring: assign each game to the earliest week where neither
// team is already playing. Max degree per team is ~12, so this converges
// quickly and never needs an unbounded search.
function assignWeeks(edges: Edge[]): { week: number; a: string; b: string }[] {
  const teamWeeks = new Map<string, Set<number>>();
  const result: { week: number; a: string; b: string }[] = [];

  for (const edge of shuffle(edges)) {
    const aWeeks = teamWeeks.get(edge.a) ?? new Set<number>();
    const bWeeks = teamWeeks.get(edge.b) ?? new Set<number>();
    let week = 1;
    while (aWeeks.has(week) || bWeeks.has(week)) week++;
    aWeeks.add(week);
    bWeeks.add(week);
    teamWeeks.set(edge.a, aWeeks);
    teamWeeks.set(edge.b, bWeeks);
    result.push({ week, a: edge.a, b: edge.b });
  }

  return result;
}

export function generateSchedule(teams: Team[], season: number): ScheduleGame[] {
  const conferenceEdges = generateConferenceEdges(teams);
  const played = new Set(conferenceEdges.map((e) => pairKey(e.a, e.b)));
  const nonConferenceEdges = generateNonConferenceEdges(teams, played);

  const weeklyPairs = assignWeeks([...conferenceEdges, ...nonConferenceEdges]);

  return weeklyPairs.map(({ week, a, b }) => {
    const homeFirst = Math.random() < 0.5;
    return {
      id: uuid(),
      week,
      season,
      homeTeamId: homeFirst ? a : b,
      awayTeamId: homeFirst ? b : a,
      played: false,
      homeScore: null,
      awayScore: null,
    };
  });
}

export function scheduleTotalWeeks(games: ScheduleGame[]): number {
  return games.reduce((max, g) => Math.max(max, g.week), 0);
}
