import { Router } from "express";
import type { SigningDayResult } from "../../../shared/types.js";
import { resolveSigningDay } from "../engine/recruiting.js";
import { recomputeAllRatings } from "../engine/ratings.js";
import { generateSchedule, scheduleTotalWeeks } from "../generators/schedule.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

router.get("/recruiting/board", (_req, res) => {
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  if (state.career.phase !== "recruiting") {
    res.status(400).json({ error: "Not in recruiting phase" });
    return;
  }
  res.json({ recruits: state.recruits, maxOffers: state.career.maxOffers });
});

router.post("/recruiting/offer", (req, res) => {
  const { recruitId } = req.body as { recruitId?: string };
  const state = loadSave();
  if (!state || state.career.phase !== "recruiting") {
    res.status(400).json({ error: "Not in recruiting phase" });
    return;
  }
  const recruit = state.recruits.find((r) => r.id === recruitId);
  if (!recruit) {
    res.status(404).json({ error: "Recruit not found" });
    return;
  }

  if (!recruit.offeredByUser) {
    const currentOffers = state.recruits.filter((r) => r.offeredByUser).length;
    if (currentOffers >= state.career.maxOffers) {
      res.status(400).json({ error: `Max ${state.career.maxOffers} offers reached` });
      return;
    }
  }

  recruit.offeredByUser = !recruit.offeredByUser;
  writeSave(state);
  res.json({ recruits: state.recruits });
});

router.post("/recruiting/advance", (_req, res) => {
  const state = loadSave();
  if (!state || state.career.phase !== "recruiting") {
    res.status(400).json({ error: "Not in recruiting phase" });
    return;
  }

  const { players, recruits, recap } = resolveSigningDay(
    state.teams,
    state.players,
    state.recruits,
    state.career.userTeamId
  );

  state.players = players;
  state.recruits = recruits;
  state.teams = recomputeAllRatings(state.teams, state.players);
  state.lastOffseasonRecap = [...state.lastOffseasonRecap, ...recap];

  state.career.season += 1;
  state.career.week = 1;
  state.career.phase = "season";
  // Records were already reset to 0-0 right after promotion/relegation
  // (see routes/sim.ts), so a team's new conference is never shown paired
  // with a record it earned in its old one.
  state.schedule = generateSchedule(state.teams, state.career.season);
  state.career.totalWeeks = scheduleTotalWeeks(state.schedule);

  writeSave(state);

  const result: SigningDayResult = {
    signings: state.recruits
      .filter((r) => r.signedTeamId === state.career.userTeamId)
      .map((r) => ({ recruitId: r.id, teamId: r.signedTeamId as string })),
    recap: state.lastOffseasonRecap,
    nextSeason: state.career.season,
  };
  res.json(result);
});

export default router;
