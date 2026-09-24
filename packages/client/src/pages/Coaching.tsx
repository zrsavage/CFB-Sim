import { useEffect, useState } from "react";
import type { Coach, CoachRole, SaveState } from "../../../shared/types";
import { api } from "../api";

const ROLE_LABELS: Record<CoachRole, string> = {
  headCoach: "Head Coach",
  offensiveCoordinator: "Offensive Coordinator",
  defensiveCoordinator: "Defensive Coordinator",
};

// Mirrors packages/server/src/routes/coaching.ts hireCost.
function hireCost(rating: number): number {
  return Math.max(10, Math.round((rating - 35) * 3));
}

export default function Coaching({
  career,
  onChanged,
  onError,
}: {
  career: SaveState;
  onChanged: () => void;
  onError: (msg: string | null) => void;
}) {
  const [pool, setPool] = useState<Coach[] | null>(null);
  const [programPoints, setProgramPoints] = useState(0);
  const [roleChoice, setRoleChoice] = useState<Record<string, CoachRole>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const userTeam = career.teams.find((t) => t.id === career.career.userTeamId)!;

  useEffect(() => {
    api
      .getCoachingPool()
      .then((res) => {
        setPool(res.pool);
        setProgramPoints(res.programPoints);
      })
      .catch((e) => onError(e.message));
  }, [career.career.season]);

  async function hire(coachId: string) {
    const role = roleChoice[coachId] ?? "offensiveCoordinator";
    setBusyId(coachId);
    onError(null);
    try {
      const res = await api.hireCoach(role, coachId);
      setPool(res.coachingPool);
      setProgramPoints(res.team.programPoints);
      onChanged();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="panel">
        <h2>Coaching Staff</h2>
        <p style={{ marginTop: 0 }}>
          Program Points: <span className="rating-pill">{programPoints}</span>
        </p>
        <div className="team-grid">
          {(["headCoach", "offensiveCoordinator", "defensiveCoordinator"] as CoachRole[]).map(
            (role) => {
              const coach = userTeam.staff[role];
              return (
                <div className="team-card" key={role} style={{ cursor: "default" }}>
                  <div className="name">{ROLE_LABELS[role]}</div>
                  <div className="meta">
                    {coach.firstName} {coach.lastName} · OVR {coach.rating}
                  </div>
                  <div className="meta">
                    {coach.trait} · {coach.yearsAtSchool} yr{coach.yearsAtSchool === 1 ? "" : "s"} at
                    school
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Coaching Search</h2>
        {!pool ? (
          <p>Loading candidates...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Rating</th>
                <th>Trait</th>
                <th>Cost</th>
                <th>Hire As</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...pool]
                .sort((a, b) => b.rating - a.rating)
                .map((c) => {
                  const cost = hireCost(c.rating);
                  const role = roleChoice[c.id] ?? "offensiveCoordinator";
                  return (
                    <tr key={c.id}>
                      <td>
                        {c.firstName} {c.lastName}
                      </td>
                      <td>{c.rating}</td>
                      <td>{c.trait}</td>
                      <td>{cost}</td>
                      <td>
                        <select
                          value={role}
                          onChange={(e) =>
                            setRoleChoice({ ...roleChoice, [c.id]: e.target.value as CoachRole })
                          }
                        >
                          <option value="headCoach">Head Coach</option>
                          <option value="offensiveCoordinator">Off. Coordinator</option>
                          <option value="defensiveCoordinator">Def. Coordinator</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="primary small"
                          disabled={busyId === c.id || programPoints < cost}
                          onClick={() => hire(c.id)}
                        >
                          {busyId === c.id ? "Hiring..." : "Hire"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
