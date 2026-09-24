import { Router } from "express";
import type { CareerPhase, WeekSimResult } from "../../../shared/types.js";
import { simulateWeek, applyResultsToRecords } from "../engine/simulate.js";
import { applyOffseasonProgression } from "../engine/progression.js";
import { recomputeAllRatings } from "../engine/ratings.js";
import { generateRecruitClass } from "../generators/recruits.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

router.post("/sim/week", (_req, res) => {
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  if (state.career.phase !== "season") {
    res.status(400).json({ error: "Not in season phase" });
    return;
  }

  const weekGames = state.schedule.filter((g) => g.week === state.career.week);
  const teamsById = new Map(state.teams.map((t) => [t.id, t]));
  const simulated = simulateWeek(weekGames, teamsById);

  state.schedule = state.schedule.map((g) => {
    const updated = simulated.find((s) => s.id === g.id);
    return updated ?? g;
  });
  state.teams = applyResultsToRecords(state.teams, simulated);

  const isLastWeek = state.career.week >= state.career.totalWeeks;
  let phaseAfter: CareerPhase = state.career.phase;

  if (isLastWeek) {
    const { players, recap } = applyOffseasonProgression(
      state.players,
      state.teams,
      state.career.userTeamId
    );
    state.players = players;
    state.teams = recomputeAllRatings(state.teams, state.players);
    state.recruits = generateRecruitClass();
    state.lastOffseasonRecap = recap;
    state.career.phase = "recruiting";
    phaseAfter = "recruiting";
  } else {
    state.career.week += 1;
  }

  writeSave(state);

  const result: WeekSimResult = { week: weekGames[0]?.week ?? state.career.week, games: simulated, phaseAfter };
  res.json(result);
});

export default router;
