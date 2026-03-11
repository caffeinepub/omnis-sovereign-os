import type { AnomalyEvent, ExtendedProfile, Folder } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_SCAN_MESSAGES,
  DEMO_ANOMALY_EVENTS,
  DEMO_FOLDERS,
  DEMO_PROFILES,
  DEMO_THREAT_SCORES,
  type ThreatScore,
} from "@/config/aiDemoData";
import { SEVERITY_COLORS } from "@/config/constants";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  MessageSquare,
  Radio,
  Shield,
  ShieldAlert,
  ShieldOff,
  SkipForward,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts: bigint): string {
  const diffMs = Date.now() - Number(ts);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string } | undefined,
  demoMode: boolean,
  demoName?: string,
): string {
  if (demoMode && demoName) return demoName;
  if (!principal) return "—";
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match
    ? `${match.rank ? `${match.rank} ` : ""}${match.name}`.trim()
    : truncatePrincipal(principal);
}

function getFolderName(
  folders: Folder[],
  folderId: string | undefined,
  demoMode: boolean,
): string {
  if (!folderId) return "—";
  if (demoMode) {
    const demo = DEMO_FOLDERS.find((f) => f.id === folderId);
    if (demo) return demo.name;
  }
  return folders.find((f) => f.id === folderId)?.name ?? folderId;
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: "rgba(34,197,94,0.1)",
    text: "#22c55e",
    border: "rgba(34,197,94,0.3)",
  },
  medium: {
    bg: "rgba(234,179,8,0.1)",
    text: "#eab308",
    border: "rgba(234,179,8,0.3)",
  },
  high: {
    bg: "rgba(249,115,22,0.1)",
    text: "#f97316",
    border: "rgba(249,115,22,0.3)",
  },
  critical: {
    bg: "rgba(239,68,68,0.1)",
    text: "#ef4444",
    border: "rgba(239,68,68,0.3)",
  },
};

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const style = SEVERITY_STYLE[s] ?? SEVERITY_STYLE.low;
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {severity}
    </span>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ isSystemGenerated }: { isSystemGenerated: boolean }) {
  return isSystemGenerated ? (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: "rgba(245,158,11,0.1)",
        color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.3)",
      }}
    >
      <Bot className="h-2.5 w-2.5" />
      AI System
    </span>
  ) : (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: "rgba(100,116,139,0.1)",
        color: "#94a3b8",
        border: "1px solid rgba(100,116,139,0.3)",
      }}
    >
      Manual
    </span>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isLoading: boolean;
  highlight?: boolean;
}

