import { useEffect, useState } from "react";
import type { Division, SaveState, Team } from "../../../shared/types";
import { api } from "../api";
import { DIVISION_LABELS, DIVISION_ORDER } from "../divisions";

export default function TeamSelect({ onStarted }: { onStarted: (state: SaveState) => void }) {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [division, setDivision] = useState<Division>("power");
  const [search, setSearch] = useState("");

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

  const visible = teams.filter((t) => {
    if (t.division !== division) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.mascot.toLowerCase().includes(q) ||
      t.conference.toLowerCase().includes(q)
    );
  });
  const conferences = Array.from(new Set(visible.map((t) => t.conference)));

  return (
    <div className="app-shell">
      <div className="hero" style={{ margin: "0 auto", textAlign: "center" }}>
        <h1>Gridiron GM</h1>
        <p>
          Pick a program to take over. Build your roster over four-year cycles through recruiting
          and player development — climb from the Group of Five into a Power conference, or fall
          the other way.
        </p>
      </div>

      <div className="filters" style={{ justifyContent: "center" }}>
        {DIVISION_ORDER.map((d) => (
          <button
            key={d}
            className={d === division ? "primary small" : "secondary small"}
            onClick={() => setDivision(d)}
          >
            {DIVISION_LABELS[d]} ({teams.filter((t) => t.division === d).length})
          </button>
        ))}
      </div>
      <div className="filters" style={{ justifyContent: "center", marginBottom: 20 }}>
        <input
          placeholder="Search team, mascot, or conference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--panel-2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 12px",
            color: "var(--text)",
            width: 320,
            maxWidth: "100%",
          }}
        />
      </div>

      {conferences.map((conf) => (
        <div className="panel" key={conf}>
          <h2>{conf}</h2>
          <div className="team-grid">
            {visible
              .filter((t) => t.conference === conf)
              .sort((a, b) => b.prestige - a.prestige)
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

      {conferences.length === 0 && <div className="panel">No teams match "{search}".</div>}
    </div>
  );
}
