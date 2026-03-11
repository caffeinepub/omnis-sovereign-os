/**
 * ClaimCommanderPage — One-time Commander role claim.
 * Accessible to any authenticated user; guards against duplicate claims.
 *
 * MOTOKO BACKLOG (frontend-enforced only):
 * - Organization entity (orgId, name, UIC, type, mode, adminPrincipal, createdAt)
 * - Org uniqueness enforcement (one workspace per UIC)
 * - orgId scoping on ALL entities (Profile, Folder, Document, Message, Notification, etc.)
 * - Commander role constraint (only one per org, backend-enforced)
 * - Provisional S2 status with expiry (time-bound flag on ExtendedProfile)
 * - RoleApprovalRequest entity (commander handoff co-sign, S2 promotion approval)
 * - OrgAccessRequest entity (3-way confirm: user requests → approver accepts → user confirms)
 * - UIC squatting prevention (first-come ownership, challenge mechanism optional)
 */

import type { ExtendedProfile } from "@/backend.d";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

export default function ClaimCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Check if commander seat is already occupied
    const occupied = localStorage.getItem("omnis_commander_claimed") === "true";
    setAlreadyClaimed(occupied);

    // Load workspace info
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
  }, []);

  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    try {
      // Store claim in localStorage
      localStorage.setItem("omnis_commander_claimed", "true");

      // Send system notification to S2 admins
      if (actor && identity) {
        try {
          const allProfiles: ExtendedProfile[] = await actor.getAllProfiles();
          const s2Admins = allProfiles.filter((p) => p.isS2Admin);
          const unitName = workspace?.name ?? "this workspace";

          await Promise.all(
            s2Admins.map((admin) =>
              actor.createSystemNotification({
                id: crypto.randomUUID(),
                title: "Commander Role Claimed",
                body: `Commander role has been claimed for ${unitName}. Chain of Trust is now established.`,
                userId: admin.principalId,
                notificationType: "system",
                createdAt: BigInt(Date.now()),
                read: false,
                metadata: undefined,
              }),
            ),
          );
        } catch {
          // Non-blocking
        }
      }

      setClaimed(true);
      setShowConfirmDialog(false);

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2000);
    } catch {
      // Even if actor call fails, localStorage is set — claim succeeds
      setClaimed(true);
      setShowConfirmDialog(false);
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2000);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <button
          type="button"
          data-ocid="claim_commander.back.button"
          onClick={() => void navigate({ to: "/" })}
          className="mb-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-400"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Return to Hub
        </button>

        {/* Already claimed state */}
        {alreadyClaimed && (
          <div
            className="rounded-lg border p-8 text-center shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                borderColor: "rgba(245,158,11,0.4)",
              }}
            >
              <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
            </div>
            <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
              Commander Seat Occupied
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
              The Commander role for this workspace has already been claimed.
            </p>
            <button
              type="button"
              data-ocid="claim_commander.return.button"
              onClick={() => void navigate({ to: "/" })}
              className="mt-5 h-10 w-full rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              style={{ borderColor: "#2a3347" }}
            >
              Return to Hub
            </button>
          </div>
        )}

        {/* Success state */}
        {!alreadyClaimed && claimed && (
          <div
            className="rounded-lg border p-8 text-center shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                borderColor: "rgba(34,197,94,0.4)",
              }}
            >
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
              Commander Role Claimed
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
              The Chain of Trust is now established. Redirecting to the hub…
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Redirecting…
              </span>
            </div>
          </div>
        )}

        {/* Main claim UI */}
        {!alreadyClaimed && !claimed && (
          <div
            className="rounded-lg border p-6 shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {/* Header */}
            <div className="mb-5 flex flex-col items-center gap-3 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                }}
              >
                <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
              </div>
              <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                Claim Commander Role
              </h1>
            </div>

            {/* Warning box */}
            <div
              className="mb-4 rounded border px-4 py-3"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  This role can only be claimed once. Ensure you are the
                  designated commander or authorized officer before proceeding.
                </p>
              </div>
            </div>

            {/* Workspace display */}
            {workspace && (
              <div
                className="mb-4 rounded border px-4 py-3"
                style={{ backgroundColor: "#0a0e1a", borderColor: "#1e2d40" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Workspace
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold uppercase tracking-wider text-white">
                  {workspace.name}
                </p>
                {workspace.uic && (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                    UIC: {workspace.uic} · {workspace.type}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              data-ocid="claim_commander.claim.primary_button"
              onClick={() => setShowConfirmDialog(true)}
              className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              Claim Commander Role
            </button>
          </div>
        )}
      </div>

      {/* Confirmation AlertDialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            data-ocid="claim_commander.confirm.dialog"
            className="mx-4 w-full max-w-sm rounded-lg border p-6 shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: "#f59e0b" }}
              />
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                  Confirm Commander Claim
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  Are you sure? This action cannot be undone. You are claiming
                  the Commander role for{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {workspace?.name ?? "this workspace"}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="claim_commander.confirm.cancel_button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClaiming}
                className="h-9 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40"
                style={{ borderColor: "#2a3347" }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="claim_commander.confirm.confirm_button"
                onClick={() => void handleConfirmClaim()}
                disabled={isClaiming}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Claiming…
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}
