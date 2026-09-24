import { v4 as uuid } from "uuid";
import type { Position, Recruit, RecruitStars } from "../../../shared/types.js";
import { FIRST_NAMES, LAST_NAMES, randomFrom } from "../data/names.js";
import { generateBackground } from "../data/background.js";
import { generateAttributes } from "../data/attributes.js";
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

export function generateRecruitClass(size = 2400): Recruit[] {
  const recruits: Recruit[] = [];
  for (let i = 0; i < size; i++) {
    const stars = rollStars();
    const [min, max] = STAR_RATING_RANGE[stars];
    const position = weightedPick(POSITION_WEIGHTS);
    const rating = randInt(min, max);
    const background = generateBackground(position, rating);

    recruits.push({
      id: uuid(),
      firstName: randomFrom(FIRST_NAMES),
      lastName: randomFrom(LAST_NAMES),
      position,
      stars,
      rating,
      offeredByUser: false,
      signedTeamId: null,
      ...background,
      attributes: generateAttributes(position, rating),
    });
  }
  return recruits;
}
