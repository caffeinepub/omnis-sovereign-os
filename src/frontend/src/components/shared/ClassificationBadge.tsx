import { CLEARANCE_COLORS, CLEARANCE_LABELS } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  level: number;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-zinc-800/80 text-zinc-400 border-zinc-600",
  green: "bg-green-950/80 text-green-400 border-green-800",
  blue: "bg-blue-950/80 text-blue-400 border-blue-800",
  orange: "bg-orange-950/80 text-orange-400 border-orange-800",
  red: "bg-red-950/80 text-red-400 border-red-800",
};

export function ClassificationBadge({
  level,
  className,
}: ClassificationBadgeProps) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;

  return (
    <span
      data-ocid="classification.badge"
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
