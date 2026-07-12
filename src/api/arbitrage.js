import { getStoredToken } from "../auth/token.js";
import { authHeaders, readJsonResponse } from "./http.js";

/**
 * GET /arbitrage/v3/top10
 * Requires subscribed client or admin JWT.
 */
export function fetchTop10(token = getStoredToken()) {
  if (!token) throw new Error("Not authenticated");
  return fetch("/arbitrage/v3/top10", { headers: authHeaders(token) }).then(
    readJsonResponse
  );
}

/**
 * GET /arbitrage/v3/audit
 * Requires subscribed client or admin JWT.
 */
export function fetchAudit(token = getStoredToken()) {
  if (!token) throw new Error("Not authenticated");
  return fetch("/arbitrage/v3/audit", { headers: authHeaders(token) }).then(
    readJsonResponse
  );
}

/**
 * POST /arbitrage/v3/run
 * Requires subscribed client or admin JWT.
 */
export function runScrape(token = getStoredToken()) {
  if (!token) throw new Error("Not authenticated");
  return fetch("/arbitrage/v3/run", {
    method: "POST",
    headers: authHeaders(token),
  }).then(readJsonResponse);
}

async function deleteJson(path, token, body) {
  const response = await fetch(path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });

  if (response.status === 204) return null;
  return readJsonResponse(response);
}

async function deleteAuth(path, token) {
  const response = await fetch(path, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (response.status === 204) return null;
  return readJsonResponse(response);
}

/**
 * DELETE /arbitrage/v3/audit
 * Admin only. Removes one row from arbitrage_audit.
 */
export function deleteAuditEntry(token, item) {
  return deleteJson("/arbitrage/v3/audit", token, {
    run_id: item.run_id,
    rule_slug: item.rule_slug,
    home_team: item.home_team,
    away_team: item.away_team,
    line: item.line ?? null,
  });
}

/**
 * DELETE /arbitrage/v3/top10/{rank}
 * Admin only. Removes one row from arbitrage_top10_current.
 */
export function deleteTop10Entry(token, rank) {
  return deleteAuth(`/arbitrage/v3/top10/${rank}`, token);
}

export function arbitrageItemKey(item, source) {
  if (source === "top10") {
    return `top10-${item.rank}`;
  }
  return `audit-${item.run_id}-${item.rule_slug}-${item.home_team}-${item.away_team}-${item.line ?? ""}`;
}
