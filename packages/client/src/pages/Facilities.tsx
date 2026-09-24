import { useState } from "react";
import type { FacilityKey, SaveState } from "../../../shared/types";
import { api } from "../api";

const FACILITY_LABELS: Record<FacilityKey, string> = {
  stadium: "Stadium & Fan Support",
  training: "Training Facility",
  academics: "Academic Center",
  nil: "NIL Collective",
};

const FACILITY_DESCRIPTIONS: Record<FacilityKey, string> = {
  stadium: "Bigger crowds and more revenue — drives your season Program Points income.",
  training: "Better strength & conditioning — speeds up player development each offseason.",
  academics: "Tutoring, support staff, culture — reduces how often players transfer out.",
  nil: "Name/Image/Likeness deals — strengthens your recruiting pitch to prospects.",
};

const MAX_LEVEL = 5;
// Mirrors packages/server/src/engine/facilities.ts LEVEL_UPGRADE_COST.
const LEVEL_UPGRADE_COST: Record<number, number> = { 2: 30, 3: 60, 4: 100, 5: 150 };

export default function Facilities({
  career,
  onChanged,
  onError,
}: {
  career: SaveState;
  onChanged: () => void;
  onError: (msg: string | null) => void;
}) {
  const [busy, setBusy] = useState<FacilityKey | null>(null);
  const userTeam = career.teams.find((t) => t.id === career.career.userTeamId)!;

  async function upgrade(facility: FacilityKey) {
    setBusy(facility);
    onError(null);
    try {
      await api.upgradeFacility(facility);
      onChanged();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="panel">
        <h2>Program Facilities</h2>
        <p style={{ marginTop: 0 }}>
          Program Points: <span className="rating-pill">{userTeam.programPoints}</span> — earned
          each season from wins, your Stadium level, and NFL Draft picks produced.
        </p>
      </div>

      <div className="team-grid">
        {(Object.keys(FACILITY_LABELS) as FacilityKey[]).map((key) => {
          const level = userTeam.facilities[key];
          const cost = LEVEL_UPGRADE_COST[level + 1];
          const maxed = level >= MAX_LEVEL;
          const canAfford = !maxed && userTeam.programPoints >= (cost ?? Infinity);
          return (
            <div className="panel" key={key} style={{ margin: 0 }}>
              <h2>{FACILITY_LABELS[key]}</h2>
              <p style={{ marginTop: 0, color: "var(--muted)", fontSize: 13 }}>
                {FACILITY_DESCRIPTIONS[key]}
              </p>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {Array.from({ length: MAX_LEVEL }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 10,
                      borderRadius: 4,
                      background: i < level ? "var(--accent)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
              <p style={{ marginBottom: 12 }}>
                Level <strong>{level}</strong> / {MAX_LEVEL}
              </p>
              <button
                className="primary"
                disabled={maxed || !canAfford || busy === key}
                onClick={() => upgrade(key)}
              >
                {maxed
                  ? "Max Level"
                  : busy === key
                  ? "Upgrading..."
                  : `Upgrade to Level ${level + 1} (${cost} pts)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
