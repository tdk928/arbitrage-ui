export function getUserRole(user) {
  return user?.role === "admin" ? "admin" : "client";
}

export function isAdminUser(user) {
  return getUserRole(user) === "admin";
}
