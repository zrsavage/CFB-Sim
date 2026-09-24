import type { Player, PlayerYear, RecapEntry, Team } from "../../../shared/types.js";
import { clamp, randInt } from "../util/random.js";

const NEXT_YEAR: Record<PlayerYear, PlayerYear | null> = {
  FR: "SO",
  SO: "JR",
  JR: "SR",
  SR: null, // graduates
};

const GROWTH_RANGE: Record<Player["devTrait"], [number, number]> = {
  Slow: [-1, 2],
  Normal: [0, 4],
  Fast: [2, 6],
  Star: [4, 9],
};

const YEAR_GROWTH_FACTOR: Record<PlayerYear, number> = {
  FR: 1.1,
  SO: 1.0,
  JR: 0.8,
  SR: 0.4,
};

const TRANSFER_CHANCE = 0.04;

function growPlayer(player: Player): Player {
  const [min, max] = GROWTH_RANGE[player.devTrait];
  const rawGrowth = randInt(min, max) * YEAR_GROWTH_FACTOR[player.year];
  const headroom = player.potential - player.overall;
  const growth = clamp(Math.round(rawGrowth), -2, Math.max(0, headroom));
  const overall = clamp(player.overall + growth, 35, 99);
  const delta = overall - player.overall;
  // Shift each attribute by the same delta so a player's stat profile keeps
  // pace with their overall instead of going stale from their freshman year.
  const attributes = player.attributes.map((a) => ({
    ...a,
    value: clamp(a.value + delta, 30, 99),
  }));
  return { ...player, overall, attributes };
}

export function applyOffseasonProgression(
  players: Player[],
  teams: Team[],
  userTeamId: string
): { players: Player[]; recap: RecapEntry[] } {
  const teamNameById = new Map(teams.map((t) => [t.id, `${t.name} ${t.mascot}`]));
  const recap: RecapEntry[] = [];
  const result: Player[] = [];

  for (const player of players) {
    const isUserPlayer = player.teamId === userTeamId;

    if (player.year === "SR") {
      if (isUserPlayer) {
        recap.push({
          message: `${player.firstName} ${player.lastName} (${player.position}) graduated after a ${player.year} season.`,
        });
      }
      continue; // seniors leave the roster
    }

    if (Math.random() < TRANSFER_CHANCE) {
      if (isUserPlayer) {
        recap.push({
          message: `${player.firstName} ${player.lastName} (${player.position}) entered the transfer portal and left the program.`,
        });
      }
      continue;
    }

    const grown = growPlayer(player);
    const nextYear = NEXT_YEAR[player.year] as PlayerYear;
    const updated: Player = { ...grown, year: nextYear, age: player.age + 1 };

    if (isUserPlayer && updated.overall - player.overall >= 5) {
      recap.push({
        message: `${player.firstName} ${player.lastName} (${player.position}) broke out, jumping to ${updated.overall} OVR.`,
      });
    }

    result.push(updated);
  }

  if (recap.length === 0) {
    const teamName = teamNameById.get(userTeamId) ?? "Your team";
    recap.push({ message: `${teamName} enters the offseason with a quiet roster.` });
  }

  return { players: result, recap };
}
