export const CLEARANCE_COLORS: Record<number, string> = {
  0: "gray",
  1: "green",
  2: "blue",
  3: "orange",
  4: "red",
};

export const CLEARANCE_LABELS: Record<number, string> = {
  0: "Unclassified",
  1: "CUI",
  2: "Secret",
  3: "Top Secret",
  4: "TS/SCI",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export const THEME = {
  navy: "#0a0e1a",
  slate: "#1a2235",
  amber: "#f59e0b",
} as const;
