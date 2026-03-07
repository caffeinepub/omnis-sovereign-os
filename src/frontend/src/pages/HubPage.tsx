import { UserRole } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ChainOfTrustPanel } from "@/components/shared/ChainOfTrustPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  HardDrive,
  HelpCircle,
  Key,
  Loader2,
  Mail,
  Megaphone,
  MessageSquare,
  Network,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TileDefinition {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  s2Only?: boolean;
  ocid: string;
}

const TILES: TileDefinition[] = [
  {
    icon: FolderOpen,
    title: "Documents",
    description: "Manage classified documents and folders",
    to: "/documents",
    ocid: "hub.tile.1",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "Secure internal communications",
    to: "/messages",
    ocid: "hub.tile.2",
  },
  {
    icon: HardDrive,
    title: "File Storage",
    description: "Blob storage and file management",
    to: "/file-storage",
    ocid: "hub.tile.3",
  },
  {
    icon: Users,
    title: "Personnel Directory",
    description: "View and manage personnel",
    to: "/personnel",
    ocid: "hub.tile.4",
  },
  {
    icon: Mail,
    title: "Email Directory",
    description: "Organization contact directory",
    to: "/email-directory",
    ocid: "hub.tile.5",
  },
  {
    icon: Shield,
    title: "Access Monitoring",
    description: "Monitor anomalies and access events",
    to: "/monitoring",
    s2Only: true,
    ocid: "hub.tile.6",
  },
];

interface SecondaryTileDefinition {
  icon: LucideIcon;
  title: string;
  to: string;
  ocid: string;
  s2Only?: boolean;
}

const SECONDARY_TILES: SecondaryTileDefinition[] = [
  {
    icon: Bell,
    title: "Notifications",
    to: "/notifications",
    ocid: "hub.secondary.1",
  },
  {
    icon: ClipboardList,
    title: "Audit Log",
    to: "/audit-log",
    ocid: "hub.secondary.2",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    to: "/announcements",
    ocid: "hub.secondary.3",
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    to: "/calendar",
    ocid: "hub.secondary.4",
  },
  { icon: CheckSquare, title: "Tasks", to: "/tasks", ocid: "hub.secondary.5" },
  {
    icon: Settings,
    title: "Settings",
    to: "/settings",
    ocid: "hub.secondary.6",
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    to: "/governance",
    ocid: "hub.secondary.7",
  },
  { icon: HelpCircle, title: "Help", to: "/help", ocid: "hub.secondary.8" },
  {
    icon: FlaskConical,
    title: "Test Lab",
    to: "/test-lab",
    ocid: "hub.secondary.9",
  },
  {
    icon: ShieldCheck,
    title: "Admin Panel",
    to: "/admin",
    s2Only: true,
    ocid: "hub.secondary.10",
  },
];

interface ChecklistStep {
  num: number;
  label: string;
  to: string;
  ocid: string;
}

