import type { SaveState } from "../../../shared/types";

export default function Schedule({ career }: { career: SaveState }) {
  const userTeamId = career.career.userTeamId;
  const teamsById = new Map(career.teams.map((t) => [t.id, t]));
  const games = career.schedule
    .filter((g) => g.homeTeamId === userTeamId || g.awayTeamId === userTeamId)
    .sort((a, b) => a.week - b.week);

  return (
    <div className="panel">
      <h2>Season Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Opponent</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => {
            const isHome = g.homeTeamId === userTeamId;
            const opponent = teamsById.get(isHome ? g.awayTeamId : g.homeTeamId);
            const isCurrentWeek = g.week === career.career.week && career.career.phase === "season";
            let result = "—";
            if (g.played && g.homeScore !== null && g.awayScore !== null) {
              const userScore = isHome ? g.homeScore : g.awayScore;
              const oppScore = isHome ? g.awayScore : g.homeScore;
              const won = userScore > oppScore;
              result = `${won ? "W" : "L"} ${userScore}-${oppScore}`;
            }
            return (
              <tr key={g.id} className={isCurrentWeek ? "highlight" : ""}>
                <td>{g.week}</td>
                <td>
                  {isHome ? "vs" : "@"} {opponent?.name} {opponent?.mascot}
                </td>
                <td className={g.played ? (result.startsWith("W") ? "win" : "lose") : ""}>
                  {result}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
