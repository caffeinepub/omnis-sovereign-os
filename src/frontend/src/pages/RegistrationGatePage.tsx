import type { Organization } from "@/backend.d";
import { RankSelector } from "@/components/shared/RankSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName } from "@/lib/displayName";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Step = 1 | 2 | 3;
type OrgMode = "Military" | "Corporate";

interface BasicInfo {
  lastName: string;
  firstName: string;
  mi: string;
  branch: string;
  category: string;
  rank: string;
  email: string;
  orgRole: string;
}

interface FoundWorkspace {
  name: string;
  uic: string;
  type: string;
  orgId: string;
}

interface OrgInfo {
  mode: OrgMode;
  uic: string;
  orgName: string;
  businessId: string;
  orgType: string;
  isNew: boolean;
  skipCommander: boolean;
  foundWorkspace: FoundWorkspace | null;
}

const MILITARY_ROLES = ["Soldier", "NCO", "Officer", "Civilian", "Contractor"];
const CORPORATE_ROLES = ["Employee", "Manager", "Director", "Contractor"];
const ORG_TYPES = [
  "Battalion",
  "Brigade",
  "Company/Platoon",
  "Division HQ",
  "Corporate",
  "Other",
];

export default function RegistrationGatePage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { mode: networkMode } = useNetworkMode();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    lastName: "",
    firstName: "",
    mi: "",
    branch: "",
    category: "",
    rank: "",
    email: "",
    orgRole: "",
  });
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    mode: "Military",
    uic: "",
    orgName: "",
    businessId: "",
    orgType: "",
    isNew: false,
    skipCommander: false,
    foundWorkspace: null,
  });

  const [uicSearching, setUicSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Retry counter for doSearch when actor isn't ready yet
  const searchRetryCount = useRef(0);

  // Redirect already-registered users
  useEffect(() => {
    if (!actor || isFetching) return;
    if (hasRedirected.current) return;
    actor
      .getMyProfile()
      .then((profile) => {
        if (!profile || !profile.registered) return;
        if (hasRedirected.current) return;
        hasRedirected.current = true;
        if (!profile.isValidatedByCommander && !profile.isS2Admin) {
          void navigate({ to: "/pending" });
        } else {
          void navigate({ to: "/" });
        }
      })
      .catch(() => {});
  }, [actor, isFetching, navigate]);

  // UIC / org search (debounced, only called on Step 2)
  const doSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setOrgInfo((prev) => ({ ...prev, isNew: false, foundWorkspace: null }));
        setSearchDone(false);
        setUicSearching(false);
        searchRetryCount.current = 0;
        return;
      }
      // If actor isn't ready, retry once after 1 second instead of silently failing
      if (!actor) {
        setUicSearching(false);
        setSearchDone(false);
        if (searchRetryCount.current < 1) {
          searchRetryCount.current += 1;
          setTimeout(() => void doSearch(query), 1000);
        }
        return;
      }
      searchRetryCount.current = 0;
      setUicSearching(true);
      try {
        let found: Organization | null = null;
        if (orgInfo.mode === "Military") {
          found = await actor.getOrganizationByUIC(query.toUpperCase());
        } else {
          // For corporate, search by name via getAllProfiles (no org name search endpoint)
          found = await actor.getOrganizationByUIC(query.toUpperCase());
        }
        if (found) {
          setOrgInfo((prev) => ({
            ...prev,
            isNew: false,
            foundWorkspace: {
              name: found!.name,
              uic: found!.uic,
              type: found!.orgType,
              orgId: found!.orgId,
            },
          }));
        } else {
          setOrgInfo((prev) => ({
            ...prev,
            isNew: false,
            foundWorkspace: null,
          }));
        }
      } catch {
        setOrgInfo((prev) => ({ ...prev, isNew: false, foundWorkspace: null }));
      } finally {
        setUicSearching(false);
        setSearchDone(true);
      }
    },
    [actor, orgInfo.mode],
  );

  const handleUicChange = (val: string) => {
    setOrgInfo((prev) => ({
      ...prev,
      uic: val,
      foundWorkspace: null,
      isNew: false,
    }));
    setSearchDone(false);
    searchRetryCount.current = 0;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) return;
    searchTimer.current = setTimeout(() => doSearch(val), 500);
  };

  const handleOrgNameChange = (val: string) => {
    setOrgInfo((prev) => ({
      ...prev,
      orgName: val,
      foundWorkspace: null,
      isNew: false,
    }));
    setSearchDone(false);
    searchRetryCount.current = 0;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) return;
    searchTimer.current = setTimeout(() => doSearch(val), 500);
  };

  const step1Valid =
    basicInfo.lastName.trim() &&
    basicInfo.firstName.trim() &&
    basicInfo.rank &&
    basicInfo.orgRole;

  const step2Valid =
    orgInfo.foundWorkspace !== null ||
    (orgInfo.isNew &&
      ((orgInfo.mode === "Military" &&
        orgInfo.uic.trim() &&
        orgInfo.orgName.trim()) ||
        (orgInfo.mode === "Corporate" && orgInfo.orgName.trim())) &&
      orgInfo.orgType);

  // Submit: request access to existing workspace
  const handleRequestAccess = async () => {
    if (!actor) {
      setError("Session not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const profile = buildProfile();
      await actor.registerProfile(profile);
      void navigate({ to: "/pending" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: create new workspace + activate as provisional S2
  const handleActivate = async () => {
    if (!actor) {
      setError("Session not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      // Create the org first
      const principal = identity!.getPrincipal();
      const org: import("@/backend.d").Organization = {
        orgId: "",
        name:
          orgInfo.mode === "Military"
            ? orgInfo.orgName
            : `${orgInfo.orgName}${orgInfo.businessId ? ` (${orgInfo.businessId})` : ""}`,
        uic:
          orgInfo.mode === "Military"
            ? orgInfo.uic.toUpperCase()
            : orgInfo.orgName.toUpperCase().replace(/\s+/g, "-"),
        orgType: orgInfo.orgType,
        networkMode: orgInfo.mode === "Military" ? "NIPR" : "Standard",
        adminPrincipal: principal,
        createdAt: BigInt(0),
      };
      const newOrgId = await actor.createOrganization(org);

      // Store workspace data for the setup wizard
      localStorage.setItem(
        "omnis_workspace_data",
        JSON.stringify({
          orgId: newOrgId,
          orgName: org.name,
          uic: org.uic,
          orgType: org.orgType,
          mode: orgInfo.mode,
          skipCommander: orgInfo.skipCommander,
        }),
      );
      localStorage.setItem("omnis_selected_uic", org.uic);

      const profile = buildProfile(newOrgId, org.uic);
      profile.isS2Admin = true;
      await actor.registerProfile(profile);
      void navigate({ to: "/workspace-setup" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Workspace creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildProfile = (
    newOrgId?: string,
    newUic?: string,
  ): import("@/backend.d").ExtendedProfile => {
    const fw = orgInfo.foundWorkspace;
    const principal = identity!.getPrincipal();
    const displayName = formatDisplayName(
      basicInfo.rank,
      basicInfo.lastName,
      basicInfo.firstName,
      basicInfo.mi,
    );
    return {
      principalId: principal,
      name: displayName,
      lastName: basicInfo.lastName,
      firstName: basicInfo.firstName,
      middleInitial: basicInfo.mi,
      branch: basicInfo.branch,
      rankCategory: basicInfo.category,
      rank: basicInfo.rank,
      email: basicInfo.email,
      orgRole: basicInfo.orgRole,
      uic: newUic ?? fw?.uic ?? orgInfo.uic.toUpperCase(),
      orgId: newOrgId ?? fw?.orgId ?? "",
      registered: true,
      isS2Admin: false,
      isValidatedByCommander: false,
      clearanceLevel: BigInt(1),
      dodId: "",
      mos: "",
      registrationStatus: "pending",
      denialReason: "",
      networkEmail: basicInfo.email,
      unitPhone: "",
      avatarUrl: undefined,
      verifiedBy: undefined,
      verifiedAt: undefined,
      clearanceExpiry: undefined,
    };
  };

  const searchQuery =
    orgInfo.mode === "Military" ? orgInfo.uic : orgInfo.orgName;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{
        backgroundColor: "#060b14",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.25 0.05 250 / 0.3), transparent)",
      }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-white uppercase">
            OMNIS
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">
          Sovereign OS — Personnel Registration
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#0a0e1a", borderColor: "#1a2235" }}
      >
        {/* Progress bar */}
        <ProgressBar step={step} />

        {/* Step content */}
        <div className="p-8">
          {step === 1 && (
            <Step1
              isCorporateMode={
                networkMode === "corporate-standard" ||
                networkMode === "corporate-secure"
              }
              basicInfo={basicInfo}
              setBasicInfo={setBasicInfo}
              onNext={() => setStep(2)}
              isValid={!!step1Valid}
            />
          )}
          {step === 2 && (
            <Step2
              orgInfo={orgInfo}
              setOrgInfo={setOrgInfo}
              searchQuery={searchQuery}
              onUicChange={handleUicChange}
              onOrgNameChange={handleOrgNameChange}
              uicSearching={uicSearching}
              searchDone={searchDone}
              actorReady={!!actor && !isFetching}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              onRequestAccess={handleRequestAccess}
              isSubmitting={isSubmitting}
              isValid={!!step2Valid}
            />
          )}
          {step === 3 && (
            <Step3
              basicInfo={basicInfo}
              orgInfo={orgInfo}
              onBack={() => setStep(2)}
              onSubmit={handleActivate}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>
      </div>

      <p className="mt-6 font-mono text-[9px] uppercase tracking-wider text-slate-600">
        Secured by Internet Computer Protocol
      </p>
    </div>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: Step }) {
  const labels = ["Personal Info", "Workspace", "Confirm"];
  return (
    <div className="px-8 pt-6 pb-2">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: s <= step ? "oklch(0.75 0.15 70)" : "#1a2235",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <span
            key={label}
            className={cn(
              "font-mono text-[9px] uppercase tracking-wider transition-colors",
              i + 1 <= step ? "text-amber-400" : "text-slate-600",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Step 1 — Basic Info (NO backend calls) ───────────────────────────────────
interface Step1Props {
  basicInfo: BasicInfo;
  setBasicInfo: React.Dispatch<React.SetStateAction<BasicInfo>>;
  onNext: () => void;
  isValid: boolean;
  isCorporateMode?: boolean;
}

function Step1({
  basicInfo,
  setBasicInfo,
  onNext,
  isValid,
  isCorporateMode = false,
}: Step1Props) {
  const isMilitary =
    !isCorporateMode &&
    basicInfo.branch !== "Corporate" &&
    basicInfo.branch !== "Civilian";
  const roles = isMilitary ? MILITARY_ROLES : CORPORATE_ROLES;

  const set = (field: keyof BasicInfo) => (v: string) =>
    setBasicInfo((prev) => ({ ...prev, [field]: v }));

  const namePreview =
    basicInfo.rank && basicInfo.lastName
      ? formatDisplayName(
          basicInfo.rank,
          basicInfo.lastName,
          basicInfo.firstName,
          basicInfo.mi,
        )
      : null;

  return (
    <div data-ocid="registration.step1.panel" className="space-y-6">
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          Step 1 of 3
        </h2>
        <p className="mt-0.5 font-mono text-xs text-slate-400">
          Personal Information
        </p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Last Name *
          </Label>
          <Input
            data-ocid="registration.step1.input"
            value={basicInfo.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            placeholder="SMITH"
            className="border bg-[#0f1626] font-mono text-sm"
            style={{ borderColor: "#1a2235" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            MI
          </Label>
          <Input
            value={basicInfo.mi}
            onChange={(e) =>
              set("mi")(e.target.value.slice(0, 1).toUpperCase())
            }
            placeholder="J"
            maxLength={1}
            className="border bg-[#0f1626] font-mono text-sm"
            style={{ borderColor: "#1a2235" }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          First Name *
        </Label>
        <Input
          value={basicInfo.firstName}
          onChange={(e) => set("firstName")(e.target.value)}
          placeholder="John"
          className="border bg-[#0f1626] font-mono text-sm"
          style={{ borderColor: "#1a2235" }}
        />
      </div>

      {/* Rank selector (military only) / Job Title + Department (corporate) */}
      {isCorporateMode ? (
        <>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Job Title *
            </Label>
            <Input
              data-ocid="registration.step1.jobtitle.input"
              value={basicInfo.rank}
              onChange={(e) =>
                setBasicInfo((prev) => ({ ...prev, rank: e.target.value }))
              }
              placeholder="e.g. Senior Engineer"
              className="border bg-[#0f1626] font-mono text-sm"
              style={{ borderColor: "#1a2235" }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Department
            </Label>
            <Input
              value={basicInfo.branch}
              onChange={(e) =>
                setBasicInfo((prev) => ({ ...prev, branch: e.target.value }))
              }
              placeholder="e.g. Engineering"
              className="border bg-[#0f1626] font-mono text-sm"
              style={{ borderColor: "#1a2235" }}
            />
          </div>
        </>
      ) : (
        <RankSelector
          branch={basicInfo.branch}
          category={basicInfo.category}
          rank={basicInfo.rank}
          onBranchChange={(v) =>
            setBasicInfo((prev) => ({
              ...prev,
              branch: v,
              category: "",
              rank: "",
              orgRole: "",
            }))
          }
          onCategoryChange={(v) =>
            setBasicInfo((prev) => ({ ...prev, category: v, rank: "" }))
          }
          onRankChange={set("rank")}
        />
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          Email
        </Label>
        <Input
          type="email"
          value={basicInfo.email}
          onChange={(e) => set("email")(e.target.value)}
          placeholder="j.smith@army.mil"
          className="border bg-[#0f1626] font-mono text-sm"
          style={{ borderColor: "#1a2235" }}
        />
      </div>

      {/* Org Role */}
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          Organizational Role *
        </Label>
        <Select value={basicInfo.orgRole} onValueChange={set("orgRole")}>
          <SelectTrigger
            className="border bg-[#0f1626] font-mono text-sm"
            style={{ borderColor: "#1a2235" }}
          >
            <SelectValue placeholder="Select role…" />
          </SelectTrigger>
          <SelectContent
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {roles.map((r) => (
              <SelectItem key={r} value={r} className="font-mono text-sm">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name preview */}
      {namePreview && (
        <div
          className="rounded-lg border px-4 py-2.5 flex items-center gap-2"
          style={{ borderColor: "#1a2235", backgroundColor: "#060b14" }}
        >
          <User className="h-3.5 w-3.5 text-amber-500/60 shrink-0" />
          <span className="font-mono text-xs text-amber-400">
            {namePreview}
          </span>
        </div>
      )}

      <Button
        data-ocid="registration.next.button"
        onClick={onNext}
        disabled={!isValid}
        className="w-full gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40"
      >
        Continue <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Step 2 — Workspace ───────────────────────────────────────────────────────
interface Step2Props {
  orgInfo: OrgInfo;
  setOrgInfo: React.Dispatch<React.SetStateAction<OrgInfo>>;
  searchQuery: string;
  onUicChange: (v: string) => void;
  onOrgNameChange: (v: string) => void;
  uicSearching: boolean;
  searchDone: boolean;
  actorReady: boolean;
  onBack: () => void;
  onNext: () => void;
  onRequestAccess: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

function Step2({
  orgInfo,
  setOrgInfo,
  searchQuery,
  onUicChange,
  onOrgNameChange,
  uicSearching,
  searchDone,
  actorReady,
  onBack,
  onNext,
  onRequestAccess,
  isSubmitting,
  isValid,
}: Step2Props) {
  const isMilitary = orgInfo.mode === "Military";
  const notFound =
    searchDone &&
    !uicSearching &&
    !orgInfo.foundWorkspace &&
    searchQuery.trim().length > 0;

  // After 8 seconds on Step 2, hide the "Establishing secure session" banner
  // so it doesn't confuse users who are already able to type
  const [showSessionBanner, setShowSessionBanner] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSessionBanner(false), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div data-ocid="registration.step2.panel" className="space-y-6">
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          Step 2 of 3
        </h2>
        <p className="mt-0.5 font-mono text-xs text-slate-400">
          Workspace Selection
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["Military", "Corporate"] as OrgMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() =>
              setOrgInfo((prev) => ({
                ...prev,
                mode: m,
                uic: "",
                orgName: "",
                foundWorkspace: null,
                isNew: false,
              }))
            }
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
              orgInfo.mode === m
                ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Informational session banner — shown only when not yet ready AND within first 8s */}
      {!actorReady && showSessionBanner && (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 max-w-sm"
          style={{ borderColor: "#1a2235", backgroundColor: "#060b14" }}
        >
          <Loader2 className="h-3 w-3 animate-spin text-amber-500 shrink-0" />
          <span className="font-mono text-[10px] text-slate-500">
            Establishing secure session…
          </span>
        </div>
      )}

      {/* Search field — always enabled, actor readiness does NOT block input */}
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {isMilitary ? "Unit Identification Code (UIC)" : "Organization Name"}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            data-ocid="registration.uic_search.input"
            value={isMilitary ? orgInfo.uic : orgInfo.orgName}
            onChange={(e) =>
              isMilitary
                ? onUicChange(e.target.value)
                : onOrgNameChange(e.target.value)
            }
            placeholder={isMilitary ? "e.g. WH9RT0" : "e.g. Acme Corporation"}
            className="border bg-[#0f1626] pl-9 font-mono text-sm uppercase"
            style={{ borderColor: "#1a2235" }}
          />
          {uicSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-amber-500" />
          )}
        </div>
        {isMilitary && (
          <p className="font-mono text-[9px] text-slate-600">
            6-character alphanumeric code (e.g. WH9RT0, 1A2B3C)
          </p>
        )}
      </div>

      {/* Corporate: optional Business ID */}
      {!isMilitary && (
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Business ID
            <span className="ml-1 text-slate-600">(optional)</span>
          </Label>
          <Input
            value={orgInfo.businessId}
            onChange={(e) =>
              setOrgInfo((prev) => ({ ...prev, businessId: e.target.value }))
            }
            placeholder="EIN, tax ID, or internal identifier"
            className="border bg-[#0f1626] font-mono text-sm"
            style={{ borderColor: "#1a2235" }}
          />
          <p className="font-mono text-[9px] text-slate-600">
            EIN, tax ID, or internal identifier — helps disambiguate similarly
            named organizations
          </p>
        </div>
      )}

      {/* Found workspace */}
      {orgInfo.foundWorkspace && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "#1a3a1a", backgroundColor: "#0a1a0a" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "#1a3a1a" }}
          >
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-green-400">
              Workspace Found
            </span>
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="font-mono text-sm font-bold text-white">
              {orgInfo.foundWorkspace.name}
            </p>
            <p className="font-mono text-xs text-slate-400">
              {orgInfo.foundWorkspace.uic} · {orgInfo.foundWorkspace.type}
            </p>
          </div>
          <div className="px-4 pb-4">
            <Button
              onClick={onRequestAccess}
              disabled={isSubmitting}
              className="w-full gap-2 bg-green-700 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-green-600"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              Request Access to {orgInfo.foundWorkspace.name}
            </Button>
            <p className="mt-2 font-mono text-[9px] text-slate-600 text-center">
              You will be placed in a pending verification queue and notified
              when approved by the Security Administrator.
            </p>
          </div>
        </div>
      )}

      {/* Not found — establish new workspace */}
      {notFound && (
        <div className="space-y-3">
          <div
            className="rounded-lg border px-4 py-3 flex items-start gap-2"
            style={{ borderColor: "#2a1a0a", backgroundColor: "#150f05" }}
          >
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-amber-300">
              No workspace found for{" "}
              <span className="font-bold">{searchQuery.toUpperCase()}</span>.
            </p>
          </div>

          {!orgInfo.isNew ? (
            <button
              type="button"
              onClick={() => setOrgInfo((prev) => ({ ...prev, isNew: true }))}
              className="w-full rounded-lg border border-dashed border-amber-500/30 px-4 py-3 text-left hover:border-amber-500/60 transition-colors"
            >
              <span className="font-mono text-xs font-bold text-amber-400">
                + Establish New Workspace
              </span>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                Create a new Omnis workspace for this UIC or organization
              </p>
            </button>
          ) : (
            <NewWorkspaceForm orgInfo={orgInfo} setOrgInfo={setOrgInfo} />
          )}
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          data-ocid="registration.back.button"
          variant="outline"
          onClick={onBack}
          className="flex-1 border-white/10 font-mono text-xs uppercase tracking-wider text-slate-400 hover:border-white/20 hover:text-white"
        >
          Back
        </Button>
        {orgInfo.isNew && (
          <Button
            data-ocid="registration.next.button"
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40"
          >
            Review <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── New Workspace Form (embedded in Step 2) ──────────────────────────────────
function NewWorkspaceForm({
  orgInfo,
  setOrgInfo,
}: {
  orgInfo: OrgInfo;
  setOrgInfo: React.Dispatch<React.SetStateAction<OrgInfo>>;
}) {
  const isMilitary = orgInfo.mode === "Military";
  const set = (field: keyof OrgInfo) => (v: string | boolean) =>
    setOrgInfo((prev) => ({ ...prev, [field]: v }));

  return (
    <div
      className="rounded-xl border space-y-4 p-4"
      style={{ borderColor: "#1a2235", backgroundColor: "#060b14" }}
    >
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-amber-500" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
          New Workspace Details
        </span>
      </div>

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {isMilitary ? "Unit Name *" : "Organization Name *"}
        </Label>
        <Input
          value={orgInfo.orgName}
          onChange={(e) => set("orgName")(e.target.value)}
          placeholder={
            isMilitary ? "e.g. 1-501st PIR" : "e.g. Acme Corporation"
          }
          className="border bg-[#0a0e1a] font-mono text-sm"
          style={{ borderColor: "#1a2235" }}
        />
      </div>

      {isMilitary && (
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            UIC *
          </Label>
          <Input
            value={orgInfo.uic}
            onChange={(e) =>
              set("uic")(e.target.value.toUpperCase().slice(0, 6))
            }
            placeholder="WH9RT0"
            maxLength={6}
            className="border bg-[#0a0e1a] font-mono text-sm uppercase"
            style={{ borderColor: "#1a2235" }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          Workspace Type *
        </Label>
        <Select
          value={orgInfo.orgType}
          onValueChange={(v) => set("orgType")(v)}
        >
          <SelectTrigger
            className="border bg-[#0a0e1a] font-mono text-sm"
            style={{ borderColor: "#1a2235" }}
          >
            <SelectValue placeholder="Select type…" />
          </SelectTrigger>
          <SelectContent
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {ORG_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="font-mono text-sm">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Security notice */}
      <div
        className="rounded-lg border px-4 py-3 space-y-1"
        style={{ borderColor: "#3a2a0a", backgroundColor: "#1a1205" }}
      >
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-xs font-bold text-amber-300">
              Provisional Security Administrator
            </p>
            <p className="mt-1 font-mono text-[10px] leading-relaxed text-amber-200/70">
              By establishing this workspace you will assume the Provisional S2
              Admin role. A Commander (or equivalent) must confirm their role
              before the workspace is fully operational.
            </p>
          </div>
        </div>
      </div>

      {/* Skip commander (testing) */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="skip-commander"
          checked={orgInfo.skipCommander}
          onCheckedChange={(v) => set("skipCommander")(!!v)}
          className="border-white/20"
        />
        <label
          htmlFor="skip-commander"
          className="font-mono text-[10px] text-slate-500 cursor-pointer"
        >
          Testing only — skip Commander confirmation requirement
        </label>
      </div>
    </div>
  );
}

// ── Step 3 — Review & Submit ─────────────────────────────────────────────────
interface Step3Props {
  basicInfo: BasicInfo;
  orgInfo: OrgInfo;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string;
}

function Step3({
  basicInfo,
  orgInfo,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: Step3Props) {
  const fw = orgInfo.foundWorkspace;
  const displayName = formatDisplayName(
    basicInfo.rank,
    basicInfo.lastName,
    basicInfo.firstName,
    basicInfo.mi,
  );
  const workspaceName = fw?.name ?? orgInfo.orgName;
  const workspaceUic =
    fw?.uic ??
    (orgInfo.mode === "Military"
      ? orgInfo.uic.toUpperCase()
      : orgInfo.orgName.toUpperCase().replace(/\s+/g, "-"));
  const workspaceType = fw?.type ?? orgInfo.orgType;

  return (
    <div data-ocid="registration.step3.panel" className="space-y-6">
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          Step 3 of 3
        </h2>
        <p className="mt-0.5 font-mono text-xs text-slate-400">
          Confirm &amp; Activate
        </p>
      </div>

      {/* Summary card */}
      <div
        className="rounded-xl border divide-y"
        style={{ borderColor: "#1a2235", backgroundColor: "#060b14" }}
      >
        <SummaryRow
          icon={<User className="h-3.5 w-3.5" />}
          label="Identity"
          value={displayName}
        />
        <SummaryRow
          label="Branch / Rank"
          value={`${basicInfo.branch} — ${basicInfo.rank}`}
        />
        {basicInfo.email && (
          <SummaryRow label="Email" value={basicInfo.email} />
        )}
        <SummaryRow label="Role" value={basicInfo.orgRole} />
        <SummaryRow
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Workspace"
          value={`${workspaceName} (${workspaceUic}) · ${workspaceType} · ${orgInfo.mode}`}
        />
        {orgInfo.isNew && !fw && (
          <div className="px-4 py-3 flex items-center gap-2">
            <Badge className="bg-amber-500/20 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
              Provisional S2 Admin
            </Badge>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-start gap-2 rounded-lg border px-4 py-3"
          style={{ borderColor: "#2a1a1a", backgroundColor: "#150a0a" }}
        >
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          data-ocid="registration.back.button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 border-white/10 font-mono text-xs uppercase tracking-wider text-slate-400 hover:border-white/20 hover:text-white"
        >
          Back
        </Button>
        <Button
          data-ocid="registration.submit.button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Activating…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> Activate Account
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {icon && <span className="mt-0.5 text-amber-500/60">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
          {label}
        </p>
        <p className="font-mono text-xs text-white truncate">{value}</p>
      </div>
    </div>
  );
}
