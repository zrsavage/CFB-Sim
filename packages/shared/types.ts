// Shared types used by both the server (source of truth) and the client (display).

export type Position =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "OL"
  | "DL"
  | "LB"
  | "CB"
  | "S"
  | "K"
  | "P";

export type PlayerYear = "FR" | "SO" | "JR" | "SR";

export type DevTrait = "Slow" | "Normal" | "Fast" | "Star";

export interface PlayerAttribute {
  label: string;
  value: number;
}

export interface Player {
  id: string;
  teamId: string | null;
  firstName: string;
  lastName: string;
  position: Position;
  year: PlayerYear;
  overall: number; // 40-99
  potential: number; // >= overall, cap 99
  devTrait: DevTrait;
  age: number;
  hometown: string;
  highSchool: string;
  trait: string;
  blurb: string;
  attributes: PlayerAttribute[];
}

export type Division = "power" | "group5" | "independent";

export interface Team {
  id: string;
  name: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  division: Division;
  prestige: number; // 40-99
  draftPicks: number; // cumulative all-time NFL Draft picks produced
  wins: number;
  losses: number;
  offenseRating: number;
  defenseRating: number;
  overallRating: number;
}

export interface ScheduleGame {
  id: string;
  week: number;
  season: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeScore: number | null;
  awayScore: number | null;
}

export type RecruitStars = 1 | 2 | 3 | 4 | 5;

export interface Recruit {
  id: string;
  firstName: string;
  lastName: string;
  position: Position;
  stars: RecruitStars;
  rating: number; // projected overall
  offeredByUser: boolean;
  signedTeamId: string | null;
  hometown: string;
  highSchool: string;
  trait: string;
  blurb: string;
  attributes: PlayerAttribute[];
}

export type CareerPhase = "season" | "recruiting";

export interface CareerState {
  started: boolean;
  userTeamId: string;
  season: number; // e.g. Year 1, Year 2 ...
  week: number;
  totalWeeks: number;
  phase: CareerPhase;
  maxOffers: number;
}

export interface RecapEntry {
  message: string;
}

export interface SaveState {
  career: CareerState;
  teams: Team[];
  players: Player[];
  schedule: ScheduleGame[];
  recruits: Recruit[];
  lastOffseasonRecap: RecapEntry[];
}

export interface WeekSimResult {
  week: number;
  games: ScheduleGame[];
  phaseAfter: CareerPhase;
}

export interface SigningDayResult {
  signings: { recruitId: string; teamId: string }[];
  recap: RecapEntry[];
  nextSeason: number;
}
