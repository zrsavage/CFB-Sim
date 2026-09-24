import type { PlayerAttribute } from "../../../shared/types";

export interface ScoutableInfo {
  hometown: string;
  highSchool: string;
  trait: string;
  blurb: string;
  attributes: PlayerAttribute[];
}

export default function PlayerDetailPanel({ info, colSpan }: { info: ScoutableInfo; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="player-detail">
          <p className="blurb">{info.blurb}</p>
          <div className="meta-line">
            Hometown: {info.hometown} · High School: {info.highSchool} · Reputation:{" "}
            {info.trait}
          </div>
          <div className="attribute-grid">
            {info.attributes.map((a) => (
              <div className="attribute-row" key={a.label}>
                <span className="attribute-label">{a.label}</span>
                <span className="attribute-bar-track">
                  <span
                    className="attribute-bar-fill"
                    style={{ width: `${Math.max(0, Math.min(100, a.value))}%` }}
                  />
                </span>
                <span className="attribute-value">{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}
