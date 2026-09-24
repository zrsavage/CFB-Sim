import { Router } from "express";
import type { CareerPhase, RecapEntry, WeekSimResult } from "../../../shared/types.js";
import { simulateWeek, applyResultsToRecords } from "../engine/simulate.js";
import { applyOffseasonProgression } from "../engine/progression.js";
import { applyPromotionRelegation } from "../engine/promotion.js";
import { applyCoachingCarousel } from "../engine/coaching.js";
import { applySeasonIncome } from "../engine/facilities.js";
import {
  applyPostseasonPrestige,
  generateBowlGames,
  generateChampionshipGames,
} from "../engine/postseason.js";
import { recomputeAllRatings } from "../engine/ratings.js";
import { generateRecruitClass } from "../generators/recruits.js";
import { generateCoachingPool } from "../generators/coaches.js";
import { loadSave, writeSave } from "../store.js";

const router = Router();

const CHAMPIONSHIP_PRESTIGE_BOOST = 2;
const BOWL_PRESTIGE_BOOST = 1;

router.post("/sim/week", (_req, res) => {
  const state = loadSave();
  if (!state || !state.career.started) {
    res.status(400).json({ error: "No active career" });
    return;
  }
  if (state.career.phase === "recruiting") {
    res.status(400).json({ error: "Not in season or postseason phase" });
    return;
  }

  const currentPhase = state.career.phase;
  const weekGames = state.schedule.filter((g) => g.week === state.career.week);
  const teamsById = new Map(state.teams.map((t) => [t.id, t]));
  const simulated = simulateWeek(weekGames, teamsById);

  state.schedule = state.schedule.map((g) => {
    const updated = simulated.find((s) => s.id === g.id);
    return updated ?? g;
  });
  state.teams = applyResultsToRecords(state.teams, simulated);

  let phaseAfter: CareerPhase = state.career.phase;

  if (currentPhase === "season" && state.career.week >= state.career.totalWeeks) {
    // Regular season just wrapped — set up conference championship week.
    const champGames = generateChampionshipGames(
      state.teams,
      state.schedule,
      state.career.week + 1,
      state.career.season
    );
    state.schedule.push(...champGames);
    state.career.week += 1;
    state.career.phase = "championship";
    phaseAfter = "championship";
  } else if (currentPhase === "championship") {
    const { teams: withPrestige, recap: champRecap } = applyPostseasonPrestige(
      simulated,
      state.teams,
      state.career.userTeamId,
      CHAMPIONSHIP_PRESTIGE_BOOST
    );
    state.teams = withPrestige;
    state.lastOffseasonRecap = champRecap;

    const bowlGames = generateBowlGames(state.teams, state.career.week + 1, state.career.season);
    state.schedule.push(...bowlGames);
    state.career.week += 1;
    state.career.phase = "bowls";
    phaseAfter = "bowls";
  } else if (currentPhase === "bowls") {
    const { teams: withPrestige, recap: bowlRecap } = applyPostseasonPrestige(
      simulated,
      state.teams,
      state.career.userTeamId,
      BOWL_PRESTIGE_BOOST
    );
    state.teams = withPrestige;

    const { teams: realignedTeams, recap: promotionRecap } = applyPromotionRelegation(
      state.teams
    );
    state.teams = realignedTeams;

    const draftPicksBefore = new Map(state.teams.map((t) => [t.id, t.draftPicks]));

    const {
      players,
      teams: progressedTeams,
      recap: progressionRecap,
    } = applyOffseasonProgression(state.players, state.teams, state.career.userTeamId);
    state.players = players;

    const draftPicksThisSeason = new Map(
      progressedTeams.map((t) => [t.id, t.draftPicks - (draftPicksBefore.get(t.id) ?? 0)])
    );
    const funded = applySeasonIncome(progressedTeams, draftPicksThisSeason);

    // Reset records for the new season now (not later, in recruiting/advance)
    // so a team's conference/division — already realigned above — is never
    // shown paired with the record it earned in its old conference.
    const freshRecords = funded.map((t) => ({ ...t, wins: 0, losses: 0 }));

    const { teams: staffedTeams, recap: coachingRecap } = applyCoachingCarousel(
      freshRecords,
      state.career.userTeamId
    );

    state.teams = recomputeAllRatings(staffedTeams, state.players);
    state.recruits = generateRecruitClass();
    state.coachingPool = generateCoachingPool();

    const allRecap: RecapEntry[] = [
      ...state.lastOffseasonRecap,
      ...bowlRecap,
      ...promotionRecap,
      ...progressionRecap,
      ...coachingRecap,
    ];
    state.lastOffseasonRecap = allRecap;
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