function StatCard({ icon, value, label, isLoading, highlight }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded border p-4 transition-colors"
      style={{
        backgroundColor: highlight ? "rgba(239,68,68,0.08)" : "#1a2235",
        borderColor: highlight ? "rgba(239,68,68,0.4)" : "#243048",
      }}
    >
      <div className="flex items-center justify-between">
        <div className={highlight ? "text-red-400" : "text-amber-500"}>
          {icon}
        </div>
        {isLoading ? (
          <SkeletonCard height="32px" width="60px" className="rounded" />
        ) : (
          <span
            className={`font-mono text-2xl font-bold ${highlight ? "text-red-400" : "text-white"}`}
          >
            {value}
          </span>
        )}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => `sk-row-${i}`).map((rowKey) => (
        <TableRow
          key={rowKey}
          style={{ borderColor: "#1e2d45" }}
          className="hover:bg-transparent"
        >
          {[
            { key: "c0", w: "120px" },
            { key: "c1", w: "80px" },
            { key: "c2", w: "80px" },
            { key: "c3", w: "80px" },
            { key: "c4", w: "80px" },
            { key: "c5", w: "100px" },
            { key: "c6", w: "80px" },
            { key: "c7", w: "60px" },
          ].map(({ key: colKey, w }) => (
            <TableCell key={colKey} className="py-3">
              <SkeletonCard height="14px" className="rounded" width={w} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── AI Live Scan Panel ───────────────────────────────────────────────────────

function AIScanPanel() {
  const [currentMsgIdx, setCurrentMsgIdx] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setCurrentMsgIdx((prev) => {
        const next = (prev + 1) % AI_SCAN_MESSAGES.length;
        const msg = AI_SCAN_MESSAGES[next];
        setScanLog((log) => {
          const ts = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
          const newLog = [...log, `[${ts}] ${msg}`];
          // Keep last 40 lines
          return newLog.slice(-40);
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Auto-scroll to bottom — scanLog dep is intentional to trigger on each new line
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scanLog]);

  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#070d1a", borderColor: "#1e2d45" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "#1e2d45" }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-4 w-4 text-amber-400" />
            {isScanning && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            AI Smart System
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5"
            style={{
              color: isScanning ? "#22c55e" : "#94a3b8",
              backgroundColor: isScanning
                ? "rgba(34,197,94,0.1)"
                : "rgba(100,116,139,0.1)",
              border: `1px solid ${isScanning ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.3)"}`,
            }}
          >
            {isScanning ? "● ACTIVE SCAN" : "○ PAUSED"}
          </span>
        </div>
        <button
          type="button"
          data-ocid="monitoring.ai_scan.toggle_button"
          onClick={() => setIsScanning((v) => !v)}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          style={{ border: "1px solid #2a3347" }}
        >
          {isScanning ? (
            <>
              <SkipForward className="h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Radio className="h-3 w-3" />
              Resume
            </>
          )}
        </button>
      </div>

      {/* Current scan status */}
      <div
        className="border-b px-4 py-2"
        style={{ borderColor: "#1e2d45", backgroundColor: "#0a111f" }}
      >
        <div className="flex items-center gap-2">
          {isScanning ? (
            <Loader2 className="h-3 w-3 animate-spin text-amber-400 shrink-0" />
          ) : (
            <Activity className="h-3 w-3 text-slate-500 shrink-0" />
          )}
          <p className="font-mono text-[11px] text-amber-300/80 truncate">
            {AI_SCAN_MESSAGES[currentMsgIdx]}
          </p>
        </div>
      </div>

      {/* Scroll log */}
      <div className="h-40 overflow-y-auto px-4 py-3 space-y-0.5 font-mono text-[10px]">
        {scanLog.length === 0 ? (
          <p className="text-slate-600 italic">Awaiting scan output…</p>
        ) : (
          scanLog.map((line, i) => {
            const isThreat =
              line.toLowerCase().includes("flagging") ||
              line.toLowerCase().includes("threat") ||
              line.toLowerCase().includes("escalating") ||
              line.toLowerCase().includes("detected") ||
              line.toLowerCase().includes("anomalous");
            return (
              <p
                key={`log-${i}-${line.slice(0, 10)}`}
                className={isThreat ? "text-amber-400/90" : "text-slate-500"}
              >
                {line}
              </p>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

// ─── Threat Intelligence Cards ────────────────────────────────────────────────

function ThreatLevelBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "#ef4444"
      : score >= 60
        ? "#f97316"
        : score >= 40
          ? "#eab308"
          : "#22c55e";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ThreatIntelPanel({ scores }: { scores: ThreatScore[] }) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0d1525", borderColor: "#1e2d45" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: "#1e2d45" }}
      >
        <Zap className="h-4 w-4 text-amber-400" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-bold">
          Threat Intelligence
        </span>
        <span className="font-mono text-[10px] text-slate-500 ml-1">
          — Per-user risk scores
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: "#1e2d45" }}>
        {scores.map((s) => (
          <div key={s.name} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white">
                  {s.name}
                </span>
                <span className="ml-2 font-mono text-[10px] text-slate-500 uppercase">
                  {s.rank}
                </span>
              </div>
              <SeverityBadge severity={s.level} />
            </div>
            <ThreatLevelBar score={s.score} />
            <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────

interface DemoBannerProps {
  onExit: () => void;
}

function DemoBanner({ onExit }: DemoBannerProps) {
  return (
    <div
      data-ocid="monitoring.demo_banner"
      className="flex items-center justify-between gap-3 rounded border px-4 py-3"
      style={{
        backgroundColor: "rgba(139,92,246,0.08)",
        borderColor: "rgba(139,92,246,0.4)",
      }}
    >
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-violet-400 shrink-0" />
        <p className="font-mono text-[11px] uppercase tracking-wider text-violet-300">
          <span className="font-bold text-violet-200">DEMO MODE — </span>
          Showing simulated AI threat data. This is a preview of what the AI
          Smart System surfaces to the S2 admin.
        </p>
      </div>
      <button
        type="button"
        data-ocid="monitoring.demo.exit_button"
        onClick={onExit}
        className="shrink-0 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-violet-300 hover:text-white transition-colors"
        style={{ border: "1px solid rgba(139,92,246,0.4)" }}
      >
        Exit Demo
      </button>
    </div>
  );
}

// ─── Anomaly Table ────────────────────────────────────────────────────────────

const AUDIT_EVENT_TYPES = [
  "profile_update",
  "permission_change",
  "clearance_change",
  "privilege_escalation",
];

interface AnomalyTableProps {
  events: AnomalyEvent[];
  profiles: ExtendedProfile[];
  folders: Folder[];
  isLoading: boolean;
  onResolve: (event: AnomalyEvent) => void;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  emptyOcid: string;
  rowOcidPrefix: string;
  resolveOcidPrefix: string;
  demoMode?: boolean;
}

function AnomalyTable({
  events,
  profiles,
  folders,
  isLoading,
  onResolve,
  emptyIcon,
  emptyMessage,
  emptyOcid,
  rowOcidPrefix,
  resolveOcidPrefix,
  demoMode = false,
}: AnomalyTableProps) {
  return (
    <div
      className="overflow-x-auto rounded border"
      style={{ borderColor: "#1e2d45" }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{ borderColor: "#1e2d45", backgroundColor: "#0d1525" }}
          >
            {[
              "Event Type",
              "Severity",
              "Source",
              "Affected User",
              "Affected Folder",
              "Timestamp",
              "Status",
              "Action",
            ].map((h) => (
              <TableHead
                key={h}
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows count={6} />
          ) : events.length === 0 ? (
            <TableRow style={{ borderColor: "#1e2d45" }}>
              <TableCell colSpan={8}>
                <div data-ocid={emptyOcid}>
                  <EmptyState
                    icon={emptyIcon}
                    message={emptyMessage}
                    className="py-12"
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            events.map((event, idx) => {
              const isCritical = event.severity.toLowerCase() === "critical";
              const isHighlighted =
                (event.severity.toLowerCase() === "high" ||
                  event.severity.toLowerCase() === "critical") &&
                event.isSystemGenerated;

              // Demo-mode names
              const demoProfileName =
                demoMode && event.id === "demo-breach-001"
                  ? "David Morton (CIV)"
                  : (demoMode && event.id.startsWith("demo-freq")) ||
                      event.id.startsWith("demo-download") ||
                      event.id.startsWith("demo-message")
                    ? "SGT Maria Reyes"
                    : demoMode &&
                        (event.id.startsWith("demo-audit") ||
                          event.id.startsWith("demo-perm"))
                      ? "CPT James Harris"
                      : undefined;

              return (
                <TableRow
                  key={event.id}
                  data-ocid={`${rowOcidPrefix}.${idx + 1}`}
                  style={{
                    borderColor: "#1e2d45",
                    borderLeftWidth: isHighlighted ? "4px" : undefined,
                    borderLeftColor: isCritical
                      ? "#ef4444"
                      : isHighlighted
                        ? "#f59e0b"
                        : undefined,
                    borderLeftStyle: isHighlighted ? "solid" : undefined,
                    backgroundColor: isCritical
                      ? "rgba(239,68,68,0.04)"
                      : undefined,
                  }}
                  className="transition-colors hover:bg-[#131c2e]"
                >
                  <TableCell className="font-mono text-xs text-slate-300 whitespace-nowrap max-w-[180px] truncate">
                    {event.eventType}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={event.severity} />
                  </TableCell>
                  <TableCell>
                    <SourceBadge isSystemGenerated={event.isSystemGenerated} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                    {getProfileName(
                      profiles,
                      event.affectedUserId,
                      demoMode,
                      demoProfileName,
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap max-w-[160px] truncate">
                    {getFolderName(folders, event.affectedFolderId, demoMode)}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {timeAgo(event.detectedAt)}
                  </TableCell>
                  <TableCell>
                    {event.resolved ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                        <XCircle className="h-3 w-3" />
                        Open
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!event.resolved && (
                      <button
                        type="button"
                        data-ocid={`${resolveOcidPrefix}.${idx + 1}`}
                        onClick={() => onResolve(event)}
                        className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 border border-amber-500/30"
                      >
                        Resolve
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Log Anomaly Modal ────────────────────────────────────────────────────────

interface LogAnomalyModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profiles: ExtendedProfile[];
  folders: Folder[];
  onCreated: (event: AnomalyEvent) => void;
}

function LogAnomalyModal({
  open,
  onOpenChange,
  profiles,
  folders,
  onCreated,
}: LogAnomalyModalProps) {
  const { actor } = useActor();

  const [eventType, setEventType] = useState("");
  const [affectedUserId, setAffectedUserId] = useState("none");
  const [affectedFolderId, setAffectedFolderId] = useState("none");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [eventTypeError, setEventTypeError] = useState("");
  const [severityError, setSeverityError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  function resetForm() {
    setEventType("");
    setAffectedUserId("none");
    setAffectedFolderId("none");
    setSeverity("");
    setDescription("");
    setEventTypeError("");
    setSeverityError("");
    setDescriptionError("");
  }

  function validate(): boolean {
    let valid = true;
    if (!eventType.trim()) {
      setEventTypeError("Event type is required.");
      valid = false;
    } else {
      setEventTypeError("");
    }
    if (!severity) {
      setSeverityError("Severity is required.");
      valid = false;
    } else {
      setSeverityError("");
    }
    if (!description.trim() || description.trim().length < 10) {
      setDescriptionError("Description must be at least 10 characters.");
      valid = false;
    } else {
      setDescriptionError("");
    }
    return valid;
  }

  async function handleSubmit() {
    if (!actor || !validate()) return;
    setIsPending(true);
    try {
      const userPrincipal =
        affectedUserId !== "none"
          ? profiles.find((p) => p.principalId.toString() === affectedUserId)
              ?.principalId
          : undefined;

      const newEvent: AnomalyEvent = {
        id: crypto.randomUUID(),
        detectedAt: BigInt(Date.now()),
        eventType: eventType.trim(),
        affectedUserId: userPrincipal,
        affectedFolderId:
          affectedFolderId !== "none" ? affectedFolderId : undefined,
        severity,
        description: description.trim(),
        resolved: false,
        isSystemGenerated: false,
        resolvedBy: undefined,
      };

      await actor.createAnomalyEvent(newEvent);
      toast.success("Anomaly event logged");
      onCreated(newEvent);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to log anomaly event");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent
        data-ocid="monitoring.log_anomaly.modal"
        className="border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Log Anomaly Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Event Type */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Event Type <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="monitoring.log_anomaly.event_type.input"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                if (e.target.value.trim()) setEventTypeError("");
              }}
              placeholder="e.g. unauthorized_access, data_exfil"
              className="border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
            <FormError message={eventTypeError} />
          </div>

          {/* Affected User */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Affected User
            </Label>
            <Select value={affectedUserId} onValueChange={setAffectedUserId}>
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.affected_user.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <SelectItem
                  value="none"
                  className="font-mono text-xs text-slate-300 focus:text-white"
                >
                  None
                </SelectItem>
                {profiles.map((p) => (
                  <SelectItem
                    key={p.principalId.toString()}
                    value={p.principalId.toString()}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {p.rank ? `${p.rank} ` : ""}
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Affected Folder */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Affected Folder
            </Label>
            <Select
              value={affectedFolderId}
              onValueChange={setAffectedFolderId}
            >
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.affected_folder.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <SelectItem
                  value="none"
                  className="font-mono text-xs text-slate-300 focus:text-white"
                >
                  None
                </SelectItem>
                {folders.map((f) => (
                  <SelectItem
                    key={f.id}
                    value={f.id}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Severity <span className="text-red-400">*</span>
            </Label>
            <Select
              value={severity}
              onValueChange={(v) => {
                setSeverity(v);
                if (v) setSeverityError("");
              }}
            >
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.severity.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.keys(SEVERITY_COLORS).map((sev) => (
                  <SelectItem
                    key={sev}
                    value={sev}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={severityError} />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              data-ocid="monitoring.log_anomaly.description.textarea"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim().length >= 10) setDescriptionError("");
              }}
              placeholder="Describe the anomaly event (min 10 characters)..."
              className="border font-mono text-xs text-white placeholder:text-slate-600 resize-none"
              rows={3}
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
            <FormError message={descriptionError} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="monitoring.log_anomaly.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347" }}
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="monitoring.log_anomaly.submit_button"
            className="gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Logging…
              </>
            ) : (
              "Log Anomaly"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────

interface EventDetailModalProps {
  event: AnomalyEvent | null;
  onClose: () => void;
  demoMode: boolean;
  profiles: ExtendedProfile[];
  folders: Folder[];
}

function EventDetailModal({
  event,
  onClose,
  demoMode,
  profiles,
  folders,
}: EventDetailModalProps) {
  if (!event) return null;
  return (
    <Dialog
      open={!!event}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="monitoring.event_detail.modal"
        className="border sm:max-w-xl"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Event Detail
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={event.severity} />
            <SourceBadge isSystemGenerated={event.isSystemGenerated} />
            {event.resolved ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-green-500">
                <CheckCircle2 className="h-3 w-3" /> Resolved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                <XCircle className="h-3 w-3" /> Open
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Event Type
              </p>
              <p className="text-white">{event.eventType}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Detected
              </p>
              <p className="text-white">{timeAgo(event.detectedAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Affected User
              </p>
              <p className="text-white">
                {getProfileName(profiles, event.affectedUserId, demoMode)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Affected Folder
              </p>
              <p className="text-white truncate">
                {getFolderName(folders, event.affectedFolderId, demoMode)}
              </p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              AI Analysis
            </p>
            <div
              className="rounded p-3"
              style={{
                backgroundColor: "#0a111f",
                border: "1px solid #1e2d45",
              }}
            >
              <p className="font-mono text-xs text-slate-300 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="monitoring.event_detail.close_button"
            className="font-mono text-xs uppercase tracking-wider text-slate-300 border"
            style={{ borderColor: "#2a3347" }}
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccessMonitoringPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  // ── Demo mode ─────────────────────────────────────────────────────────────
  const [demoMode, setDemoMode] = useState(false);

  // ── Principal for query key scoping ───────────────────────────────────────
  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: [principalStr, "platform-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<
    ExtendedProfile[]
  >({
    queryKey: [principalStr, "monitoring-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: [principalStr, "monitoring-folders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFolders();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: rawEvents = [], isLoading: eventsLoading } = useQuery<
    AnomalyEvent[]
  >({
    queryKey: [principalStr, "anomaly-events"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnomalyEvents();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Local state ───────────────────────────────────────────────────────────
  const [events, setEvents] = useState<AnomalyEvent[]>([]);
  const [hasInitializedEvents, setHasInitializedEvents] = useState(false);

  // Sync fetched events into local state once
  useEffect(() => {
    if (!hasInitializedEvents && !eventsLoading) {
      setHasInitializedEvents(true);
      setEvents(rawEvents);
    }
  }, [hasInitializedEvents, eventsLoading, rawEvents]);

  const [activeMonitoringTab, setActiveMonitoringTab] =
    useState("anomaly-events");
  const [userFilter, setUserFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  // Reset filters when tab changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeMonitoringTab is the only relevant trigger; setters are stable
  useEffect(() => {
    setUserFilter("all");
    setFolderFilter("all");
  }, [activeMonitoringTab]);

  const [resolveTarget, setResolveTarget] = useState<AnomalyEvent | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<AnomalyEvent | null>(null);

  // ── Displayed events (demo vs. live) ─────────────────────────────────────
  const displayedEvents = useMemo(
    () => (demoMode ? DEMO_ANOMALY_EVENTS : events),
    [demoMode, events],
  );

  // ── Filtered events ───────────────────────────────────────────────────────
  const filteredAnomalyEvents = useMemo(() => {
    if (userFilter === "all") return displayedEvents;
    return displayedEvents.filter(
      (e) => e.affectedUserId?.toString() === userFilter,
    );
  }, [displayedEvents, userFilter]);

  const auditEvents = useMemo(() => {
    return displayedEvents.filter((e) =>
      AUDIT_EVENT_TYPES.some((t) => e.eventType.toLowerCase().includes(t)),
    );
  }, [displayedEvents]);

  const folderActivityEvents = useMemo(() => {
    if (folderFilter === "all")
      return displayedEvents.filter((e) => e.affectedFolderId);
    return displayedEvents.filter((e) => e.affectedFolderId === folderFilter);
  }, [displayedEvents, folderFilter]);

  // ── Summary count ─────────────────────────────────────────────────────────
  const selectedUserName = useMemo(() => {
    if (userFilter === "all") return null;
    const p = profiles.find((p) => p.principalId.toString() === userFilter);
    return p ? `${p.rank ? `${p.rank} ` : ""}${p.name}`.trim() : userFilter;
  }, [userFilter, profiles]);

  const userEventCount = useMemo(() => {
    if (userFilter === "all") return 0;
    return displayedEvents.filter(
      (e) => e.affectedUserId?.toString() === userFilter,
    ).length;
  }, [displayedEvents, userFilter]);

  // ── Demo stats override ───────────────────────────────────────────────────
  const demoStats = {
    totalUsers: BigInt(3),
    totalSections: BigInt(2),
    totalFolders: BigInt(4),
    totalDocuments: BigInt(27),
    unresolvedAnomalies: BigInt(
      DEMO_ANOMALY_EVENTS.filter((e) => !e.resolved).length,
    ),
    totalMessages: BigInt(14),
  };

  const activeStats = demoMode ? demoStats : statsData;

  // ── Resolve handler ───────────────────────────────────────────────────────
  async function handleConfirmResolve() {
    if (demoMode) {
      toast.success("Demo: anomaly marked resolved (no backend call)");
      setResolveOpen(false);
      setResolveTarget(null);
      return;
    }
    if (!actor || !resolveTarget) return;
    setIsResolving(true);
    try {
      const caller = identity?.getPrincipal();
      if (!caller) throw new Error("No identity");
      await actor.resolveAnomalyEvent(resolveTarget.id, caller);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === resolveTarget.id
            ? { ...e, resolved: true, resolvedBy: caller }
            : e,
        ),
      );
      toast.success("Anomaly marked as resolved");
    } catch {
      toast.error("Failed to resolve anomaly");
    } finally {
      setIsResolving(false);
      setResolveOpen(false);
      setResolveTarget(null);
    }
  }

  function handleResolve(event: AnomalyEvent) {
    setResolveTarget(event);
    setResolveOpen(true);
  }

  function handleEventCreated(event: AnomalyEvent) {
    setEvents((prev) => [event, ...prev]);
  }

  // ── Stat values ───────────────────────────────────────────────────────────
  const unresolvedCount = activeStats
    ? Number(activeStats.unresolvedAnomalies)
    : 0;

  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Users",
      value: activeStats ? String(activeStats.totalUsers) : "—",
      highlight: false,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Total Sections",
      value: activeStats ? String(activeStats.totalSections) : "—",
      highlight: false,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: "Total Folders",
      value: activeStats ? String(activeStats.totalFolders) : "—",
      highlight: false,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Total Documents",
      value: activeStats ? String(activeStats.totalDocuments) : "—",
      highlight: false,
    },
    {
      icon: <ShieldAlert className="h-5 w-5" />,
      label: "Unresolved Anomalies",
      value: activeStats ? String(activeStats.unresolvedAnomalies) : "—",
      highlight: unresolvedCount > 3,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Total Messages",
      value: activeStats ? String(activeStats.totalMessages) : "—",
      highlight: false,
    },
  ];

  const isDataLoading =
    !demoMode && (profilesLoading || foldersLoading || eventsLoading);

  // ── Folder options for filter ─────────────────────────────────────────────
  const folderOptions = demoMode ? DEMO_FOLDERS : folders;
  const profileOptions = demoMode
    ? DEMO_PROFILES.map((p) => ({
        principalId: { toString: () => p.principalId } as any,
        name: p.name,
        rank: p.rank,
        orgRole: p.orgRole,
        clearanceLevel: BigInt(p.clearanceLevel),
        isS2Admin: false,
        isValidatedByCommander: true,
        email: "",
        registered: true,
      }))
    : profiles;

  return (
    <div
      data-ocid="monitoring.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Access Monitoring
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-start justify-between gap-4 border-b pb-4"
            style={{ borderColor: "#1a2235" }}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-amber-500" />
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Access Monitoring
                </h1>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  S2 Intelligence — Restricted Access
                </p>
              </div>
            </div>

            {/* Demo toggle */}
            <button
              type="button"
              data-ocid="monitoring.demo.toggle_button"
              onClick={() => setDemoMode((v) => !v)}
              className="flex items-center gap-2 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: demoMode
                  ? "rgba(139,92,246,0.12)"
                  : "rgba(245,158,11,0.08)",
                border: `1px solid ${demoMode ? "rgba(139,92,246,0.4)" : "rgba(245,158,11,0.3)"}`,
                color: demoMode ? "#a78bfa" : "#f59e0b",
              }}
            >
              <Bot className="h-3.5 w-3.5" />
              {demoMode ? "Demo Mode — ON" : "Preview AI Demo"}
            </button>
          </div>

          {/* ── Demo Banner ──────────────────────────────────────────────── */}
          {demoMode && <DemoBanner onExit={() => setDemoMode(false)} />}

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <section
            data-ocid="monitoring.stat_cards.section"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {stats.map((s) => (
              <StatCard
                key={s.label}
                icon={s.icon}
                value={s.value}
                label={s.label}
                isLoading={!demoMode && statsLoading}
                highlight={s.highlight}
              />
            ))}
          </section>

          {/* ── AI + Threat Intel Row ────────────────────────────────────── */}
          {demoMode && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AIScanPanel />
              <ThreatIntelPanel scores={DEMO_THREAT_SCORES} />
            </div>
          )}

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <Tabs
            value={activeMonitoringTab}
            onValueChange={setActiveMonitoringTab}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList
                className="border"
                style={{ backgroundColor: "#0d1525", borderColor: "#1e2d45" }}
              >
                <TabsTrigger
                  value="anomaly-events"
                  data-ocid="monitoring.anomaly_events.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Anomaly Events
                  {demoMode && (
                    <span className="ml-1.5 rounded-full bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] text-red-400">
                      {DEMO_ANOMALY_EVENTS.filter((e) => !e.resolved).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="audit-trail"
                  data-ocid="monitoring.audit_trail.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Audit Trail
                </TabsTrigger>
                <TabsTrigger
                  value="folder-activity"
                  data-ocid="monitoring.folder_activity.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Folder Activity
                </TabsTrigger>
              </TabsList>

              <Button
                type="button"
                data-ocid="monitoring.log_anomaly.open_modal_button"
                onClick={() => setLogModalOpen(true)}
                className="gap-2 font-mono text-xs uppercase tracking-wider"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Log Anomaly
              </Button>
            </div>

            {/* ── Anomaly Events Tab ───────────────────────────────────── */}
            <TabsContent value="anomaly-events" className="space-y-4 mt-0">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger
                    data-ocid="monitoring.user_filter.select"
                    className="w-56 border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                  >
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "#0f1626",
                      borderColor: "#1a2235",
                    }}
                  >
                    <SelectItem
                      value="all"
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      All Users
                    </SelectItem>
                    {profileOptions.map((p) => (
                      <SelectItem
                        key={p.principalId.toString()}
                        value={p.principalId.toString()}
                        className="font-mono text-xs text-slate-300 focus:text-white"
                      >
                        {p.rank ? `${p.rank} ` : ""}
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUserName && (
                  <p className="font-mono text-[11px] text-slate-400">
                    <span className="text-amber-400">{selectedUserName}</span>
                    {" has "}
                    <span className="text-white font-bold">
                      {userEventCount}
                    </span>
                    {" anomal"}
                    {userEventCount !== 1 ? "ies" : "y"}
                    {" logged"}
                  </p>
                )}
              </div>

              {isDataLoading ? (
                <div data-ocid="monitoring.anomaly.loading_state">
                  <div
                    className="overflow-x-auto rounded border"
                    style={{ borderColor: "#1e2d45" }}
                  >
                    <Table>
                      <TableBody>
                        <SkeletonRows count={6} />
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <AnomalyTable
                  events={filteredAnomalyEvents}
                  profiles={profiles}
                  folders={folders}
                  isLoading={false}
                  onResolve={handleResolve}
                  emptyIcon={<Shield />}
                  emptyMessage="No anomalies detected"
                  emptyOcid="monitoring.anomaly.empty_state"
                  rowOcidPrefix="monitoring.anomaly.row"
                  resolveOcidPrefix="monitoring.anomaly.resolve_button"
                  demoMode={demoMode}
                />
              )}

              {/* Detail view note */}
              {filteredAnomalyEvents.length > 0 && (
                <p className="font-mono text-[10px] text-slate-600 text-center">
                  Click any row to view full AI analysis
                </p>
              )}
            </TabsContent>

            {/* ── Audit Trail Tab ──────────────────────────────────────── */}
            <TabsContent value="audit-trail" className="space-y-4 mt-0">
              <div
                className="flex items-start gap-2 rounded border px-4 py-3"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.3)",
                }}
              >
                <Shield className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  Access to this audit trail is restricted to verified S2
                  administrators. Delegation requires commander authorization.
                </p>
              </div>

              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Audit Trail — Privilege &amp; Permission Changes
              </p>

              <AnomalyTable
                events={auditEvents}
                profiles={profiles}
                folders={folders}
                isLoading={isDataLoading}
                onResolve={handleResolve}
                emptyIcon={<ClipboardList />}
                emptyMessage="No audit events recorded"
                emptyOcid="monitoring.audit.empty_state"
                rowOcidPrefix="monitoring.audit.row"
                resolveOcidPrefix="monitoring.audit.resolve_button"
                demoMode={demoMode}
              />
            </TabsContent>

            {/* ── Folder Activity Tab ──────────────────────────────────── */}
            <TabsContent value="folder-activity" className="space-y-4 mt-0">
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger
                  data-ocid="monitoring.folder_filter.select"
                  className="w-64 border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <SelectItem
                    value="all"
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    All Folders
                  </SelectItem>
                  {folderOptions.map((f) => (
                    <SelectItem
                      key={f.id}
                      value={f.id}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnomalyTable
                events={folderActivityEvents}
                profiles={profiles}
                folders={folders}
                isLoading={isDataLoading}
                onResolve={handleResolve}
                emptyIcon={<FolderOpen />}
                emptyMessage="No folder activity recorded"
                emptyOcid="monitoring.folder_activity.empty_state"
                rowOcidPrefix="monitoring.folder.row"
                resolveOcidPrefix="monitoring.folder.resolve_button"
                demoMode={demoMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── Resolve ConfirmDialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={resolveOpen}
        onOpenChange={setResolveOpen}
        title="Mark Anomaly Resolved"
        description="This anomaly will be marked as resolved. This action cannot be undone."
        confirmLabel={isResolving ? "Resolving…" : "Resolve"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmResolve}
        onCancel={() => {
          setResolveOpen(false);
          setResolveTarget(null);
        }}
      />

      {/* ── Log Anomaly Modal ────────────────────────────────────────────── */}
      <LogAnomalyModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        profiles={profiles}
        folders={folders}
        onCreated={handleEventCreated}
      />

      {/* ── Event Detail Modal ───────────────────────────────────────────── */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        demoMode={demoMode}
        profiles={profiles}
        folders={folders}
      />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
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
