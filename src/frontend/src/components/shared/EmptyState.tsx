import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  className?: string;
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state.panel"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
    >
      <div className="text-4xl opacity-40">{icon}</div>
      <p className="text-sm font-medium tracking-wide uppercase opacity-60">
        {message}
      </p>
    </div>
  );
}
