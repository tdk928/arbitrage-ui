import { useMemo, useState } from "react";

const RUN_URL = "/arbitrage/v3/run";
const TOP10_URL = "/arbitrage/v3/top10";

function calculateStakes(total, legs) {
  if (!total || total <= 0 || !legs?.length) return [];
  const impliedSum = legs.reduce((sum, leg) => sum + 1 / Number(leg.odd), 0);
  if (impliedSum <= 0) return legs.map(() => 0);
  return legs.map((leg) => {
    const stake = total / impliedSum / Number(leg.odd);
    return Math.round(stake * 100) / 100;
  });
}

function formatKickoff(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ArbCard({ arb }) {
  const [totalStake, setTotalStake] = useState("");
  const kickoff = formatKickoff(arb.kickoff_utc);
  const legs = arb.legs || [];
  const budget = totalStake ? Number(totalStake) : 0;
  const stakes = useMemo(
    () => calculateStakes(budget, legs),
    [budget, legs]
  );

  function handleStakeInput(e) {
    setTotalStake(e.target.value.replace(/\D/g, ""));
  }

  return (
    <div className="card">
      <div className="card-top">
        <div>
          <div className="match">
            {arb.home_team && arb.away_team
              ? `${arb.home_team} — ${arb.away_team}`
              : arb.match}
          </div>
          <div className="meta">
            <span className="market">{arb.market}</span>
            {kickoff && <span className="kickoff">{kickoff}</span>}
          </div>
        </div>
        <div className="margin">
          <label className="stake-input-wrap">
            <span className="stake-input-label">Обща сума</span>
            <input
              type="text"
              inputMode="numeric"
              className="stake-input"
              placeholder="0"
              value={totalStake}
              onChange={handleStakeInput}
            />
          </label>
          <div className="margin-value">
            +{Number(arb.margin_pct).toFixed(2)}%
            <span className="margin-label">печалба</span>
          </div>
        </div>
      </div>

      <table className="legs">
        <thead>
          <tr>
            <th>Букмейкър</th>
            <th>Залог</th>
            <th>Коефициент</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, i) => (
            <tr key={i}>
              <td className="bookmaker">{leg.bookmaker}</td>
              <td>{leg.outcome}</td>
              <td className="odd">{Number(leg.odd).toFixed(2)}</td>
              <td>
                <input
                  type="text"
                  className="stake-readonly"
                  readOnly
                  tabIndex={-1}
                  value={budget > 0 ? stakes[i].toFixed(2) : ""}
                  placeholder="—"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(null); // "run" | "top10" | null
  const [arbs, setArbs] = useState(null); // null = nothing loaded yet
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function runScrape() {
    setLoading("run");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(RUN_URL, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArbs(data.top10 || []);
      setInfo(`Скрапът приключи (run #${data.run_id}, статус: ${data.status}).`);
    } catch (e) {
      setError(`Грешка при скрапване: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function fetchTop10() {
    setLoading("top10");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(TOP10_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArbs(data);
    } catch (e) {
      setError(`Грешка при зареждане: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="page">
      <h1>Arbitrage</h1>

      <div className="actions">
        <button onClick={runScrape} disabled={loading !== null}>
          {loading === "run" ? "Скрапване…" : "Get data"}
        </button>
        <button onClick={fetchTop10} disabled={loading !== null}>
          {loading === "top10" ? "Зареждане…" : "Get current arbitrages"}
        </button>
      </div>

      {error && <div className="message error">{error}</div>}
      {info && <div className="message info">{info}</div>}

      {arbs !== null && arbs.length === 0 && (
        <div className="message empty">
          В момента не са намерени арбитражни залози.
        </div>
      )}

      {arbs !== null && arbs.length > 0 && (
        <div className="cards">
          {arbs.map((arb, i) => (
            <ArbCard key={i} arb={arb} />
          ))}
        </div>
      )}
    </div>
  );
}
