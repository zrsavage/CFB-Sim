import type { SaveState } from "../../../shared/types";
import { DIVISION_LABELS, DIVISION_ORDER } from "../divisions";

function winPct(t: { wins: number; losses: number }): number {
  const total = t.wins + t.losses;
  return total === 0 ? 0 : t.wins / total;
}

const SWAP_COUNT = 2;

export default function Standings({ career }: { career: SaveState }) {
  const userTeamId = career.career.userTeamId;

  const powerSorted = career.teams
    .filter((t) => t.division === "power")
    .sort((a, b) => winPct(a) - winPct(b));
  const group5Sorted = career.teams
    .filter((t) => t.division === "group5")
    .sort((a, b) => winPct(b) - winPct(a));
  const relegationZone = new Set(powerSorted.slice(0, SWAP_COUNT).map((t) => t.id));
  const promotionZone = new Set(group5Sorted.slice(0, SWAP_COUNT).map((t) => t.id));

  return (
    <div>
      {DIVISION_ORDER.map((division) => {
        const teamsInDivision = career.teams.filter((t) => t.division === division);
        if (teamsInDivision.length === 0) return null;
        const conferences = Array.from(new Set(teamsInDivision.map((t) => t.conference)));

        return (
          <div key={division}>
            <h2
              style={{
                color: "var(--muted)",
                margin: "20px 0 8px",
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {DIVISION_LABELS[division]}
              {division === "power" &&
                " — teams in red risk relegation to Group of Five this offseason"}
              {division === "group5" &&
                " — teams in green are in position for promotion to a Power conference"}
            </h2>
            {conferences.map((conf) => {
              const teams = teamsInDivision
                .filter((t) => t.conference === conf)
                .sort((a, b) => winPct(b) - winPct(a) || b.wins - a.wins);
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
                      {teams.map((t, i) => {
                        const zoneClass = relegationZone.has(t.id)
                          ? " lose"
                          : promotionZone.has(t.id)
                          ? " win"
                          : "";
                        return (
                          <tr key={t.id} className={t.id === userTeamId ? "highlight" : ""}>
                            <td>{i + 1}</td>
                            <td className={zoneClass}>
                              {t.name} {t.mascot}
                            </td>
                            <td>{t.wins}</td>
                            <td>{t.losses}</td>
                            <td>{t.overallRating}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
