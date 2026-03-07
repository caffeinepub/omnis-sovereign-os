/**
 * Shared formatting utilities for Omnis Sovereign OS.
 * Import from here instead of duplicating across pages.
 */

/**
 * Formats a bigint nanosecond timestamp as a human-readable relative time string.
 * e.g. "just now", "2m ago", "3h ago", "5d ago"
 */
export function formatRelativeTime(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  const now = Date.now();
  const diffMs = now - ms;

  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Formats a bigint nanosecond timestamp as a locale date string.
 */
export function formatDate(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a bigint nanosecond timestamp as a locale date+time string.
 */
export function formatDateTime(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Resolves a display name from an ExtendedProfile.
 * Returns "RANK NAME" if rank is present, otherwise just the name.
 * Falls back to the provided fallback string (default "Unknown").
 */
export function getProfileName(
  profile: { name?: string; rank?: string } | null | undefined,
  fallback = "Unknown",
): string {
  if (!profile) return fallback;
  const parts = [profile.rank, profile.name].filter(Boolean);
  return parts.join(" ").trim() || fallback;
}

/**
 * Returns uppercase initials from a name string (up to 2 words).
 * Returns "??" for empty/blank input.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return "??";
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
