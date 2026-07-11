/** @typedef {"anonymous" | "client" | "admin"} UserRole */

/**
 * @typedef {Object} AuthSession
 * @property {UserRole} role
 * @property {string | null} email
 * @property {boolean} hasActiveSubscription
 * @property {number | null} expiresAt
 */

/**
 * @typedef {Object} TokenClaims
 * @property {string} sub
 * @property {string} email
 * @property {"client" | "admin"} role
 * @property {boolean} has_active_subscription
 * @property {number} iat
 * @property {number} exp
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token
 * @property {string} token_type
 * @property {number} expires_in
 */

/**
 * @typedef {Object} UserListItem
 * @property {string} email
 * @property {"client" | "admin"} role
 * @property {string | null} phone
 * @property {string | null} valid_from
 * @property {string | null} valid_to
 */

/**
 * @typedef {Object} UserListResponse
 * @property {number} count
 * @property {UserListItem[]} users
 */

export {};
