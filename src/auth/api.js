async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((e) => e.msg).join(", ")
          : "Request failed";
    throw new Error(detail);
  }

  return data;
}

async function getJson(path, token) {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new Error(detail);
  }

  return data;
}

async function postAuth(path, token) {
  const response = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new Error(detail);
  }

  return data;
}

async function patchJson(path, token, body) {
  const response = await fetch(path, {
    method: "PATCH",
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

export function register(email, password) {
  return postJson("/auth/register", { email, password });
}

export function login(email, password) {
  return postJson("/auth/login", { email, password });
}

export function fetchUsers(token) {
  return getJson("/auth/users", token);
}

/**
 * PATCH /auth/users/{email}
 * Admin only. Partial update — send only fields to change.
 */
export function updateUser(token, email, patch) {
  const body = {};
  if ("phone" in patch) body.phone = patch.phone;
  if ("valid_from" in patch) body.valid_from = patch.valid_from;
  if ("valid_to" in patch) body.valid_to = patch.valid_to;

  return patchJson(`/auth/users/${encodeURIComponent(email)}`, token, body);
}

/**
 * POST /auth/users/{email}/activate
 * Admin only. Sets valid_from = now, valid_to = now + 24h (UTC).
 */
export function activateUser(token, email) {
  return postAuth(
    `/auth/users/${encodeURIComponent(email)}/activate`,
    token
  );
}
