import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  className?: string;
  /** Override the data-ocid marker (defaults to "empty_state.panel") */
  ocid?: string;
  /** @deprecated use ocid instead */
  id?: string;
}

export function EmptyState({
  icon,
  message,
  className,
  ocid,
  id,
}: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid ?? id ?? "empty_state.panel"}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center opacity-40">
        {icon}
      </div>
      <p className="text-sm font-medium tracking-wide uppercase opacity-60">
        {message}
      </p>
    </div>
  );
}
