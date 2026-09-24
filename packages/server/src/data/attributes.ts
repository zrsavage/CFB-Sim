import type { PlayerAttribute, Position } from "../../../shared/types.js";
import { clamp, gaussian } from "../util/random.js";

export const ATTRIBUTES_BY_POSITION: Record<Position, string[]> = {
  QB: ["Arm Strength", "Accuracy", "Awareness", "Speed", "Poise"],
  RB: ["Speed", "Agility", "Power", "Vision", "Ball Security"],
  WR: ["Speed", "Hands", "Route Running", "Agility", "Release"],
  TE: ["Hands", "Blocking", "Route Running", "Strength", "Speed"],
  OL: ["Run Blocking", "Pass Blocking", "Strength", "Awareness", "Agility"],
  DL: ["Pass Rush", "Run Defense", "Strength", "Speed", "Awareness"],
  LB: ["Tackling", "Coverage", "Speed", "Awareness", "Strength"],
  CB: ["Coverage", "Speed", "Agility", "Awareness", "Press"],
  S: ["Coverage", "Tackling", "Speed", "Awareness", "Range"],
  K: ["Kick Power", "Kick Accuracy", "Consistency", "Awareness", "Clutch"],
  P: ["Punt Power", "Punt Accuracy", "Hang Time", "Consistency", "Awareness"],
};

// Individual attributes are generated as noise around the player's overall,
// so each player has a distinct profile of strengths/weaknesses without
// changing how team-level offense/defense ratings (which use `overall`)
// are computed.
export function generateAttributes(position: Position, overall: number): PlayerAttribute[] {
  return ATTRIBUTES_BY_POSITION[position].map((label) => ({
    label,
    value: Math.round(clamp(gaussian(overall, 6), 30, 99)),
  }));
}
