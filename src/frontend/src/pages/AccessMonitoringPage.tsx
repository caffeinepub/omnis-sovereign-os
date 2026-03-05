import type { AnomalyEvent, ExtendedProfile, Folder } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
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
import { SEVERITY_COLORS } from "@/config/constants";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  MessageSquare,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string } | undefined,
): string {
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
): string {
  if (!folderId) return "—";
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
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: "rgba(245,158,11,0.1)",
        color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.3)",
      }}
    >
      System
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
}

function StatCard({ icon, value, label, isLoading }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded border p-4 transition-colors"
      style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
    >
      <div className="flex items-center justify-between">
        <div className="text-amber-500">{icon}</div>
        {isLoading ? (
          <SkeletonCard height="32px" width="60px" className="rounded" />
        ) : (
          <span className="font-mono text-2xl font-bold text-white">
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
              const isHighlighted =
                event.severity.toLowerCase() === "high" &&
                event.isSystemGenerated;
              return (
                <TableRow
                  key={event.id}
                  data-ocid={`${rowOcidPrefix}.${idx + 1}`}
                  style={{
                    borderColor: "#1e2d45",
                    borderLeftWidth: isHighlighted ? "4px" : undefined,
                    borderLeftColor: isHighlighted ? "#f59e0b" : undefined,
                    borderLeftStyle: isHighlighted ? "solid" : undefined,
                  }}
                  className="transition-colors hover:bg-[#131c2e]"
                >
                  <TableCell className="font-mono text-xs text-slate-300 whitespace-nowrap max-w-[160px] truncate">
                    {event.eventType}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={event.severity} />
                  </TableCell>
                  <TableCell>
                    <SourceBadge isSystemGenerated={event.isSystemGenerated} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                    {getProfileName(profiles, event.affectedUserId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                    {getFolderName(folders, event.affectedFolderId)}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {formatTimestamp(event.detectedAt)}
                  </TableCell>
                  <TableCell>
                    {event.resolved ? (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-green-500">
                        Resolved
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                        Unresolved
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccessMonitoringPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<
    ExtendedProfile[]
  >({
    queryKey: ["monitoring-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["monitoring-folders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFolders();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: rawEvents = [], isLoading: eventsLoading } = useQuery<
    AnomalyEvent[]
  >({
    queryKey: ["anomaly-events"],
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
  if (!hasInitializedEvents && !eventsLoading && rawEvents.length >= 0) {
    setHasInitializedEvents(true);
    setEvents(rawEvents);
  }

  const [userFilter, setUserFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [resolveTarget, setResolveTarget] = useState<AnomalyEvent | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // ── Filtered events ───────────────────────────────────────────────────────
  const filteredAnomalyEvents = useMemo(() => {
    if (userFilter === "all") return events;
    return events.filter((e) => e.affectedUserId?.toString() === userFilter);
  }, [events, userFilter]);

  const auditEvents = useMemo(() => {
    return events.filter((e) =>
      AUDIT_EVENT_TYPES.some((t) => e.eventType.toLowerCase().includes(t)),
    );
  }, [events]);

  const folderActivityEvents = useMemo(() => {
    if (folderFilter === "all") return events.filter((e) => e.affectedFolderId);
    return events.filter((e) => e.affectedFolderId === folderFilter);
  }, [events, folderFilter]);

  // ── Summary count ─────────────────────────────────────────────────────────
  const selectedUserName = useMemo(() => {
    if (userFilter === "all") return null;
    const p = profiles.find((p) => p.principalId.toString() === userFilter);
    return p ? `${p.rank ? `${p.rank} ` : ""}${p.name}`.trim() : userFilter;
  }, [userFilter, profiles]);

  const userEventCount = useMemo(() => {
    if (userFilter === "all") return 0;
    return events.filter((e) => e.affectedUserId?.toString() === userFilter)
      .length;
  }, [events, userFilter]);

  // ── Resolve handler ───────────────────────────────────────────────────────
  async function handleConfirmResolve() {
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
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Users",
      value: statsData ? String(statsData.totalUsers) : "—",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Total Sections",
      value: statsData ? String(statsData.totalSections) : "—",
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: "Total Folders",
      value: statsData ? String(statsData.totalFolders) : "—",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Total Documents",
      value: statsData ? String(statsData.totalDocuments) : "—",
    },
    {
      icon: <ShieldAlert className="h-5 w-5" />,
      label: "Unresolved Anomalies",
      value: statsData ? String(statsData.unresolvedAnomalies) : "—",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Total Messages",
      value: statsData ? String(statsData.totalMessages) : "—",
    },
  ];

  const isDataLoading = profilesLoading || foldersLoading || eventsLoading;

  return (
    <div
      data-ocid="monitoring.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
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
          </div>

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
                isLoading={statsLoading}
              />
            ))}
          </section>

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <Tabs defaultValue="anomaly-events" className="space-y-4">
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

              {/* Log Anomaly button — always visible but only relevant for Anomaly Events tab */}
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
              {/* Per-user filter + summary */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger
                    data-ocid="monitoring.user_filter.select"
                    className="w-52 border font-mono text-xs text-white"
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

                {selectedUserName && (
                  <p className="font-mono text-[11px] text-slate-400">
                    <span className="text-amber-400">{selectedUserName}</span>
                    {" has accessed classified resources "}
                    <span className="text-white font-bold">
                      {userEventCount}
                    </span>
                    {" time"}
                    {userEventCount !== 1 ? "s" : ""}
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
                />
              )}
            </TabsContent>

            {/* ── Audit Trail Tab ──────────────────────────────────────── */}
            <TabsContent value="audit-trail" className="space-y-4 mt-0">
              {/* Security banner */}
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
              />
            </TabsContent>

            {/* ── Folder Activity Tab ──────────────────────────────────── */}
            <TabsContent value="folder-activity" className="space-y-4 mt-0">
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger
                  data-ocid="monitoring.folder_filter.select"
                  className="w-56 border font-mono text-xs text-white"
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
