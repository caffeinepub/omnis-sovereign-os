/**
 * WorkspaceSetupPage — 4-step wizard after founding S2 activation.
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

import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Unit Details",
  "S2 Confirmed",
  "Await Commander",
  "Trust Established",
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? "rgba(34,197,94,0.15)"
                    : isActive
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(255,255,255,0.04)",
                  borderColor: isDone
                    ? "rgba(34,197,94,0.5)"
                    : isActive
                      ? "rgba(245,158,11,0.6)"
                      : "#2a3347",
                  color: isDone ? "#22c55e" : isActive ? "#f59e0b" : "#4b5563",
                }}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className="hidden font-mono text-[9px] uppercase tracking-wider sm:block"
                style={{
                  color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563",
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className="mx-2 mb-5 h-px w-8 transition-all duration-300 sm:mx-3 sm:w-10"
                style={{
                  backgroundColor:
                    stepNum < currentStep ? "rgba(34,197,94,0.4)" : "#2a3347",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className="font-mono text-xs font-semibold text-white"
        style={{ letterSpacing: "0.05em" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [_commanderClaimed, setCommanderClaimed] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load workspace from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
  }, []);

  // Poll for commander claim when on step 3
  const checkCommanderClaim = useCallback(() => {
    const claimed = localStorage.getItem("omnis_commander_claimed") === "true";
    setCommanderClaimed(claimed);
    if (claimed) {
      setStep(4);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      checkCommanderClaim(); // immediate check
      pollingRef.current = setInterval(checkCommanderClaim, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, checkCommanderClaim]);

  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim-commander`
      : "/claim-commander";

  const handleCopyClaimUrl = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      toast.success("Claim link copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
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

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8">
        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div
          className="rounded-lg border p-6 shadow-2xl"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          {/* ── Step 1: Confirm Unit Details ── */}
          {step === 1 && workspace && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Confirm Unit Details
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Review the workspace configuration before proceeding.
                </p>
              </div>

              {/* Read-only details card */}
              <div
                className="grid grid-cols-2 gap-4 rounded border p-4"
                style={{
                  backgroundColor: "rgba(245,158,11,0.03)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <ReadOnlyField label="Unit Name" value={workspace.name} />
                <ReadOnlyField
                  label="Unit Identification Code (UIC)"
                  value={workspace.uic || "N/A"}
                />
                <ReadOnlyField label="Unit Type" value={workspace.type} />
                <ReadOnlyField label="Mode" value={workspace.mode} />
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.confirm.primary_button"
                onClick={() => setStep(2)}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Confirm &amp; Continue
              </button>
            </div>
          )}

          {/* ── Step 2: Provisional S2 Confirmed ── */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(34,197,94,0.1)",
                  borderColor: "rgba(34,197,94,0.4)",
                }}
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Provisional S2 Established
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  You have been assigned as Provisional S2 Administrator for{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {workspace?.name ?? "your workspace"}
                  </span>
                  . You can now approve incoming personnel. Your status will be
                  upgraded to Official S2 once the Commander establishes their
                  role.
                </p>
              </div>

              {/* Info box */}
              <div
                className="w-full rounded border px-4 py-3 text-left"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  Your workspace is secured by frontend enforcement. Full
                  cryptographic isolation will be enforced in a future backend
                  update.
                </p>
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.s2_confirmed.primary_button"
                onClick={() => setStep(3)}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Continue to Commander Setup
              </button>
            </div>
          )}

          {/* ── Step 3: Await Commander ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.08)",
                    borderColor: "rgba(245,158,11,0.35)",
                  }}
                >
                  <ShieldCheck
                    className="h-7 w-7"
                    style={{ color: "#f59e0b" }}
                  />
                </div>
                <div>
                  <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                    Establish Chain of Trust
                  </h2>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-400">
                    A second authorized person must claim the Commander role to
                    complete the two-person chain of trust. Until then, your S2
                    role is provisional.
                  </p>
                </div>
              </div>

              {/* Share section */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Commander Claim Link
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-2 font-mono text-[10px] text-slate-300"
                    style={{
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347",
                    }}
                  >
                    {claimUrl}
                  </code>
                  <button
                    type="button"
                    data-ocid="workspace_setup.copy_claim_link.button"
                    onClick={() => void handleCopyClaimUrl()}
                    className="flex items-center gap-1.5 rounded border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
                    style={{
                      borderColor: "rgba(245,158,11,0.4)",
                      color: "#f59e0b",
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                  Share this link with your Commander or designated officer.
                  They must log in with their Internet Identity and claim the
                  Commander role.
                </p>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Waiting for Commander to claim role...
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="workspace_setup.skip.secondary_button"
                  onClick={() => void navigate({ to: "/" })}
                  className="h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
                  style={{ borderColor: "#2a3347" }}
                >
                  Skip for Now — Go to Hub
                </button>
                <button
                  type="button"
                  data-ocid="workspace_setup.poll.primary_button"
                  onClick={checkCommanderClaim}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded border font-mono text-xs uppercase tracking-wider transition-colors hover:bg-amber-500/5"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Check Now
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Chain of Trust Established ── */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                }}
              >
                <ShieldCheck className="h-8 w-8" style={{ color: "#f59e0b" }} />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Chain of Trust Established
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  The Commander role has been claimed. Both seats are now
                  filled. Omnis is ready for full operation.
                </p>
              </div>

              {/* Confirmation cards */}
              <div className="flex w-full gap-3">
                <div
                  className="flex flex-1 items-center gap-2 rounded border px-3 py-2"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.06)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }}
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                    S2 Official
                  </span>
                </div>
                <div
                  className="flex flex-1 items-center gap-2 rounded border px-3 py-2"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.06)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }}
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                    Commander
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.enter.primary_button"
                onClick={() => void navigate({ to: "/" })}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Enter Omnis
              </button>
            </div>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700">
          {step < 4
            ? "Both seats must be filled before the chain of trust is complete."
            : "Workspace is operational. All access is monitored."}
        </p>
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}
