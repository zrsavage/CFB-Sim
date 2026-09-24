import { Router } from "express";
import type { CoachHireResult, CoachRole } from "../../../shared/types.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

const VALID_ROLES: CoachRole[] = ["headCoach", "offensiveCoordinator", "defensiveCoordinator"];

// Exported so the client can preview the cost before hiring; kept as a pure
// function of rating so both sides always agree on the number.
export function hireCost(rating: number): number {
  return Math.max(10, Math.round((rating - 35) * 3));
}

router.get("/coaching/pool", (_req, res) => {
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  const programPoints = state.teams.find((t) => t.id === state.career.userTeamId)?.programPoints ?? 0;
  res.json({ pool: state.coachingPool, programPoints });
});

router.post("/coaching/hire", (req, res) => {
  const { role, coachId } = req.body as { role?: CoachRole; coachId?: string };
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  if (!role || !VALID_ROLES.includes(role)) {
    res.status(400).json({ error: "Invalid coaching role" });
    return;
  }

  const candidate = state.coachingPool.find((c) => c.id === coachId);
  if (!candidate) {
    res.status(404).json({ error: "Coach not found in the pool" });
    return;
  }

  const team = state.teams.find((t) => t.id === state.career.userTeamId);
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const cost = hireCost(candidate.rating);
  if (team.programPoints < cost) {
    res.status(400).json({ error: `Not enough Program Points (need ${cost}, have ${team.programPoints})` });
    return;
  }

  const hired = { ...candidate, yearsAtSchool: 0 };
  const updatedTeam = {
    ...team,
    programPoints: team.programPoints - cost,
    staff: { ...team.staff, [role]: hired },
  };

  state.teams = state.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
  state.coachingPool = state.coachingPool.filter((c) => c.id !== coachId);

  writeSave(state);

  const result: CoachHireResult = { team: updatedTeam, coachingPool: state.coachingPool };
  res.json(result);
});

export default router;
