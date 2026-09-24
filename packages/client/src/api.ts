import type {
  Coach,
  CoachHireResult,
  CoachRole,
  FacilityKey,
  FacilityUpgradeResult,
  Player,
  Recruit,
  SaveState,
  ScheduleGame,
  SigningDayResult,
  Team,
  WeekSimResult,
} from "../../shared/types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  generateLeague: () => request<{ teams: Team[] }>("/career/generate", { method: "POST" }),
  selectTeam: (teamId: string) =>
    request<SaveState>("/career/select-team", {
      method: "POST",
      body: JSON.stringify({ teamId }),
    }),
  getCareer: () => request<SaveState>("/career"),
  resetCareer: () => request<{ ok: true }>("/career/reset", { method: "POST" }),
  getTeams: () => request<Team[]>("/teams"),
  getRoster: (teamId: string) => request<Player[]>(`/teams/${teamId}/roster`),
  getStandings: () => request<Team[]>("/standings"),
  getSchedule: (params?: { week?: number; teamId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.week) qs.set("week", String(params.week));
    if (params?.teamId) qs.set("teamId", params.teamId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<ScheduleGame[]>(`/schedule${suffix}`);
  },
  simWeek: () => request<WeekSimResult>("/sim/week", { method: "POST" }),
  getRecruitingBoard: () =>
    request<{ recruits: Recruit[]; maxOffers: number }>("/recruiting/board"),
  offerRecruit: (recruitId: string) =>
    request<{ recruits: Recruit[] }>("/recruiting/offer", {
      method: "POST",
      body: JSON.stringify({ recruitId }),
    }),
  advanceSigningDay: () => request<SigningDayResult>("/recruiting/advance", { method: "POST" }),
  upgradeFacility: (facility: FacilityKey) =>
    request<FacilityUpgradeResult>("/facilities/upgrade", {
      method: "POST",
      body: JSON.stringify({ facility }),
    }),
  getCoachingPool: () => request<{ pool: Coach[]; programPoints: number }>("/coaching/pool"),
  hireCoach: (role: CoachRole, coachId: string) =>
    request<CoachHireResult>("/coaching/hire", {
      method: "POST",
      body: JSON.stringify({ role, coachId }),
    }),
};
