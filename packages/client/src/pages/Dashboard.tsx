import { useState } from "react";
import type { SaveState, WeekSimResult } from "../../../shared/types";
import { api } from "../api";

export default function Dashboard({
  career,
  onChanged,
  onError,
}: {
  career: SaveState;
  onChanged: () => void;
  onError: (msg: string | null) => void;
}) {
  const [simming, setSimming] = useState(false);
  const [lastResult, setLastResult] = useState<WeekSimResult | null>(null);

  const userTeam = career.teams.find((t) => t.id === career.career.userTeamId)!;
  const sorted = [...career.teams].sort((a, b) => {
    const aPct = a.wins / Math.max(1, a.wins + a.losses);
    const bPct = b.wins / Math.max(1, b.wins + b.losses);
    return bPct - aPct || b.wins - a.wins;
  });
  const rank = sorted.findIndex((t) => t.id === userTeam.id) + 1;

  async function simulateWeek() {
    setSimming(true);
    onError(null);
    try {
      const result = await api.simWeek();
      setLastResult(result);
      onChanged();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setSimming(false);
    }
  }

  const teamsById = new Map(career.teams.map((t) => [t.id, t]));
  const userGameThisWeek = lastResult?.games.find(
    (g) => g.homeTeamId === userTeam.id || g.awayTeamId === userTeam.id
  );

  return (
    <div>
      <div className="panel">
        <h2>Program Overview</h2>
        <p style={{ marginTop: 0 }}>
          {userTeam.name} {userTeam.mascot} · {userTeam.conference} · Rank #{rank} of {career.teams.length}
        </p>
        <p>
          Record: <strong>{userTeam.wins}-{userTeam.losses}</strong> · Prestige{" "}
          <span className="rating-pill">{userTeam.prestige}</span> · OVR{" "}
          <span className="rating-pill">{userTeam.overallRating}</span> · OFF{" "}
          <span className="rating-pill">{userTeam.offenseRating}</span> · DEF{" "}
          <span className="rating-pill">{userTeam.defenseRating}</span>
        </p>

        {career.career.phase === "season" ? (
          <button className="primary" onClick={simulateWeek} disabled={simming}>
            {simming ? "Simulating..." : `Simulate Week ${career.career.week}`}
          </button>
        ) : (
          <p>
            Regular season complete. Head to the <strong>Recruiting</strong> tab to build next
            year's roster before the new season kicks off.
          </p>
        )}
      </div>

      {userGameThisWeek && (
        <div className="panel">
          <h2>Week {lastResult!.week} Result</h2>
          {(() => {
            const home = teamsById.get(userGameThisWeek.homeTeamId)!;
            const away = teamsById.get(userGameThisWeek.awayTeamId)!;
            const userIsHome = home.id === userTeam.id;
            const won = userIsHome
              ? (userGameThisWeek.homeScore ?? 0) > (userGameThisWeek.awayScore ?? 0)
              : (userGameThisWeek.awayScore ?? 0) > (userGameThisWeek.homeScore ?? 0);
            return (
              <p style={{ fontSize: 18 }}>
                {won ? <span className="win">WIN</span> : <span className="lose">LOSS</span>}{" "}
                — {home.name} {home.mascot} {userGameThisWeek.homeScore} @ {away.name}{" "}
                {away.mascot} {userGameThisWeek.awayScore}
              </p>
            );
          })()}
        </div>
      )}

      {career.lastOffseasonRecap.length > 0 && (
        <div className="panel">
          <h2>Offseason Recap</h2>
          <ul className="recap-list">
            {career.lastOffseasonRecap.map((r, i) => (
              <li key={i}>{r.message}</li>
            ))}
          </ul>
        </div>
      )}

      {lastResult && (
        <div className="panel">
          <h2>Week {lastResult.week} Around the League</h2>
          {lastResult.games.map((g) => {
            const home = teamsById.get(g.homeTeamId);
            const away = teamsById.get(g.awayTeamId);
            if (!home || !away) return null;
            return (
              <div className="score-line" key={g.id}>
                <span>
                  {away.abbreviation} {g.awayScore} @ {home.abbreviation} {g.homeScore}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
