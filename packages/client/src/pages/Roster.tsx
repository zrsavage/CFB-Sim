import { useEffect, useState } from "react";
import type { Player, SaveState } from "../../../shared/types";
import { api } from "../api";

export default function Roster({ career }: { career: SaveState }) {
  const [roster, setRoster] = useState<Player[] | null>(null);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const userTeamId = career.career.userTeamId;

  useEffect(() => {
    setRoster(null);
    api.getRoster(userTeamId).then(setRoster);
  }, [userTeamId, career.career.season, career.career.phase]);

  if (!roster) return <div className="panel">Loading roster...</div>;

  const positions = Array.from(new Set(roster.map((p) => p.position))).sort();
  const filtered = posFilter === "ALL" ? roster : roster.filter((p) => p.position === posFilter);
  const sorted = [...filtered].sort((a, b) => b.overall - a.overall);

  return (
    <div className="panel">
      <h2>Roster ({roster.length})</h2>
      <div className="filters">
        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
          <option value="ALL">All Positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pos</th>
            <th>Year</th>
            <th>OVR</th>
            <th>POT</th>
            <th>Dev Trait</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id}>
              <td>
                {p.firstName} {p.lastName}
              </td>
              <td>{p.position}</td>
              <td>{p.year}</td>
              <td>{p.overall}</td>
              <td>{p.potential}</td>
              <td>{p.devTrait}</td>
              <td>{p.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
