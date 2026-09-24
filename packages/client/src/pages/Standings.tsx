import type { SaveState } from "../../../shared/types";

export default function Standings({ career }: { career: SaveState }) {
  const conferences = Array.from(new Set(career.teams.map((t) => t.conference)));
  const userTeamId = career.career.userTeamId;

  return (
    <div>
      {conferences.map((conf) => {
        const teams = career.teams
          .filter((t) => t.conference === conf)
          .sort((a, b) => {
            const aPct = a.wins / Math.max(1, a.wins + a.losses);
            const bPct = b.wins / Math.max(1, b.wins + b.losses);
            return bPct - aPct || b.wins - a.wins;
          });
        return (
          <div className="panel" key={conf}>
            <h2>{conf}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>W</th>
                  <th>L</th>
                  <th>OVR</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.id} className={t.id === userTeamId ? "highlight" : ""}>
                    <td>{i + 1}</td>
                    <td>
                      {t.name} {t.mascot}
                    </td>
                    <td>{t.wins}</td>
                    <td>{t.losses}</td>
                    <td>{t.overallRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
