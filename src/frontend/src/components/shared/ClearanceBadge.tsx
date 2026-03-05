import { CLEARANCE_COLORS, CLEARANCE_LABELS } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ClearanceBadgeProps {
  level: number;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-zinc-700/60 text-zinc-300 border-zinc-600",
  green: "bg-green-900/60 text-green-300 border-green-700",
  blue: "bg-blue-900/60 text-blue-300 border-blue-700",
  orange: "bg-orange-900/60 text-orange-300 border-orange-700",
  red: "bg-red-900/60 text-red-300 border-red-700",
};

export function ClearanceBadge({ level, className }: ClearanceBadgeProps) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;

  return (
    <span
      data-ocid="clearance.badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
