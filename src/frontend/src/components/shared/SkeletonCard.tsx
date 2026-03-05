import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonCard({ width, height, className }: SkeletonCardProps) {
  return (
    <Skeleton
      data-ocid="skeleton.loading_state"
      className={cn("rounded-md bg-muted", className)}
      style={{ width, height }}
    />
  );
}
