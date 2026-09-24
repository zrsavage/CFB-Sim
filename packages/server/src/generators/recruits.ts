import { v4 as uuid } from "uuid";
import type { Position, Recruit, RecruitStars } from "../../../shared/types.js";
import { CITIES, FIRST_NAMES, LAST_NAMES, randomFrom } from "../data/names.js";
import { randInt, weightedPick } from "../util/random.js";
import { ROSTER_COMPOSITION } from "./players.js";

const STAR_RATING_RANGE: Record<RecruitStars, [number, number]> = {
  5: [88, 96],
  4: [80, 87],
  3: [72, 79],
  2: [64, 71],
  1: [55, 63],
};

function rollStars(): RecruitStars {
  return weightedPick<RecruitStars>([
    { value: 5, weight: 2 },
    { value: 4, weight: 13 },
    { value: 3, weight: 35 },
    { value: 2, weight: 35 },
    { value: 1, weight: 15 },
  ]);
}

const POSITION_WEIGHTS: { value: Position; weight: number }[] = (
  Object.keys(ROSTER_COMPOSITION) as Position[]
).map((position) => ({ value: position, weight: ROSTER_COMPOSITION[position] }));

export function generateRecruitClass(size = 220): Recruit[] {
  const recruits: Recruit[] = [];
  for (let i = 0; i < size; i++) {
    const stars = rollStars();
    const [min, max] = STAR_RATING_RANGE[stars];
    recruits.push({
      id: uuid(),
      firstName: randomFrom(FIRST_NAMES),
      lastName: randomFrom(LAST_NAMES),
      position: weightedPick(POSITION_WEIGHTS),
      stars,
      rating: randInt(min, max),
      offeredByUser: false,
      signedTeamId: null,
      hometown: randomFrom(CITIES),
    });
  }
  return recruits;
}
