import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useArbitrageNav } from "../context/ArbitrageNavContext.jsx";

const RUN_URL = "/arbitrage/v3/run";
const TOP10_URL = "/arbitrage/v3/top10";
const AUDIT_URL = "/arbitrage/v3/audit";

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

function formatScrapeDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function splitIntoColumns(items) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
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
  const profitAmount =
    budget > 0
      ? Math.round(budget * (Number(arb.margin_pct) / 100) * 100) / 100
      : null;

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
            {profitAmount !== null && (
              <span className="margin-amount">
                {(budget + profitAmount).toFixed(2)}
              </span>
            )}
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

function AuditCard({ item }) {
  const kickoff = formatKickoff(item.kickoff_utc);
  const legs = item.legs || [];

  return (
    <article className="audit-card">
      <div className="audit-card-header">
        <span className="audit-rank">#{item.rank}</span>
        <div className="audit-margin">
          +{Number(item.margin_pct).toFixed(2)}%
        </div>
      </div>

      <div className="audit-match">
        {item.home_team && item.away_team
          ? `${item.home_team} — ${item.away_team}`
          : item.match}
      </div>

      <div className="audit-market">{item.market}</div>

      <div className="audit-details">
        {kickoff && (
          <span className="audit-tag">
            <span className="audit-tag-label">Мач</span>
            {kickoff}
          </span>
        )}
        <span className="audit-tag">
          <span className="audit-tag-label">Букмейкъри</span>
          {item.bookmaker_count}
        </span>
        <span className="audit-tag audit-tag-muted">
          <span className="audit-tag-label">Run</span>
          #{item.run_id}
        </span>
        {item.scrape_date && (
          <span className="audit-tag audit-tag-muted">
            <span className="audit-tag-label">Скрап</span>
            {formatScrapeDate(item.scrape_date)} {item.scrape_time}
          </span>
        )}
      </div>

      <div className="audit-legs">
        {legs.map((leg, i) => (
          <div className="audit-leg" key={i}>
            <div className="audit-leg-bookmaker">{leg.bookmaker}</div>
            <div className="audit-leg-outcome">{leg.outcome}</div>
            <div className="audit-leg-odd">{Number(leg.odd).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AuditView({ items }) {
  const [leftCol, rightCol] = useMemo(
    () => splitIntoColumns(items),
    [items]
  );

  return (
    <div className="audit-view">
      <div className="audit-summary">
        <span className="audit-summary-count">{items.length}</span>
        <span className="audit-summary-label">
          записа в audit историята
        </span>
      </div>

      <div className="audit-columns">
        <div className="audit-col">
          {leftCol.map((item) => (
            <AuditCard
              key={`${item.run_id}-${item.rank}-${item.rule_slug}`}
              item={item}
            />
          ))}
        </div>
        <div className="audit-col">
          {rightCol.map((item) => (
            <AuditCard
              key={`${item.run_id}-${item.rank}-${item.rule_slug}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { setNav } = useArbitrageNav();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [view, setView] = useState(null);
  const [arbSource, setArbSource] = useState(null);
  const [arbs, setArbs] = useState(null);
  const [audit, setAudit] = useState(null);
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
      setAudit(null);
      setView("arbs");
      setArbSource("run");
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
      setAudit(null);
      setView("arbs");
      setArbSource("top10");
    } catch (e) {
      setError(`Грешка при зареждане: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function fetchAudit() {
    setLoading("audit");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(AUDIT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAudit(data);
      setArbs(null);
      setView("audit");
    } catch (e) {
      setError(`Грешка при зареждане на audit: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    if (!location.state?.resetHome) return;

    setView(null);
    setArbSource(null);
    setArbs(null);
    setAudit(null);
    setError(null);
    setInfo(null);
    setLoading(null);
    navigate(".", { replace: true, state: {} });
  }, [location.state?.resetHome, navigate]);

  useEffect(() => {
    setNav({
      loading,
      view,
      arbSource,
      onRunScrape: runScrape,
      onFetchTop10: fetchTop10,
      onFetchAudit: fetchAudit,
    });
  }, [loading, view, arbSource, setNav]);

  useEffect(() => {
    const action = location.state?.arbitrageAction;
    if (!action) return;

    navigate(".", { replace: true, state: {} });

    if (action === "run") runScrape();
    if (action === "top10") fetchTop10();
    if (action === "audit") fetchAudit();
  }, [location.state]);

  const showEmptyArbs = view === "arbs" && arbs !== null && arbs.length === 0;
  const showEmptyAudit = view === "audit" && audit !== null && audit.length === 0;

  const showHero = view === null && loading === null;

  return (
    <div className="page">
      {showHero && (
        <section className="home-hero">
          <img
            src="/home-hero.png"
            alt="Arbitrage"
            className="home-hero-img"
          />
        </section>
      )}

      {error && <div className="message error">{error}</div>}
      {info && <div className="message info">{info}</div>}

      {showEmptyArbs && (
        <div className="message empty">
          В момента не са намерени арбитражни залози.
        </div>
      )}

      {showEmptyAudit && (
        <div className="message empty">
          Няма записи в audit историята.
        </div>
      )}

      {view === "arbs" && arbs !== null && arbs.length > 0 && (
        <div className="cards">
          {arbs.map((arb, i) => (
            <ArbCard key={i} arb={arb} />
          ))}
        </div>
      )}

      {view === "audit" && audit !== null && audit.length > 0 && (
        <AuditView items={audit} />
      )}
    </div>
  );
}
