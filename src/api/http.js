export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function readJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof data.detail === "string" ? data.detail : `HTTP ${response.status}`;
    throw new ApiError(detail, response.status);
  }
  return data;
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}
