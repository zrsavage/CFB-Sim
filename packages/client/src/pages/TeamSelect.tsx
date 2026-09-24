import { useEffect, useState } from "react";
import type { SaveState, Team } from "../../../shared/types";
import { api } from "../api";

export default function TeamSelect({ onStarted }: { onStarted: (state: SaveState) => void }) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    api
      .generateLeague()
      .then((res) => setTeams(res.teams))
      .catch((e) => setError(e.message));
  }, []);

  async function pick(teamId: string) {
    setSelecting(teamId);
    try {
      const state = await api.selectTeam(teamId);
      onStarted(state);
    } catch (e: any) {
      setError(e.message);
      setSelecting(null);
    }
  }

  if (error) {
    return (
      <div className="center-screen">
        <div className="hero">
          <h1>Gridiron GM</h1>
          <div className="error-banner">{error}</div>
        </div>
      </div>
    );
  }

  if (!teams) {
    return <div className="center-screen">Generating league...</div>;
  }

  const conferences = Array.from(new Set(teams.map((t) => t.conference)));

  return (
    <div className="app-shell">
      <div className="hero" style={{ margin: "0 auto", textAlign: "center" }}>
        <h1>Gridiron GM</h1>
        <p>Pick a program to take over. Build your roster over four-year cycles through recruiting and player development.</p>
      </div>

      {conferences.map((conf) => (
        <div className="panel" key={conf}>
          <h2>{conf}</h2>
          <div className="team-grid">
            {teams
              .filter((t) => t.conference === conf)
              .map((t) => (
                <div className="team-card" key={t.id} onClick={() => !selecting && pick(t.id)}>
                  <div className="name">
                    {t.name} {t.mascot}
                  </div>
                  <div className="meta">
                    Prestige {t.prestige} · OVR {t.overallRating}
                  </div>
                  <div className="meta">
                    OFF {t.offenseRating} · DEF {t.defenseRating}
                  </div>
                  {selecting === t.id && <div className="meta">Starting career...</div>}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
