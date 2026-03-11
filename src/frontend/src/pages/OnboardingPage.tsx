/**
 * OnboardingPage — Three-step first-login onboarding wizard.
 *
 * MOTOKO BACKLOG (DO NOT BUILD — future session):
 * - OrgAccessRequest entity (requestId, principalId, orgId, status: pending/approved/denied/confirmed)
 * - Organization entity (orgId, name, UIC, type, adminPrincipal)
 * - org-scoped invite links
 * - Backend enforcement of org placement (orgId scoping on all queries)
 * - registrationStatus on ExtendedProfile
 */

import type { ExtendedProfile } from "@/backend.d";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Static workspace list ─────────────────────────────────────────────────

interface Workspace {
  id: string;
  name: string;
  uic: string;
  type: string;
  category: string;
}

const UNIT_TYPES = [
  "Battalion",
  "Brigade",
  "Company/Platoon",
  "Division HQ",
  "Corporate",
  "Other",
] as const;

const MODES = ["Military", "Corporate"] as const;

const WORKSPACES: Workspace[] = [
  {
    id: "w1",
    name: "1-501st PIR",
    uic: "WA1AA0",
    type: "Army Infantry BN",
    category: "Military",
  },
  {
    id: "w2",
    name: "2-504th PIR",
    uic: "WA2BB0",
    type: "Army Infantry BN",
    category: "Military",
  },
  {
    id: "w3",
    name: "HHC 82nd ABN DIV",
    uic: "WA3CC0",
    type: "Army Division HQ",
    category: "Military",
  },
  {
    id: "w4",
    name: "1st BDE, 82nd ABN DIV",
    uic: "WA4DD0",
    type: "Army Brigade",
    category: "Military",
  },
  {
    id: "w5",
    name: "Corporate Workspace · Standard",
    uic: "",
    type: "Business",
    category: "Corporate",
  },
  {
    id: "w6",
    name: "Corporate Workspace · Secure",
    uic: "",
    type: "Enterprise",
    category: "Corporate",
  },
];

// ─── Step indicator ─────────────────────────────────────────────────────────

const STEP_LABELS = ["Identity Verified", "Request Access", "Submitted"];

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
                className="font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563",
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className="mx-3 mb-5 h-px w-10 transition-all duration-300"
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

// ─── Workspace card ─────────────────────────────────────────────────────────

function WorkspaceCard({
  workspace,
  index,
  selected,
  onSelect,
}: {
  workspace: Workspace;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={`onboarding.workspace.item.${index}`}
      onClick={onSelect}
      className="w-full rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: selected ? "rgba(245,158,11,0.06)" : "#0f1626",
        borderColor: selected ? "rgba(245,158,11,0.5)" : "#1a2235",
        boxShadow: selected ? "0 0 0 1px rgba(245,158,11,0.25)" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate font-mono text-xs font-semibold uppercase tracking-wider"
            style={{ color: selected ? "#f59e0b" : "#e2e8f0" }}
          >
            {workspace.name}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-500">
            {workspace.uic ? `UIC: ${workspace.uic} · ` : ""}
            {workspace.type}
          </p>
        </div>
        <span
          className="shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{
            backgroundColor:
              workspace.category === "Military"
                ? "rgba(59,130,246,0.08)"
                : "rgba(139,92,246,0.08)",
            borderColor:
              workspace.category === "Military"
                ? "rgba(59,130,246,0.3)"
                : "rgba(139,92,246,0.3)",
            color: workspace.category === "Military" ? "#60a5fa" : "#a78bfa",
          }}
        >
          {workspace.category}
        </span>
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3" style={{ color: "#f59e0b" }} />
          <span
            className="font-mono text-[9px] uppercase tracking-wider"
            style={{ color: "#f59e0b" }}
          >
            Selected
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type SubStep = "select" | "confirm";

