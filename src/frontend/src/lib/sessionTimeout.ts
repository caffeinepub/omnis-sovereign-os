export type SessionUserRole = "guest" | "user" | "admin" | "s2admin";
export type SessionNetworkMode =
  | "military-nipr"
  | "military-sipr"
  | "corporate-standard"
  | "corporate-secure"
  | null;

/**
 * Returns idle timeout in ms based on role and network mode.
 * Returns 0 for guest/pre-auth routes (no timeout).
 */
export function getTimeoutMs(
  role: SessionUserRole,
  networkMode?: SessionNetworkMode,
): number {
  if (networkMode === "military-sipr") return 15 * 60 * 1000;
  if (role === "s2admin" || role === "admin") return 30 * 60 * 1000;
  if (role === "user") return 60 * 60 * 1000;
  return 0;
}

/** Returns the warn threshold — 5 minutes before expiry. */
export function getWarnAfterMs(timeoutMs: number): number {
  return timeoutMs - 5 * 60 * 1000;
}

/** Returns the expiry threshold — timeout + 2 minutes grace. */
export function getExpireAfterMs(timeoutMs: number): number {
  return timeoutMs + 2 * 60 * 1000;
}

/** Human-readable tier label shown in the warning dialog. */
export function getTierLabel(
  role: SessionUserRole,
  networkMode?: SessionNetworkMode,
): string {
  if (networkMode === "military-sipr")
    return "SIPR sessions have a 15-minute security window.";
  if (role === "s2admin" || role === "admin")
    return "S2 admin sessions expire after 30 minutes of inactivity.";
  return "Standard sessions expire after 60 minutes of inactivity.";
}
