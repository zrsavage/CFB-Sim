import { useEffect, useState } from "react";
import type { CareerPhase, SaveState } from "../../shared/types";
import { api } from "./api";
import TeamSelect from "./pages/TeamSelect";
import Dashboard from "./pages/Dashboard";
import Roster from "./pages/Roster";
import Standings from "./pages/Standings";
import Schedule from "./pages/Schedule";
import Recruiting from "./pages/Recruiting";
import Facilities from "./pages/Facilities";
import Coaching from "./pages/Coaching";

type Tab = "dashboard" | "roster" | "standings" | "schedule" | "recruiting" | "facilities" | "coaching";

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Dashboard",
  roster: "Roster",
  standings: "Standings",
  schedule: "Schedule",
  recruiting: "Recruiting",
  facilities: "Facilities",
  coaching: "Coaching",
};

const PHASE_LABELS: Record<CareerPhase, string> = {
  season: "Regular Season",
  championship: "Conference Championships",
  bowls: "Bowl Season",
  recruiting: "Offseason",
};

export default function App() {
  const [career, setCareer] = useState<SaveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    api
      .getCareer()
      .then((state) => setCareer(state))
      .catch(() => setCareer(null))
      .finally(() => setLoading(false));
  }, []);

  async function refresh() {
    try {
      const state = await api.getCareer();
      setCareer(state);
    } catch (e) {
      // no active save
    }
  }

  if (loading) {
    return <div className="center-screen">Loading...</div>;
  }

  if (!career || !career.career.started) {
    return <TeamSelect onStarted={(state) => setCareer(state)} />;
  }

  const userTeam = career.teams.find((t) => t.id === career.career.userTeamId);
  const phaseLabel = PHASE_LABELS[career.career.phase];
  const weekLabel = career.career.phase === "season" ? ` · Week ${career.career.week}` : "";

  async function startNewCareer() {
    if (!window.confirm("Start a new career? This permanently deletes your current save.")) {
      return;
    }
    try {
      await api.resetCareer();
      setCareer(null);
      setTab("dashboard");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <h1>Gridiron GM</h1>
        <div className="status">
          {userTeam ? `${userTeam.name} ${userTeam.mascot}` : "—"} · Season {career.career.season}{" "}
          · {phaseLabel}
          {weekLabel}
          <button className="secondary small" style={{ marginLeft: 12 }} onClick={startNewCareer}>
            New Career
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <nav className="tabs">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {tab === "dashboard" && (
        <Dashboard career={career} onChanged={refresh} onError={setError} />
      )}
      {tab === "roster" && <Roster career={career} />}
      {tab === "standings" && <Standings career={career} />}
      {tab === "schedule" && <Schedule career={career} />}
      {tab === "recruiting" && (
        <Recruiting career={career} onChanged={refresh} onError={setError} onGoDashboard={() => setTab("dashboard")} />
      )}
      {tab === "facilities" && (
        <Facilities career={career} onChanged={refresh} onError={setError} />
      )}
      {tab === "coaching" && <Coaching career={career} onChanged={refresh} onError={setError} />}
    </div>
  );
}
