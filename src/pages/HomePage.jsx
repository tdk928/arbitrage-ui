import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useArbitrageNav } from "../context/ArbitrageNavContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getStoredToken } from "../auth/token.js";
import { accessDeniedPathForError } from "../auth/handleApiError.js";
import {
  arbitrageItemKey,
  deleteAuditEntry,
  deleteTop10Entry,
  fetchAudit,
  fetchTop10,
  runScrape,
} from "../api/arbitrage.js";
import DeleteArbitrageModal from "../components/DeleteArbitrageModal.jsx";

/** Survives React StrictMode remount — prevents duplicate nav-triggered fetches. */
let lastHandledArbitrageActionId = null;

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

function splitIntoColumns(items, columnCount = 3) {
  const size = Math.ceil(items.length / columnCount);
  return Array.from({ length: columnCount }, (_, i) =>
    items.slice(i * size, (i + 1) * size)
  );
}

function ArbCard({ arb, isAdmin, onDeleteRequest }) {
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
    setTotalStake(e.target.value.replace(/\D/g, "").slice(0, 8));
  }

  function formatMoney(value) {
    if (!Number.isFinite(value)) return "";
    return value.toLocaleString("bg-BG", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="card">
      <div className="card-header-bar">
        <div className="match">
          {arb.home_team && arb.away_team
            ? `${arb.home_team} — ${arb.away_team}`
            : arb.match}
        </div>
        {isAdmin && (
          <button
            type="button"
            className="arb-delete-btn"
            onClick={() => onDeleteRequest?.(arb, "top10")}
            title="Изтрий арбитраж"
          >
            Изтрий
          </button>
        )}
      </div>

      <span className="market">{arb.market}</span>

      <div className="card-top">
        <div className="card-info">
          {kickoff && <span className="kickoff">Начало - {kickoff}</span>}
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
            <span className="margin-pct">
              +{Number(arb.margin_pct).toFixed(2)}%
            </span>
            {profitAmount !== null && (
              <span className="margin-amount" title={formatMoney(budget + profitAmount)}>
                {formatMoney(budget + profitAmount)}
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
              <td className="bookmaker" data-label="Букмейкър">
                {leg.bookmaker}
              </td>
              <td data-label="Залог">{leg.outcome}</td>
              <td className="odd" data-label="Коефициент">
                {Number(leg.odd).toFixed(2)}
              </td>
              <td data-label="Сума">
                <span
                  className="stake-readonly"
                  title={budget > 0 ? formatMoney(stakes[i]) : undefined}
                >
                  {budget > 0 ? formatMoney(stakes[i]) : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditCard({ item, isAdmin, onDeleteRequest }) {
  const kickoff = formatKickoff(item.kickoff_utc);
  const legs = item.legs || [];

  return (
    <article className="audit-card">
      <div className="audit-card-header">
        <div className="audit-card-header-right">
          <div className="audit-margin">
            +{Number(item.margin_pct).toFixed(2)}%
          </div>
          {isAdmin && (
            <button
              type="button"
              className="arb-delete-btn"
              onClick={() => onDeleteRequest?.(item, "audit")}
              title="Изтрий от audit"
            >
              Изтрий
            </button>
          )}
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

function AuditView({ items, isAdmin, onDeleteRequest }) {
  const columns = useMemo(() => splitIntoColumns(items, 3), [items]);

  return (
    <div className="audit-view">
      <div className="audit-columns">
        {columns.map((colItems, colIndex) => (
          <div className="audit-col" key={colIndex}>
            {colItems.map((item) => (
              <AuditCard
                key={`${item.run_id}-${item.rank}-${item.rule_slug}`}
                item={item}
                isAdmin={isAdmin}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { session } = useAuth();
  const isAdmin = session.role === "admin";
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
  const inFlightRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  function handleProtectedApiError(error) {
    const redirect = accessDeniedPathForError(error);
    if (redirect) {
      navigate(redirect.pathname, { replace: true, state: redirect.state });
      return true;
    }
    return false;
  }

  async function handleRunScrape() {
    if (inFlightRef.current) return;
    inFlightRef.current = "run";
    setLoading("run");
    setError(null);
    setInfo(null);
    try {
      const token = getStoredToken();
      const data = await runScrape(token);
      setArbs(data.top10 || []);
      setAudit(null);
      setView("arbs");
      setArbSource("run");
      setInfo(`Скрапът приключи (run #${data.run_id}, статус: ${data.status}).`);
    } catch (e) {
      if (!handleProtectedApiError(e)) {
        setError(`Грешка при скрапване: ${e.message}`);
      }
    } finally {
      setLoading(null);
      inFlightRef.current = null;
    }
  }

  async function handleFetchTop10() {
    if (inFlightRef.current) return;
    inFlightRef.current = "top10";
    setLoading("top10");
    setError(null);
    setInfo(null);
    try {
      const token = getStoredToken();
      const data = await fetchTop10(token);
      setArbs(data);
      setAudit(null);
      setView("arbs");
      setArbSource("top10");
    } catch (e) {
      if (!handleProtectedApiError(e)) {
        setError(`Грешка при зареждане: ${e.message}`);
      }
    } finally {
      setLoading(null);
      inFlightRef.current = null;
    }
  }

  async function handleFetchAudit() {
    if (inFlightRef.current) return;
    inFlightRef.current = "audit";
    setLoading("audit");
    setError(null);
    setInfo(null);
    try {
      const token = getStoredToken();
      const data = await fetchAudit(token);
      setAudit(data);
      setArbs(null);
      setView("audit");
    } catch (e) {
      if (!handleProtectedApiError(e)) {
        setError(`Грешка при зареждане на audit: ${e.message}`);
      }
    } finally {
      setLoading(null);
      inFlightRef.current = null;
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
      onRunScrape: handleRunScrape,
      onFetchTop10: handleFetchTop10,
      onFetchAudit: handleFetchAudit,
    });
  }, [loading, view, arbSource, setNav]);

  useEffect(() => {
    const action = location.state?.arbitrageAction;
    const actionId = location.state?.actionId;
    if (!action || actionId == null) return;
    if (lastHandledArbitrageActionId === actionId) return;

    lastHandledArbitrageActionId = actionId;
    navigate(".", { replace: true, state: {} });

    if (action === "run") handleRunScrape();
    if (action === "top10") handleFetchTop10();
    if (action === "audit") handleFetchAudit();
  }, [location.state?.arbitrageAction, location.state?.actionId]);

  function openDeleteModal(item, source) {
    setDeleteError(null);
    setDeleteTarget({ item, source });
  }

  function closeDeleteModal() {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    const { item, source } = deleteTarget;
    const token = getStoredToken();
    const key = arbitrageItemKey(item, source);

    setDeleting(true);
    setDeleteError(null);
    try {
      if (source === "audit") {
        await deleteAuditEntry(token, item);
        setAudit((prev) =>
          prev?.filter((row) => arbitrageItemKey(row, "audit") !== key) ?? null
        );
      } else {
        await deleteTop10Entry(token, item.rank);
        setArbs((prev) =>
          prev?.filter((row) => arbitrageItemKey(row, "top10") !== key) ?? null
        );
      }
      setDeleteTarget(null);
    } catch (err) {
      if (!handleProtectedApiError(err)) {
        setDeleteError(err.message || "Грешка при изтриване");
      }
    } finally {
      setDeleting(false);
    }
  }

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
            <ArbCard
              key={i}
              arb={arb}
              isAdmin={isAdmin}
              onDeleteRequest={openDeleteModal}
            />
          ))}
        </div>
      )}

      {view === "audit" && audit !== null && audit.length > 0 && (
        <AuditView
          items={audit}
          isAdmin={isAdmin}
          onDeleteRequest={openDeleteModal}
        />
      )}

      <DeleteArbitrageModal
        item={deleteTarget?.item ?? null}
        source={deleteTarget?.source ?? "audit"}
        saving={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
