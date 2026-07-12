import { authHeaders, readJsonResponse } from "../api/http.js";

async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return readJsonResponse(response);
}

async function getJson(path, token) {
  const response = await fetch(path, {
    headers: authHeaders(token),
  });

  return readJsonResponse(response);
}

async function postAuth(path, token) {
  const response = await fetch(path, {
    method: "POST",
    headers: authHeaders(token),
  });

  return readJsonResponse(response);
}

async function patchJson(path, token, body) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });

  return readJsonResponse(response);
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

/**
 * POST /auth/users/{email}/deactivate
 * Admin only. Clears valid_from & valid_to (sets both to null in DB).
 */
export function deactivateUser(token, email) {
  return postAuth(
    `/auth/users/${encodeURIComponent(email)}/deactivate`,
    token
  );
}
