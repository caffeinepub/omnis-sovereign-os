import { TopNav } from "@/components/layout/TopNav";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  FolderOpen,
  HardDrive,
  Mail,
  MessageSquare,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useState } from "react";

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
    icon: Users,
    title: "Personnel Directory",
    description: "View and manage personnel",
    to: "/personnel",
    ocid: "hub.tile.3",
  },
  {
    icon: Mail,
    title: "Email Directory",
    description: "Organization contact directory",
    to: "/email-directory",
    ocid: "hub.tile.4",
  },
  {
    icon: HardDrive,
    title: "File Storage",
    description: "Blob storage and file management",
    to: "/file-storage",
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
  const { clearanceLevel, isS2Admin, isValidatedByCommander } =
    usePermissions();
  const navigate = useNavigate();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const showWelcomeBanner = clearanceLevel === 0 && !welcomeDismissed;
  const showS2Checklist = isS2Admin && !isValidatedByCommander;

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
              <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                S2 Setup Required
              </h2>
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

          {/* Section heading */}
          <div className="mb-6">
            <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
              Command Center
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500 uppercase tracking-widest">
              Select a module to begin
            </p>
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
