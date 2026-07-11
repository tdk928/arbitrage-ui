import { getStoredToken } from "../auth/token.js";

async function deleteJson(path, token, body) {
  const response = await fetch(path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new Error(detail);
  }

  return data;
}

async function deleteAuth(path, token) {
  const response = await fetch(path, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new Error(detail);
  }

  return data;
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
