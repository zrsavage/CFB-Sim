import { v4 as uuid } from "uuid";
import type { Player, RecapEntry, Recruit, Team } from "../../../shared/types.js";
import { clamp, gaussian, randInt } from "../util/random.js";
import { ROSTER_COMPOSITION, headroomForTrait, rollDevTrait } from "../generators/players.js";
import { headCoachPitchBonus } from "./coaching.js";

const ROSTER_CAP = Object.values(ROSTER_COMPOSITION).reduce((a, b) => a + b, 0);

// A strong NIL Collective and a respected head coach both help sell a
// program to recruits — applies to every team, so investing in facilities
// and coaching is a real recruiting edge, not just a user-only bonus.
function pitchBonus(team: Team): number {
  return 6 + team.facilities.nil * 3 + headCoachPitchBonus(team.staff.headCoach.rating);
}

// A signed recruit becomes the actual player on the roster — same name,
// hometown, high school, personality, and scouting attributes the user saw
// on the recruiting board — rather than a freshly-rolled stranger.
function playerFromRecruit(recruit: Recruit, teamId: string): Player {
  const devTrait = rollDevTrait();
  const overall = recruit.rating;
  const headroom = headroomForTrait(devTrait); // freshmen have full development runway
  const potential = clamp(overall + headroom, overall, 99);

  return {
    id: uuid(),
    teamId,
    firstName: recruit.firstName,
    lastName: recruit.lastName,
    position: recruit.position,
    year: "FR",
    overall,
    potential,
    devTrait,
    age: 18 + randInt(0, 1),
    hometown: recruit.hometown,
    highSchool: recruit.highSchool,
    trait: recruit.trait,
    blurb: recruit.blurb,
    attributes: recruit.attributes,
  };
}

export function resolveSigningDay(
  teams: Team[],
  players: Player[],
  recruits: Recruit[],
  userTeamId: string
): { players: Player[]; recruits: Recruit[]; recap: RecapEntry[] } {
  const openSpots = new Map<string, number>();
  for (const team of teams) {
    const rosterSize = players.filter((p) => p.teamId === team.id).length;
    openSpots.set(team.id, Math.max(0, ROSTER_CAP - rosterSize));
  }

  const newPlayers: Player[] = [];
  const recap: RecapEntry[] = [];

  // Higher-rated recruits sign first, mirroring blue-chip prospects committing early.
  const ordered = [...recruits].sort((a, b) => b.rating - a.rating);

  const resolvedRecruits: Recruit[] = [];
  for (const recruit of ordered) {
    const candidates = teams.filter((t) => {
      const spots = openSpots.get(t.id) ?? 0;
      if (spots <= 0) return false;
      if (t.id === userTeamId) return recruit.offeredByUser;
      return true;
    });

    if (candidates.length === 0) {
      resolvedRecruits.push(recruit);
      continue;
    }

    let bestTeam: Team | null = null;
    let bestScore = -Infinity;
    for (const team of candidates) {
      const score = team.prestige * 0.7 + pitchBonus(team) + gaussian(0, 15);
      if (score > bestScore) {
        bestScore = score;
        bestTeam = team;
      }
    }

    if (!bestTeam) {
      resolvedRecruits.push(recruit);
      continue;
    }

    openSpots.set(bestTeam.id, (openSpots.get(bestTeam.id) ?? 1) - 1);
    const signedPlayer = playerFromRecruit(recruit, bestTeam.id);
    newPlayers.push(signedPlayer);
    resolvedRecruits.push({ ...recruit, signedTeamId: bestTeam.id });

    if (bestTeam.id === userTeamId) {
      recap.push({
        message: `Signed ${recruit.firstName} ${recruit.lastName} (${recruit.stars}-star ${recruit.position}) out of ${recruit.hometown}.`,
      });
    }
  }

  if (recap.length === 0) {
    recap.push({ message: "No recruits signed with your program this cycle." });
  }

  return { players: [...players, ...newPlayers], recruits: resolvedRecruits, recap };
}

export const _rosterCap = ROSTER_CAP;