export default function OnboardingPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  // Redirect already-registered users away from onboarding
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getMyProfile()
      .then((profile) => {
        if (!profile || !profile.registered) return;
        if (profile.isValidatedByCommander || profile.isS2Admin) {
          void navigate({ to: "/" });
        } else {
          void navigate({ to: "/pending" });
        }
      })
      .catch(() => {
        /* ignore — not registered yet */
      });
  }, [actor, isFetching, navigate]);

  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<SubStep>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittedWorkspace, setSubmittedWorkspace] =
    useState<Workspace | null>(null);
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customUnitName, setCustomUnitName] = useState("");
  const autoAdvanced = useRef(false);

  // Create workspace form state
  const [createName, setCreateName] = useState("");
  const [createUic, setCreateUic] = useState("");
  const [createType, setCreateType] = useState("");
  const [createMode, setCreateMode] = useState("");

  // Step 1: auto-advance after 1.5s
  useEffect(() => {
    if (step === 1 && !autoAdvanced.current) {
      autoAdvanced.current = true;
      const t = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const filteredWorkspaces = WORKSPACES.filter(
    (w) =>
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.uic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Show "Create New Workspace" when there's a search term and no matches
  const showCreateWorkspace =
    searchQuery.trim().length > 0 && filteredWorkspaces.length === 0;

  const canCreateWorkspace =
    createName.trim() && createUic.trim() && createType && createMode;

  const handleEstablishWorkspace = async () => {
    if (!canCreateWorkspace) return;
    const uic = createUic.trim().toUpperCase();
    const orgId = crypto.randomUUID();
    const ws = {
      name: createName.trim(),
      uic,
      type: createType,
      mode: createMode,
      createdAt: new Date().toISOString(),
    };

    // Check if UIC already exists in backend
    if (actor) {
      try {
        const existing = await actor.getOrganizationByUIC(uic);
        if (existing) {
          // UIC already taken — store the existing org and proceed
          localStorage.setItem(
            "omnis_workspace",
            JSON.stringify({ ...ws, orgId: existing.orgId }),
          );
          localStorage.setItem("omnis_founding_s2", "true");
          void navigate({ to: "/validate-commander" });
          return;
        }
        // Create new org in backend
        await actor.createOrganization({
          orgId,
          name: createName.trim(),
          uic,
          orgType: createType,
          networkMode:
            createMode === "Military" ? "military-nipr" : "corporate-standard",
          adminPrincipal: identity!.getPrincipal(),
          createdAt: BigInt(Date.now()),
        });
        localStorage.setItem("omnis_org_id", orgId);
      } catch {
        // Non-blocking — continue with localStorage-only flow
      }
    }

    localStorage.setItem("omnis_workspace", JSON.stringify(ws));
    localStorage.setItem("omnis_founding_s2", "true");
    void navigate({ to: "/validate-commander" });
  };

  const handleContinue = () => {
    if (selectedWorkspace || (showCustomUnit && customUnitName.trim()))
      setSubStep("confirm");
  };

  const effectiveWorkspace: Workspace | null =
    showCustomUnit && customUnitName.trim()
      ? {
          id: "custom",
          name: customUnitName.trim(),
          uic: "",
          type: "Custom",
          category: "Other",
        }
      : selectedWorkspace;

  const handleSubmitRequest = async () => {
    if (!effectiveWorkspace || !identity) return;
    setSubmitting(true);

    const principalId = identity.getPrincipal();
    const principalStr = principalId.toString();

    // Store request in localStorage (frontend-only; backend enforcement is a Motoko backlog item)
    localStorage.setItem(
      `omnis_org_request_${principalStr}`,
      JSON.stringify({
        workspace: effectiveWorkspace.name,
        requestedAt: new Date().toISOString(),
      }),
    );

    // Notify all S2 admins
    if (actor) {
      try {
        const allProfiles: ExtendedProfile[] = await actor.getAllProfiles();
        const s2Admins = allProfiles.filter((p) => p.isS2Admin);
        const currentProfile = allProfiles.find(
          (p) => p.principalId.toString() === principalStr,
        );
        const userName =
          currentProfile?.name || `User (${principalStr.slice(0, 8)}...)`;

        await Promise.all(
          s2Admins.map((admin) =>
            actor.createSystemNotification({
              id: crypto.randomUUID(),
              title: "New Access Request",
              body: `${userName} has requested access to ${effectiveWorkspace.name}`,
              userId: admin.principalId,
              notificationType: "access_request",
              createdAt: BigInt(Date.now()),
              read: false,
              metadata: undefined,
            }),
          ),
        );
      } catch {
        // Non-blocking: if notification fails, the request is still stored
      }
    }

    setSubmittedWorkspace(effectiveWorkspace);
    setStep(3);
    setSubmitting(false);
  };

  const displayName =
    submittedWorkspace?.name ?? effectiveWorkspace?.name ?? "your organization";

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
          {/* ── Step 1: Identity Verified ── */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
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
                  Identity Verified
                </h2>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  Your Internet Identity has been authenticated.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Continuing…
                </span>
              </div>
            </div>
          )}

          {/* ── Step 2: Select workspace ── */}
          {step === 2 && subStep === "select" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Select Your Organization
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Find and request access to your unit or organization
                  workspace.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  data-ocid="onboarding.search.input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, UIC, or type..."
                  className="w-full rounded border py-2 pl-8 pr-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: "#1a2235",
                    borderColor: "#2a3347",
                  }}
                />
              </div>

              {/* Workspace list */}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                {filteredWorkspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    index={WORKSPACES.indexOf(ws) + 1}
                    selected={selectedWorkspace?.id === ws.id}
                    onSelect={() => {
                      setSelectedWorkspace(ws);
                      setShowCustomUnit(false);
                      setCustomUnitName("");
                    }}
                  />
                ))}

                {/* Create New Workspace — appears when search has no matches */}
                {showCreateWorkspace && (
                  <div
                    className="rounded border p-4 space-y-4"
                    style={{
                      borderColor: "rgba(245,158,11,0.4)",
                      borderStyle: "dashed",
                      backgroundColor: "rgba(245,158,11,0.03)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Plus
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: "#f59e0b" }}
                      />
                      <div>
                        <p
                          className="font-mono text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: "#f59e0b" }}
                        >
                          Establish New Workspace
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-slate-500">
                          No workspace found for &ldquo;{searchQuery}&rdquo;.
                          You can establish a new isolated workspace below.
                        </p>
                      </div>
                    </div>

                    {/* Warning */}
                    <div
                      className="flex items-start gap-2 rounded border px-3 py-2"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.05)",
                        borderColor: "rgba(245,158,11,0.15)",
                      }}
                    >
                      <AlertTriangle
                        className="mt-0.5 h-3 w-3 shrink-0"
                        style={{ color: "#f59e0b" }}
                      />
                      <p className="font-mono text-[9px] leading-relaxed text-amber-400/70">
                        This will create a new isolated workspace. You will be
                        assigned as Provisional S2 Administrator.
                      </p>
                    </div>

                    {/* Create form */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label
                          htmlFor="create-unit-name"
                          className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                        >
                          Unit Name
                        </label>
                        <input
                          id="create-unit-name"
                          data-ocid="onboarding.create.name.input"
                          type="text"
                          value={createName}
                          onChange={(e) => setCreateName(e.target.value)}
                          placeholder="1-501st PIR"
                          className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#0a0e1a",
                            borderColor: "#2a3347",
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="create-unit-uic"
                          className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                        >
                          Unit Identification Code (UIC)
                        </label>
                        <input
                          id="create-unit-uic"
                          data-ocid="onboarding.create.uic.input"
                          type="text"
                          value={createUic}
                          onChange={(e) =>
                            setCreateUic(e.target.value.toUpperCase())
                          }
                          placeholder="WH9RT0"
                          maxLength={8}
                          className="w-full rounded border px-3 py-1.5 font-mono text-xs uppercase text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#0a0e1a",
                            borderColor: "#2a3347",
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label
                            htmlFor="create-unit-type"
                            className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                          >
                            Unit Type
                          </label>
                          <select
                            id="create-unit-type"
                            data-ocid="onboarding.create.type.select"
                            value={createType}
                            onChange={(e) => setCreateType(e.target.value)}
                            className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#0a0e1a",
                              borderColor: "#2a3347",
                            }}
                          >
                            <option value="">Select type…</option>
                            {UNIT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="create-unit-mode"
                            className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                          >
                            Mode
                          </label>
                          <select
                            id="create-unit-mode"
                            data-ocid="onboarding.create.mode.select"
                            value={createMode}
                            onChange={(e) => setCreateMode(e.target.value)}
                            className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#0a0e1a",
                              borderColor: "#2a3347",
                            }}
                          >
                            <option value="">Select mode…</option>
                            {MODES.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        data-ocid="onboarding.create.establish.primary_button"
                        disabled={!canCreateWorkspace}
                        onClick={handleEstablishWorkspace}
                        className="h-9 w-full rounded font-mono text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          backgroundColor: canCreateWorkspace
                            ? "#f59e0b"
                            : "#1a2235",
                          color: canCreateWorkspace ? "#0a0e1a" : "#4b5563",
                        }}
                      >
                        Establish Workspace
                      </button>
                    </div>
                  </div>
                )}

                {/* No results and no search — empty list state */}
                {!showCreateWorkspace && filteredWorkspaces.length === 0 && (
                  <p className="py-4 text-center font-mono text-[10px] text-slate-600">
                    No workspaces found. Type a UIC or unit name to search.
                  </p>
                )}

                {/* "Request Custom Access" option (was "My unit isn't listed") */}
                <button
                  type="button"
                  data-ocid="onboarding.custom_unit.toggle"
                  onClick={() => {
                    setShowCustomUnit((v) => !v);
                    setSelectedWorkspace(null);
                  }}
                  className="flex w-full items-center gap-2 rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    backgroundColor: showCustomUnit
                      ? "rgba(245,158,11,0.06)"
                      : "transparent",
                    borderColor: showCustomUnit
                      ? "rgba(245,158,11,0.4)"
                      : "#2a3347",
                    borderStyle: "dashed",
                  }}
                >
                  <ChevronDown
                    className="h-3 w-3 transition-transform shrink-0"
                    style={{
                      color: "#64748b",
                      transform: showCustomUnit
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Request Custom Access
                  </span>
                </button>

                {showCustomUnit && (
                  <div
                    className="space-y-2 rounded border px-4 py-3"
                    style={{
                      backgroundColor: "#0a111f",
                      borderColor: "#1e2d45",
                    }}
                  >
                    <input
                      data-ocid="onboarding.custom_unit.input"
                      type="text"
                      value={customUnitName}
                      onChange={(e) => setCustomUnitName(e.target.value)}
                      placeholder="Enter your unit or organization name..."
                      className="w-full rounded border bg-transparent py-2 px-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                      style={{ borderColor: "#2a3347" }}
                    />
                    <p className="font-mono text-[9px] leading-relaxed text-slate-600">
                      Submit a custom access request. Your S2 admin will review
                      your request.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                data-ocid="onboarding.continue_button"
                disabled={
                  !selectedWorkspace &&
                  !(showCustomUnit && customUnitName.trim())
                }
                onClick={handleContinue}
                className="mt-2 h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor:
                    selectedWorkspace ||
                    (showCustomUnit && customUnitName.trim())
                      ? "#f59e0b"
                      : "#1a2235",
                  color:
                    selectedWorkspace ||
                    (showCustomUnit && customUnitName.trim())
                      ? "#0a0e1a"
                      : "#4b5563",
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Step 2 sub-step: Confirm ── */}
          {step === 2 && subStep === "confirm" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Confirm Organization
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Please verify this is correct before submitting your request.
                </p>
              </div>

              {/* Confirmation box */}
              <div
                className="rounded border px-4 py-4"
                style={{
                  backgroundColor: "rgba(245,158,11,0.04)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Requesting access to
                </p>
                <p
                  className="mt-1 font-mono text-sm font-bold uppercase tracking-wider"
                  style={{ color: "#f59e0b" }}
                >
                  {effectiveWorkspace?.name}
                </p>
                {effectiveWorkspace?.uic && (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                    UIC: {effectiveWorkspace.uic} · {effectiveWorkspace.type}
                  </p>
                )}
                {showCustomUnit && (
                  <p className="mt-1 font-mono text-[9px] text-slate-600">
                    Custom workspace — will be created when your S2 admin
                    activates the system.
                  </p>
                )}
              </div>

              <p className="font-mono text-xs text-slate-500">
                Is this correct?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="onboarding.cancel_button"
                  onClick={() => setSubStep("select")}
                  disabled={submitting}
                  className="h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40"
                  style={{ borderColor: "#2a3347" }}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  data-ocid="onboarding.confirm_button"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="h-10 flex-1 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Submitted ── */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  borderColor: "rgba(245,158,11,0.35)",
                }}
              >
                <CheckCircle2
                  className="h-8 w-8"
                  style={{ color: "#f59e0b" }}
                />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Request Submitted
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-500">
                  Your request to join{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {displayName}
                  </span>{" "}
                  is pending approval by your S2 or security officer.
                </p>
                <p className="mt-2 font-mono text-xs text-slate-600">
                  You will be notified once your access is confirmed.
                </p>
              </div>

              <button
                type="button"
                data-ocid="onboarding.finish_button"
                onClick={() => void navigate({ to: "/pending" })}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Continue to Omnis
              </button>
            </div>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700">
          Access is strictly monitored. Unauthorized requests are logged.
        </p>
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}
