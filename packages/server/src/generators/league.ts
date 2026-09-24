import { v4 as uuid } from "uuid";
import type { Player, Team } from "../../../shared/types.js";
import { TEAM_CITIES, TEAM_MASCOTS } from "../data/names.js";
import { randInt, shuffle } from "../util/random.js";
import { generateRoster } from "./players.js";

export const CONFERENCES = ["Atlantic Conference", "Heartland Conference"] as const;
export const TEAMS_PER_CONFERENCE = 6;

function abbreviate(city: string): string {
  const words = city.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 4).toUpperCase();
  }
  return words[0].slice(0, 4).toUpperCase();
}

export function generateLeague(): { teams: Team[]; players: Player[] } {
  const cities = shuffle([...TEAM_CITIES]);
  const mascots = shuffle([...TEAM_MASCOTS]);

  const teams: Team[] = [];
  const players: Player[] = [];

  let idx = 0;
  for (const conference of CONFERENCES) {
    for (let i = 0; i < TEAMS_PER_CONFERENCE; i++) {
      const city = cities[idx];
      const mascot = mascots[idx];
      const prestige = randInt(45, 90);
      const team: Team = {
        id: uuid(),
        name: city,
        mascot,
        abbreviation: abbreviate(city),
        conference,
        prestige,
        wins: 0,
        losses: 0,
        offenseRating: 0,
        defenseRating: 0,
        overallRating: 0,
      };
      teams.push(team);
      players.push(...generateRoster(team.id, prestige));
      idx++;
    }
  }

  return { teams, players };
}
