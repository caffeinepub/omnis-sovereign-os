/**
 * ChainOfTrustPanel — Two-seat chain of trust status display.
 * Reads from localStorage (frontend-enforced only until Motoko backend session).
 *
 * MOTOKO BACKLOG (frontend-enforced only):
 * - Organization entity (orgId, name, UIC, type, mode, adminPrincipal, createdAt)
 * - Commander role constraint (only one per org, backend-enforced)
 * - Provisional S2 status with expiry (time-bound flag on ExtendedProfile)
 * - RoleApprovalRequest entity (commander handoff co-sign, S2 promotion approval)
 */

import { Check, Copy, ShieldCheck, ShieldOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

interface ChainOfTrustPanelProps {
  compact?: boolean;
}

export function ChainOfTrustPanel({ compact = false }: ChainOfTrustPanelProps) {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [hasFoundingS2, setHasFoundingS2] = useState(false);
  const [commanderClaimed, setCommanderClaimed] = useState(false);

  const loadState = useCallback(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
    setHasFoundingS2(localStorage.getItem("omnis_founding_s2") === "true");
    setCommanderClaimed(
      localStorage.getItem("omnis_commander_claimed") === "true",
    );
  }, []);

  useEffect(() => {
    loadState();
    // Poll for commander claim every 5s while panel is mounted
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [loadState]);

  const bothSeated = hasFoundingS2 && commanderClaimed;

  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim-commander`
      : "/claim-commander";

  const handleCopyClaimLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      toast.success("Claim link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (!workspace && !hasFoundingS2) return null;

  // ── Compact view ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <SeatRow
          label="S2 Administrator"
          status={
            hasFoundingS2 ? (bothSeated ? "official" : "provisional") : "vacant"
          }
          compact
        />
        <SeatRow
          label="Commander"
          status={commanderClaimed ? "claimed" : "vacant-awaiting"}
          compact
        />
      </div>
    );
  }

  // ── Full view ─────────────────────────────────────────────────────────────
  return (
    <div
      data-ocid="admin.trust.panel"
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <ShieldCheck className="h-4 w-4" style={{ color: "#f59e0b" }} />
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
          Chain of Trust
        </h3>
        {workspace && (
          <span className="ml-auto font-mono text-[10px] text-slate-500">
            {workspace.name} {workspace.uic ? `· UIC ${workspace.uic}` : ""}
          </span>
        )}
      </div>

      {/* Seat rows */}
      <div
        className="divide-y p-4 space-y-0"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="py-3">
          <SeatRow
            label="S2 Administrator"
            status={
              hasFoundingS2
                ? bothSeated
                  ? "official"
                  : "provisional"
                : "vacant"
            }
          />
        </div>
        <div className="py-3">
          <SeatRow
            label="Commander"
            status={commanderClaimed ? "claimed" : "vacant-awaiting"}
          />
        </div>
      </div>

      {/* Status banners */}
      {!compact && (
        <div className="px-4 pb-4">
          {bothSeated ? (
            <div
              className="flex items-center gap-2.5 rounded px-4 py-3"
              style={{
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Check
                className="h-4 w-4 shrink-0"
                style={{ color: "#22c55e" }}
              />
              <p className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                Chain of Trust Established — Both seats are filled
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col gap-3 rounded px-4 py-3"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <ShieldOff
                  className="h-4 w-4 shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  Awaiting Commander — Share claim link to complete setup
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-1.5 font-mono text-[10px] text-slate-300"
                  style={{
                    backgroundColor: "#0a0e1a",
                    borderColor: "#2a3347",
                  }}
                >
                  {claimUrl}
                </code>
                <button
                  type="button"
                  data-ocid="admin.trust.copy_claim_link.button"
                  onClick={() => void handleCopyClaimLink()}
                  className="flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Seat row ──────────────────────────────────────────────────────────────────

type SeatStatus =
  | "provisional"
  | "official"
  | "claimed"
  | "vacant"
  | "vacant-awaiting";

function SeatRow({
  label,
  status,
  compact = false,
}: {
  label: string;
  status: SeatStatus;
  compact?: boolean;
}) {
  const badgeConfig: Record<
    SeatStatus,
    {
      label: string;
      color: string;
      bg: string;
      border: string;
      pulse?: boolean;
    }
  > = {
    provisional: {
      label: "Provisional",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
    },
    official: {
      label: "Official",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
    },
    claimed: {
      label: "Claimed",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
    },
    vacant: {
      label: "Vacant",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
    },
    "vacant-awaiting": {
      label: "Vacant — Awaiting",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
      pulse: true,
    },
  };

  const cfg = badgeConfig[status];

  return (
    <div
      className={`flex items-center justify-between gap-3 ${compact ? "" : "py-1"}`}
    >
      <span className="font-mono text-xs text-slate-400">{label}</span>
      <span
        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider${cfg.pulse ? " animate-pulse" : ""}`}
        style={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}
