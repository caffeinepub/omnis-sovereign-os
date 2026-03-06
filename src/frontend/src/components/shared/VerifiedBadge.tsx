import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  "data-ocid"?: string;
}

export function VerifiedBadge({ "data-ocid": dataOcid }: VerifiedBadgeProps) {
  return (
    <span
      data-ocid={dataOcid}
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b",
      }}
    >
      <ShieldCheck className="h-2.5 w-2.5" />
      Verified
    </span>
  );
}
