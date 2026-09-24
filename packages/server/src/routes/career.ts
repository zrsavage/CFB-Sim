import { Router } from "express";
import type { SaveState } from "../../../shared/types.js";
import { generateLeague } from "../generators/league.js";
import { generateSchedule, scheduleTotalWeeks } from "../generators/schedule.js";
import { recomputeAllRatings } from "../engine/ratings.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

const MAX_OFFERS = 25;

router.post("/career/generate", (_req, res) => {
  const { teams, players } = generateLeague();
  const ratedTeams = recomputeAllRatings(teams, players);

  const state: SaveState = {
    career: {
      started: false,
      userTeamId: "",
      season: 1,
      week: 1,
      totalWeeks: 1, // set once the schedule is generated in /career/select-team
      phase: "season",
      maxOffers: MAX_OFFERS,
    },
    teams: ratedTeams,
    players,
    schedule: [],
    recruits: [],
    lastOffseasonRecap: [],
  };

  writeSave(state);
  res.json({ teams: ratedTeams });
});

router.post("/career/select-team", (req, res) => {
  const { teamId } = req.body as { teamId?: string };
  const state = loadSave();
  if (!state) {
    res.status(400).json({ error: "No league generated yet. Call /career/generate first." });
    return;
  }
  if (!teamId || !state.teams.find((t) => t.id === teamId)) {
    res.status(400).json({ error: "Invalid teamId" });
    return;
  }

  state.career.userTeamId = teamId;
  state.career.started = true;
  state.career.season = 1;
  state.career.week = 1;
  state.career.phase = "season";
  state.schedule = generateSchedule(state.teams, state.career.season);
  state.career.totalWeeks = scheduleTotalWeeks(state.schedule);

  writeSave(state);
  res.json(state);
});

router.get("/career", (_req, res) => {
  const state = loadSave();
  if (!state) {
    res.status(404).json({ error: "No save found" });
    return;
  }
  res.json(state);
});

export default router;