const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    num: 1,
    label: "Validate Commander Code",
    to: "/validate-commander",
    ocid: "hub.s2_checklist.validate.link",
  },
  {
    num: 2,
    label: "Create Sections & Folders",
    to: "/documents",
    ocid: "hub.s2_checklist.folders.link",
  },
  {
    num: 3,
    label: "Assign Clearance Levels",
    to: "/personnel",
    ocid: "hub.s2_checklist.clearances.link",
  },
];

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function HubPage() {
  const { clearanceLevel, isS2Admin, profile, refreshProfile } =
    usePermissions();
  const { isSet: networkModeIsSet } = useNetworkMode();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(
    () => localStorage.getItem("omnis_s2_checklist_dismissed") === "true",
  );
  const [isCallerAdminFlag, setIsCallerAdminFlag] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  // Bootstrap code claim
  const [showClaimPanel, setShowClaimPanel] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [networkModeDismissed, setNetworkModeDismissed] = useState(false);
  // Chain of trust state
  const [commanderClaimed, setCommanderClaimed] = useState(
    () => localStorage.getItem("omnis_commander_claimed") === "true",
  );
  const [hasFoundingS2] = useState(
    () => localStorage.getItem("omnis_founding_s2") === "true",
  );
  const chainOfTrustComplete = hasFoundingS2 && commanderClaimed;

  // Check if the caller has the admin role but hasn't been flagged as S2 admin yet
  useEffect(() => {
    if (!actor || !profile || isS2Admin) return;
    actor
      .isCallerAdmin()
      .then((result) => setIsCallerAdminFlag(result))
      .catch(() => setIsCallerAdminFlag(false));
  }, [actor, profile, isS2Admin]);

  // Poll for commander claim every 5s while S2 admin is on hub and chain not yet complete
  useEffect(() => {
    if (!isS2Admin || chainOfTrustComplete) return;
    const interval = setInterval(() => {
      const claimed =
        localStorage.getItem("omnis_commander_claimed") === "true";
      setCommanderClaimed(claimed);
    }, 5000);
    return () => clearInterval(interval);
  }, [isS2Admin, chainOfTrustComplete]);

  const handleActivateS2Admin = async () => {
    if (!actor || !identity) return;
    setIsActivating(true);
    try {
      const principal = identity.getPrincipal();
      await actor.assignCallerUserRole(principal, UserRole.admin);
      await actor.updateUserProfile({
        principalId: principal,
        name: profile?.name ?? "",
        rank: profile?.rank ?? "",
        email: profile?.email ?? "",
        orgRole: profile?.orgRole ?? "",
        clearanceLevel: profile?.clearanceLevel ?? 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile?.avatarUrl,
      });
      await actor.validateS2Admin(principal);
      await refreshProfile();
      toast.success("S2 admin activated", {
        description: "You now have full S2 admin access.",
      });
    } catch {
      toast.error("Activation failed", {
        description: "Could not activate S2 admin role. Try again.",
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Post-registration S2 admin claim using bootstrap code
  const handleClaimS2Admin = async () => {
    if (!actor || !identity || !claimCode.trim()) return;
    setIsClaiming(true);
    try {
      const principal = identity.getPrincipal();
      // The bootstrap code is passed as the caffeineAdminToken.
      // We re-initialize the actor with the provided code as the admin token
      // by calling _initializeAccessControlWithSecret directly.
      await (
        actor as unknown as {
          _initializeAccessControlWithSecret: (token: string) => Promise<void>;
        }
      )._initializeAccessControlWithSecret(claimCode.trim());
      await actor.assignCallerUserRole(principal, UserRole.admin);
      await actor.updateUserProfile({
        principalId: principal,
        name: profile?.name ?? "",
        rank: profile?.rank ?? "",
        email: profile?.email ?? "",
        orgRole: profile?.orgRole ?? "",
        clearanceLevel: 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile?.avatarUrl,
      });
      await actor.validateS2Admin(principal);
      await refreshProfile();
      setShowClaimPanel(false);
      setClaimCode("");
      toast.success("S2 Admin access granted", {
        description: "You now have full S2 admin access.",
      });
    } catch {
      toast.error("Invalid authorization code", {
        description: "The code was not accepted. Check and try again.",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const showWelcomeBanner =
    clearanceLevel === 0 &&
    !welcomeDismissed &&
    !isCallerAdminFlag &&
    !isS2Admin;
  const showS2Checklist =
    isS2Admin && !profile?.isValidatedByCommander && !checklistDismissed;

  function handleDismissChecklist() {
    localStorage.setItem("omnis_s2_checklist_dismissed", "true");
    setChecklistDismissed(true);
  }
  const showRecoveryPanel = isCallerAdminFlag && !isS2Admin;

  const visibleTiles = TILES.filter((t) => !t.s2Only || isS2Admin);

  return (
    <div
      data-ocid="hub.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* S2 Admin Recovery Panel */}
          <AnimatePresence>
            {showRecoveryPanel && (
              <motion.div
                data-ocid="hub.s2_recovery.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex flex-col gap-3 rounded border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  borderColor: "#f59e0b",
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "#f59e0b" }}
                  />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
                      S2 Admin Role Available
                    </p>
                    <p className="mt-0.5 font-mono text-xs leading-relaxed text-slate-400">
                      Your account has system admin authorization but S2 admin
                      is not yet activated.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="hub.s2_activate.button"
                  onClick={() => void handleActivateS2Admin()}
                  disabled={isActivating}
                  className="flex shrink-0 items-center gap-2 rounded border border-amber-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Activating…
                    </>
                  ) : (
                    <>
                      Activate S2 Admin
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* S2 Admin Authorization Code Claim Panel — for users who skipped the code at registration */}
          <AnimatePresence>
            {showClaimPanel && !isS2Admin && (
              <motion.div
                data-ocid="hub.s2_claim.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 rounded border px-5 py-4"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  borderColor: "#f59e0b",
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
                    Claim S2 Admin Access
                  </p>
                  <button
                    type="button"
                    data-ocid="hub.s2_claim.close_button"
                    onClick={() => {
                      setShowClaimPanel(false);
                      setClaimCode("");
                    }}
                    className="text-slate-500 transition-colors hover:text-slate-300"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-3 font-mono text-xs leading-relaxed text-slate-400">
                  Enter the Commander Authorization Code to claim S2 admin
                  privileges for this account.
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="hub.s2_claim.input"
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    placeholder="Commander Authorization Code"
                    className="flex-1 border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleClaimS2Admin();
                    }}
                    disabled={isClaiming}
                  />
                  <Button
                    type="button"
                    data-ocid="hub.s2_claim.submit_button"
                    onClick={() => void handleClaimS2Admin()}
                    disabled={isClaiming || !claimCode.trim()}
                    className="shrink-0 font-mono text-xs uppercase tracking-wider"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {isClaiming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome banner for clearance level 0 */}
          <AnimatePresence>
            {showWelcomeBanner && (
              <motion.div
                data-ocid="hub.welcome_banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex items-center justify-between gap-3 rounded border px-4 py-3"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  borderColor: "#f59e0b",
                }}
              >
                <p className="font-mono text-xs uppercase tracking-wider text-amber-400">
                  Your account is pending clearance assignment. Contact your S2
                  administrator.
                </p>
                <button
                  type="button"
                  data-ocid="hub.welcome_banner.close_button"
                  onClick={() => setWelcomeDismissed(true)}
                  className="shrink-0 text-amber-400 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Network Mode banner — shown to S2 admins when mode not configured */}
          <AnimatePresence>
            {isS2Admin && !networkModeIsSet && !networkModeDismissed && (
              <motion.div
                data-ocid="hub.network_mode_banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex flex-col gap-3 rounded border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: "rgba(59,130,246,0.06)",
                  borderColor: "rgba(59,130,246,0.35)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Network
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "#60a5fa" }}
                  />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                      Network mode not configured
                    </p>
                    <p className="mt-0.5 font-mono text-xs leading-relaxed text-slate-400">
                      Configure the deployment network type (NIPR, SIPR, or
                      Corporate) to enable classification labels and monitoring
                      sensitivity settings.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-ocid="hub.network_mode_banner.configure_button"
                    onClick={() => void navigate({ to: "/network-mode-setup" })}
                    className="rounded border border-blue-500/40 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-blue-400 transition-colors hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Configure Now
                  </button>
                  <button
                    type="button"
                    data-ocid="hub.network_mode_banner.close_button"
                    onClick={() => setNetworkModeDismissed(true)}
                    className="text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* S2 setup checklist */}
          {showS2Checklist && (
            <motion.div
              data-ocid="hub.s2_checklist.panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mb-6 rounded border px-5 py-4"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.06)",
                borderColor: "#f59e0b",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  S2 Setup Required
                </h2>
                <button
                  type="button"
                  data-ocid="hub.s2_checklist.close_button"
                  onClick={handleDismissChecklist}
                  className="text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label="Dismiss checklist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {CHECKLIST_STEPS.map((step) => (
                  <button
                    key={step.num}
                    type="button"
                    data-ocid={step.ocid}
                    onClick={() => void navigate({ to: step.to })}
                    className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold"
                      style={{
                        borderColor: "#f59e0b",
                        color: "#f59e0b",
                      }}
                    >
                      {step.num}
                    </span>
                    <span className="flex-1 font-mono text-xs uppercase tracking-wider text-slate-300">
                      {step.label}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-amber-500/60" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chain of Trust Panel — S2 admins only, auto-hides when complete */}
          {isS2Admin && hasFoundingS2 && !chainOfTrustComplete && (
            <AnimatePresence>
              <motion.div
                data-ocid="hub.chain_of_trust.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5"
              >
                <ChainOfTrustPanel />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Section heading */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Operations Center
              </h1>
              <p className="mt-1 font-mono text-xs text-slate-500 uppercase tracking-widest">
                Select a module to begin
              </p>
            </div>
            {/* S2 Admin claim trigger — only shown to non-S2 users who haven't opened the panel */}
            {!isS2Admin && !showClaimPanel && (
              <button
                type="button"
                data-ocid="hub.s2_claim.open_modal_button"
                onClick={() => setShowClaimPanel(true)}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                title="Claim S2 admin access with Commander Authorization Code"
              >
                <Key className="h-3 w-3" />
                Admin Access
              </button>
            )}
          </div>

          {/* Tiles grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <motion.button
                  key={tile.to}
                  type="button"
                  data-ocid={tile.ocid}
                  custom={index}
                  variants={tileVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => void navigate({ to: tile.to })}
                  className="group relative flex flex-col items-start gap-3 rounded border p-5 text-left outline-none transition-all duration-200 hover:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  style={{
                    backgroundColor: "#1a2235",
                    borderColor: "#253045",
                  }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded"
                    style={{
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors group-hover:text-amber-400"
                      style={{ color: "#f59e0b" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:text-amber-400">
                      {tile.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-slate-500">
                      {tile.description}
                    </p>
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" />
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#253045" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Quick Access
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#253045" }}
            />
          </div>

          {/* Secondary compact tiles */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {SECONDARY_TILES.filter((t) => !t.s2Only || isS2Admin).map(
              (tile, index) => {
                const Icon = tile.icon;
                return (
                  <motion.button
                    key={tile.to}
                    type="button"
                    data-ocid={tile.ocid}
                    custom={index + TILES.length}
                    variants={tileVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => void navigate({ to: tile.to })}
                    className="group flex flex-col items-center gap-2 rounded border px-3 py-3.5 text-center outline-none transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.03] focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                    style={{
                      backgroundColor: "#0f1626",
                      borderColor: "#1e2d40",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-amber-400" />
                    <span className="font-mono text-[10px] uppercase leading-tight tracking-wider text-slate-400 transition-colors group-hover:text-slate-200">
                      {tile.title}
                    </span>
                  </motion.button>
                );
              },
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
