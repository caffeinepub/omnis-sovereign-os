import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a display name in DoD standard: RANK LAST, First MI
 * MI is omitted if blank. All parts are trimmed.
 * Example: formatDisplayName("SGT", "SMITH", "John", "A") → "SGT SMITH, John A"
 */
export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi: string,
): string {
  const trimRank = rank.trim();
  const trimLast = lastName.trim().toUpperCase();
  const trimFirst = firstName.trim();
  const trimMi = mi.trim().charAt(0).toUpperCase();

  const parts: string[] = [];

  if (trimRank) parts.push(trimRank);

  let namePart = "";
  if (trimLast && trimFirst) {
    namePart = `${trimLast}, ${trimFirst}`;
  } else if (trimLast) {
    namePart = trimLast;
  } else if (trimFirst) {
    namePart = trimFirst;
  }

  if (namePart) parts.push(namePart);
  if (trimMi) parts.push(trimMi);

  return parts.join(" ");
}

/**
 * Parses a display name back into parts. Best-effort.
 * Handles formats like "SGT SMITH, John A" or "SMITH, John A" or "John Smith"
 */
export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  const commaIdx = displayName.indexOf(",");
  if (commaIdx > -1) {
    const beforeComma = displayName.slice(0, commaIdx).trim();
    const afterComma = displayName.slice(commaIdx + 1).trim();
    const beforeParts = beforeComma.split(/\s+/);

    let rank = "";
    let lastName = "";
    if (beforeParts.length >= 2) {
      rank = beforeParts.slice(0, -1).join(" ");
      lastName = beforeParts[beforeParts.length - 1] ?? "";
    } else {
      lastName = beforeParts[0] ?? "";
    }

    const afterParts = afterComma.split(/\s+/);
    const firstName = afterParts[0] ?? "";
    const mi = afterParts[1] ?? "";

    return { rank, lastName, firstName, mi };
  }

  // No comma — just split words
  const parts = displayName.trim().split(/\s+/);
  return {
    rank: "",
    lastName: parts[0] ?? "",
    firstName: parts[1] ?? "",
    mi: parts[2] ?? "",
  };
}
