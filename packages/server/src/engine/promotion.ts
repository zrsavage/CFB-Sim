import type { RecapEntry, Team } from "../../../shared/types.js";
import { clamp } from "../util/random.js";

const SWAP_COUNT = 2;
const PRESTIGE_SHIFT = 4;

function winPct(team: Team): number {
  const total = team.wins + team.losses;
  return total === 0 ? 0 : team.wins / total;
}

// End-of-season conference realignment: the worst power-division teams by
// record swap places with the best group5-division teams, mirroring real
// conference realignment. Both teams keep their roster and identity, just
// their conference/division (and a small prestige nudge) change.
export function applyPromotionRelegation(teams: Team[]): { teams: Team[]; recap: RecapEntry[] } {
  const power = teams.filter((t) => t.division === "power").sort((a, b) => winPct(a) - winPct(b));
  const group5 = teams
    .filter((t) => t.division === "group5")
    .sort((a, b) => winPct(b) - winPct(a));

  const swaps = Math.min(SWAP_COUNT, power.length, group5.length);
  const recap: RecapEntry[] = [];
  const updates = new Map<string, Partial<Team>>();

  for (let i = 0; i < swaps; i++) {
    const relegated = power[i];
    const promoted = group5[i];
    if (!relegated || !promoted) continue;

    updates.set(relegated.id, {
      conference: promoted.conference,
      division: promoted.division,
      prestige: clamp(relegated.prestige - PRESTIGE_SHIFT, 30, 99),
    });
    updates.set(promoted.id, {
      conference: relegated.conference,
      division: relegated.division,
      prestige: clamp(promoted.prestige + PRESTIGE_SHIFT, 30, 99),
    });

    recap.push({
      message: `${promoted.name} ${promoted.mascot} have been promoted to the ${relegated.conference}!`,
    });
    recap.push({
      message: `${relegated.name} ${relegated.mascot} have been relegated to the ${promoted.conference}.`,
    });
  }

  const updatedTeams = teams.map((t) => (updates.has(t.id) ? { ...t, ...updates.get(t.id) } : t));
  return { teams: updatedTeams, recap };
}
