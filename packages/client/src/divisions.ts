import type { Division } from "../../shared/types";

export const DIVISION_ORDER: Division[] = ["power", "group5", "independent"];

export const DIVISION_LABELS: Record<Division, string> = {
  power: "Power Conferences",
  group5: "Group of Five",
  independent: "Independents",
};
