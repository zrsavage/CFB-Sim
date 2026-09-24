import { Router } from "express";
import { loadSave } from "../store.js";

const router = Router();

router.get("/teams", (_req, res) => {
  const state = loadSave();
  if (!state) {
    res.status(404).json({ error: "No save found" });
    return;
  }
  res.json(state.teams);
});

router.get("/teams/:id/roster", (req, res) => {
  const state = loadSave();
  if (!state) {
    res.status(404).json({ error: "No save found" });
    return;
  }
  const roster = state.players
    .filter((p) => p.teamId === req.params.id)
    .sort((a, b) => a.position.localeCompare(b.position) || b.overall - a.overall);
  res.json(roster);
});

router.get("/standings", (_req, res) => {
  const state = loadSave();
  if (!state) {
    res.status(404).json({ error: "No save found" });
    return;
  }
  const sorted = [...state.teams].sort((a, b) => {
    const aPct = a.wins / Math.max(1, a.wins + a.losses);
    const bPct = b.wins / Math.max(1, b.wins + b.losses);
    return bPct - aPct || b.wins - a.wins;
  });
  res.json(sorted);
});

router.get("/schedule", (req, res) => {
  const state = loadSave();
  if (!state) {
    res.status(404).json({ error: "No save found" });
    return;
  }
  const weekParam = req.query.week;
  const teamParam = req.query.teamId as string | undefined;
  let games = state.schedule;
  if (weekParam) {
    const week = Number(weekParam);
    games = games.filter((g) => g.week === week);
  }
  if (teamParam) {
    games = games.filter((g) => g.homeTeamId === teamParam || g.awayTeamId === teamParam);
  }
  res.json(games);
});

export default router;
