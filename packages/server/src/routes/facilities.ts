import { Router } from "express";
import type { FacilityKey, FacilityUpgradeResult } from "../../../shared/types.js";
import { upgradeFacility } from "../engine/facilities.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

const VALID_FACILITIES: FacilityKey[] = ["stadium", "training", "academics", "nil"];

router.post("/facilities/upgrade", (req, res) => {
  const { facility } = req.body as { facility?: FacilityKey };
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  if (!facility || !VALID_FACILITIES.includes(facility)) {
    res.status(400).json({ error: "Invalid facility" });
    return;
  }

  const team = state.teams.find((t) => t.id === state.career.userTeamId);
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const { team: updatedTeam, error } = upgradeFacility(team, facility);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  state.teams = state.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
  writeSave(state);

  const result: FacilityUpgradeResult = { team: updatedTeam };
  res.json(result);
});

export default router;
