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

export type FacilityKey = "stadium" | "training" | "academics" | "nil";

export interface Facilities {
  stadium: number; // 1-5, drives season Program Points income
  training: number; // 1-5, drives player development speed
  academics: number; // 1-5, reduces transfer attrition
  nil: number; // 1-5, drives recruiting pitch strength
}

export type CoachRole = "headCoach" | "offensiveCoordinator" | "defensiveCoordinator";

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  rating: number; // 35-99
  trait: string;
  yearsAtSchool: number;
}

export interface CoachingStaff {
  headCoach: Coach;
  offensiveCoordinator: Coach;
  defensiveCoordinator: Coach;
}

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
  facilities: Facilities;
  programPoints: number;
  staff: CoachingStaff;
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
  label?: string; // e.g. "Magnolia Conference Championship" or a bowl name
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

export type CareerPhase = "season" | "championship" | "bowls" | "recruiting";

export interface CareerState {
  started: boolean;
  userTeamId: string;
  season: number; // e.g. Year 1, Year 2 ...
  week: number;
  totalWeeks: number; // length of the regular season only
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
  coachingPool: Coach[];
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

export interface FacilityUpgradeResult {
  team: Team;
}

export interface CoachHireResult {
  team: Team;
  coachingPool: Coach[];
}
