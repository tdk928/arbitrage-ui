import { ApiError } from "../api/http.js";

export function accessDeniedPathForError(error) {
  if (!(error instanceof ApiError)) return null;

  if (error.status === 401) {
    return { pathname: "/access-denied", state: { reason: "auth", detail: error.message } };
  }

  if (error.status === 403) {
    if (error.message === "Active subscription required") {
      return {
        pathname: "/access-denied",
        state: { reason: "subscription", detail: error.message },
      };
    }
    return {
      pathname: "/access-denied",
      state: { reason: "forbidden", detail: error.message },
    };
  }

  return null;
}
