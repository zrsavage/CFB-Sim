import { v4 as uuid } from "uuid";
import type { Player, Team } from "../../../shared/types.js";
import { CFB_TEAMS } from "../data/cfbTeams.js";
import { clamp, randInt } from "../util/random.js";
import { generateRoster } from "./players.js";

function abbreviate(name: string, used: Set<string>): string {
  const words = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean);
  const base =
    words.length > 1
      ? words.map((w) => w[0]).join("").slice(0, 4).toUpperCase()
      : words[0].slice(0, 4).toUpperCase();

  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 3)}${suffix}`;
    suffix++;
  }
  used.add(candidate);
  return candidate;
}

export function generateLeague(): { teams: Team[]; players: Player[] } {
  const teams: Team[] = [];
  const players: Player[] = [];
  const usedAbbreviations = new Set<string>();

  for (const entry of CFB_TEAMS) {
    const prestige = clamp(entry.basePrestige + randInt(-3, 3), 30, 99);
    const team: Team = {
      id: uuid(),
      name: entry.name,
      mascot: entry.mascot,
      abbreviation: abbreviate(entry.name, usedAbbreviations),
      conference: entry.conference,
      division: entry.division,
      prestige,
      wins: 0,
      losses: 0,
      offenseRating: 0,
      defenseRating: 0,
      overallRating: 0,
    };
    teams.push(team);
    players.push(...generateRoster(team.id, prestige));
  }

  return { teams, players };
}
