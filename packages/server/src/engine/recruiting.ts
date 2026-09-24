import type { Player, RecapEntry, Recruit, Team } from "../../../shared/types.js";
import { gaussian } from "../util/random.js";
import { generatePlayer, ROSTER_COMPOSITION } from "../generators/players.js";

const ROSTER_CAP = Object.values(ROSTER_COMPOSITION).reduce((a, b) => a + b, 0);
const USER_PITCH_BONUS = 14;

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
      let score = team.prestige * 0.7 + gaussian(0, 15);
      if (team.id === userTeamId) score += USER_PITCH_BONUS;
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
    const signedPlayer = generatePlayer(recruit.position, bestTeam.prestige, "FR", bestTeam.id);
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
