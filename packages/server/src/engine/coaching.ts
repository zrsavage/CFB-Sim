import type { RecapEntry, Team } from "../../../shared/types.js";
import { clamp } from "../util/random.js";
import { generateCoach } from "../generators/coaches.js";

// Applied on top of the roster-driven offense/defense ratings — a strong
// coordinator meaningfully outcoaches a weak one, a bad one drags it down.
export function coordinatorRatingBonus(coordinatorRating: number): number {
  return (coordinatorRating - 70) * 0.15;
}

// Head coach reputation adds to how compelling your recruiting pitch is,
// stacking with the NIL Collective facility.
export function headCoachPitchBonus(headCoachRating: number): number {
  return (headCoachRating - 70) * 0.1;
}

const POACH_BASE_CHANCE = 0.05;

function poachChance(rating: number): number {
  return clamp(POACH_BASE_CHANCE + (rating - 70) * 0.004, 0, 0.35);
}

// Each offseason, a hot-shot coordinator might get poached by a "bigger job"
// elsewhere. They're replaced by an interim promotion so the staff is never
// left with a genuine hole, and it's surfaced in the recap for the user.
export function applyCoachingCarousel(
  teams: Team[],
  userTeamId: string
): { teams: Team[]; recap: RecapEntry[] } {
  const recap: RecapEntry[] = [];

  const updatedTeams = teams.map((team) => {
    let staff = team.staff;

    (["offensiveCoordinator", "defensiveCoordinator"] as const).forEach((role) => {
      const coach = staff[role];
      if (Math.random() < poachChance(coach.rating)) {
        const replacement = generateCoach(clamp(coach.rating - 12, 35, 90), 8);
        if (team.id === userTeamId) {
          const roleLabel = role === "offensiveCoordinator" ? "offensive coordinator" : "defensive coordinator";
          recap.push({
            message: `${coach.firstName} ${coach.lastName} left to become a ${roleLabel} elsewhere. ${replacement.firstName} ${replacement.lastName} was promoted on an interim basis.`,
          });
        }
        staff = { ...staff, [role]: replacement };
      } else {
        staff = { ...staff, [role]: { ...coach, yearsAtSchool: coach.yearsAtSchool + 1 } };
      }
    });

    staff = {
      ...staff,
      headCoach: { ...staff.headCoach, yearsAtSchool: staff.headCoach.yearsAtSchool + 1 },
    };

    return { ...team, staff };
  });

  return { teams: updatedTeams, recap };
}
