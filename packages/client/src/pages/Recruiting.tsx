import { Fragment, useEffect, useState } from "react";
import type { Recruit, SaveState } from "../../../shared/types";
import { api } from "../api";
import PlayerDetailPanel from "../components/PlayerDetailPanel";

const COLUMN_COUNT = 6;

export default function Recruiting({
  career,
  onChanged,
  onError,
  onGoDashboard,
}: {
  career: SaveState;
  onChanged: () => void;
  onError: (msg: string | null) => void;
  onGoDashboard: () => void;
}) {
  const [recruits, setRecruits] = useState<Recruit[] | null>(null);
  const [maxOffers, setMaxOffers] = useState(0);
  const [posFilter, setPosFilter] = useState("ALL");
  const [starFilter, setStarFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = career.career.phase === "recruiting";

  useEffect(() => {
    if (!active) return;
    api
      .getRecruitingBoard()
      .then((res) => {
        setRecruits(res.recruits);
        setMaxOffers(res.maxOffers);
      })
      .catch((e) => onError(e.message));
  }, [active, career.career.season]);

  if (!active) {
    return (
      <div className="panel">
        <h2>Recruiting</h2>
        <p>The recruiting board opens once the regular season ends.</p>
      </div>
    );
  }

  if (!recruits) return <div className="panel">Loading recruiting board...</div>;

  async function toggleOffer(id: string) {
    setBusy(true);
    onError(null);
    try {
      const res = await api.offerRecruit(id);
      setRecruits(res.recruits);
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function advance() {
    setAdvancing(true);
    onError(null);
    try {
      await api.advanceSigningDay();
      onChanged();
      onGoDashboard();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setAdvancing(false);
    }
  }

  const offerCount = recruits.filter((r) => r.offeredByUser).length;
  const positions = Array.from(new Set(recruits.map((r) => r.position))).sort();
  const filtered = recruits
    .filter((r) => posFilter === "ALL" || r.position === posFilter)
    .filter((r) => starFilter === "ALL" || String(r.stars) === starFilter)
    .sort((a, b) => b.stars - a.stars || b.rating - a.rating);

  return (
    <div className="panel">
      <h2>Recruiting Board</h2>
      <div className="offer-count">
        Offers used: {offerCount} / {maxOffers} · Click a recruit to see their scouting report
      </div>
      <div className="filters">
        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
          <option value="ALL">All Positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={starFilter} onChange={(e) => setStarFilter(e.target.value)}>
          <option value="ALL">All Stars</option>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>
              {s}-star
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pos</th>
            <th>Stars</th>
            <th>Rating</th>
            <th>Hometown</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <Fragment key={r.id}>
              <tr
                className={`expandable-row${r.offeredByUser ? " highlight" : ""}`}
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <td>
                  {r.firstName} {r.lastName}
                </td>
                <td>{r.position}</td>
                <td className="badge-star">{"★".repeat(r.stars)}</td>
                <td>{r.rating}</td>
                <td>{r.hometown}</td>
                <td>
                  <button
                    className={r.offeredByUser ? "secondary small" : "primary small"}
                    disabled={busy || (!r.offeredByUser && offerCount >= maxOffers)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOffer(r.id);
                    }}
                  >
                    {r.offeredByUser ? "Withdraw" : "Offer"}
                  </button>
                </td>
              </tr>
              {expandedId === r.id && <PlayerDetailPanel info={r} colSpan={COLUMN_COUNT} />}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <button className="primary" onClick={advance} disabled={advancing}>
          {advancing ? "Resolving Signing Day..." : "Advance to Signing Day"}
        </button>
      </div>
    </div>
  );
}
