import type { Position } from "../../../shared/types.js";
import { CITIES, randomFrom } from "./names.js";

const STATES = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "FL", "GA", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NJ", "NM", "NY", "NC", "OH", "OK", "OR", "PA", "SC", "TN", "TX", "UT",
  "VA", "WA", "WV", "WI",
] as const;

const HS_PREFIXES = [
  "North", "South", "East", "West", "Central", "Cedar Ridge", "Riverbend",
  "Lincoln", "Jefferson", "Franklin", "Liberty", "Faith", "Founders",
  "Heritage", "Westbrook", "Eastview", "Highland", "Union", "Trinity",
  "Grace", "Summit", "Oakmont", "Mill Creek", "Westside",
] as const;

const HS_SUFFIXES = [
  "High School", "Academy", "Prep", "Christian Academy", "Catholic High",
] as const;

export const PERSONALITY_TRAITS = [
  "Vocal Leader", "Hot-Head", "Coachable", "Film Junkie", "Workout Warrior",
  "Loose Cannon", "Quiet Professional", "Fan Favorite", "Program Guy",
  "Ball Hawk", "Grinder", "Showboat", "High Motor", "Cool Under Pressure",
  "Head Case",
] as const;

interface QualityTier {
  min: number;
  adjectives: string[];
}

const QUALITY_TIERS: QualityTier[] = [
  { min: 90, adjectives: ["blue-chip", "can't-miss", "five-star caliber", "elite"] },
  { min: 78, adjectives: ["high-floor", "polished", "battle-tested", "reliable"] },
  { min: 65, adjectives: ["steady", "dependable", "well-rounded", "solid"] },
  { min: 50, adjectives: ["high-upside", "raw but explosive", "developmental", "boom-or-bust"] },
  { min: 0, adjectives: ["longshot", "late-blooming", "under-the-radar", "gritty"] },
];

const POSITION_FLAVOR: Record<Position, string[]> = {
  QB: [
    "with a big arm and improving decision-making",
    "who reads defenses well beyond his experience",
    "with the mobility to extend plays",
  ],
  RB: [
    "with home-run speed between the tackles",
    "who breaks tackles for extra yards",
    "with soft hands out of the backfield",
  ],
  WR: [
    "who wins with route-running polish",
    "with the vertical speed to take the top off a defense",
    "who plays bigger than his size",
  ],
  TE: [
    "who's a mismatch in the passing game",
    "with the frame to handle in-line blocking too",
  ],
  OL: [
    "who anchors well in pass protection",
    "with the footwork to handle speed rushers",
  ],
  DL: [
    "who gets off the ball in a hurry",
    "with the power to collapse the pocket",
  ],
  LB: [
    "who reads plays a step ahead",
    "with sideline-to-sideline range",
  ],
  CB: [
    "with the recovery speed to erase mistakes",
    "who competes hard at the catch point",
  ],
  S: [
    "with the range to cover the deep middle",
    "who thrives as a tackler in the box",
  ],
  K: ["with a strong, consistent leg"],
  P: ["with excellent hang time and directional touch"],
};

export interface PlayerBackground {
  hometown: string;
  highSchool: string;
  trait: string;
  blurb: string;
}

export function generateBackground(position: Position, qualityScore: number): PlayerBackground {
  const hometown = `${randomFrom(CITIES)}, ${randomFrom(STATES)}`;
  const highSchool = `${randomFrom(HS_PREFIXES)} ${randomFrom(HS_SUFFIXES)}`;
  const trait = randomFrom(PERSONALITY_TRAITS);
  const tier =
    QUALITY_TIERS.find((t) => qualityScore >= t.min) ?? QUALITY_TIERS[QUALITY_TIERS.length - 1];
  const adjective = randomFrom(tier.adjectives);
  const flavor = randomFrom(POSITION_FLAVOR[position]);
  const blurb = `A ${adjective} prospect out of ${hometown} (${highSchool}), ${flavor} — teammates call him a ${trait.toLowerCase()}.`;

  return { hometown, highSchool, trait, blurb };
}
