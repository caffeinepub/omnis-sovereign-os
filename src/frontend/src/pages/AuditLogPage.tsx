import type { AnomalyEvent, ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { SEVERITY_COLORS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatRelativeTime } from "@/lib/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, ShieldOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}…${p.slice(-4)}`;
}

function resolveName(
  profiles: ExtendedProfile[],
  principalStr: string,
): string {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match)
    return (
      `${match.rank} ${match.name}`.trim() || truncatePrincipal(principalStr)
    );
  return truncatePrincipal(principalStr);
}

function getSeverityStyles(severity: string): {
  borderColor: string;
  color: string;
  backgroundColor: string;
} {
  const color = SEVERITY_COLORS[severity.toLowerCase()] ?? "gray";
  const map: Record<
    string,
    { borderColor: string; color: string; backgroundColor: string }
  > = {
    red: {
      borderColor: "rgba(248,113,113,0.4)",
      color: "#f87171",
      backgroundColor: "rgba(248,113,113,0.1)",
    },
    orange: {
      borderColor: "rgba(251,146,60,0.4)",
      color: "#fb923c",
      backgroundColor: "rgba(251,146,60,0.1)",
    },
    yellow: {
      borderColor: "rgba(250,204,21,0.4)",
      color: "#facc15",
      backgroundColor: "rgba(250,204,21,0.1)",
    },
    green: {
      borderColor: "rgba(74,222,128,0.4)",
      color: "#4ade80",
      backgroundColor: "rgba(74,222,128,0.1)",
    },
    gray: {
      borderColor: "rgba(148,163,184,0.2)",
      color: "#94a3b8",
      backgroundColor: "rgba(148,163,184,0.05)",
    },
  };
  return map[color] ?? map.gray;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <div
      data-ocid="audit.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <SkeletonCard height="18px" width="60px" />
          <SkeletonCard height="18px" width="80px" />
          <SkeletonCard className="flex-1 h-[18px]" />
          <SkeletonCard height="18px" width="80px" />
          <SkeletonCard height="18px" width="60px" />
          <SkeletonCard height="18px" width="70px" />
        </div>
      ))}
    </div>
  );
}

// ─── AuditLogPage ─────────────────────────────────────────────────────────────

type StatusFilter = "all" | "unresolved" | "resolved";

export default function AuditLogPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { isS2Admin, isLoading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [resolveTarget, setResolveTarget] = useState<AnomalyEvent | null>(null);

  // ── Fetch anomaly events ──────────────────────────────────────────────────
  const { data: events = [], isLoading: eventsLoading } = useQuery<
    AnomalyEvent[]
  >({
    queryKey: ["anomalyEvents", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getAnomalyEvents();
      return items.sort((a, b) => (a.detectedAt > b.detectedAt ? -1 : 1));
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });

  // ── Fetch all profiles for name resolution ────────────────────────────────
  const { data: profiles = [] } = useQuery<ExtendedProfile[]>({
    queryKey: ["allProfiles", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Resolve mutation ──────────────────────────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: async (event: AnomalyEvent) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      await actor.resolveAnomalyEvent(event.id, identity.getPrincipal());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["anomalyEvents", principalStr],
      });
      setResolveTarget(null);
      toast.success("Anomaly event resolved");
    },
    onError: () => {
      toast.error("Failed to resolve event");
      setResolveTarget(null);
    },
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredEvents = events.filter((e) => {
    const severityMatch =
      severityFilter === "all" ||
      e.severity.toLowerCase() === severityFilter.toLowerCase();
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "resolved" ? e.resolved : !e.resolved);
    return severityMatch && statusMatch;
  });

  const isLoading = eventsLoading || permissionsLoading;

  return (
    <div
      data-ocid="audit.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Resolve confirm dialog */}
      <ConfirmDialog
        isOpen={!!resolveTarget}
        onOpenChange={(v) => {
          if (!v) setResolveTarget(null);
        }}
        title="Resolve Anomaly Event?"
        description="Mark this event as resolved. This action is logged and cannot be undone."
        confirmLabel={resolveMutation.isPending ? "Resolving…" : "Resolve"}
        cancelLabel="Cancel"
        onConfirm={() => {
          if (resolveTarget) void resolveMutation.mutate(resolveTarget);
        }}
        onCancel={() => setResolveTarget(null)}
      />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Audit Log
            </span>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ClipboardList className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Audit Log
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Anomaly events and oversight trail
              </p>
            </div>
          </div>

          {/* Access restricted */}
          {!isLoading && !isS2Admin ? (
            <div data-ocid="audit.empty_state">
              <EmptyState
                icon={<ShieldOff />}
                message="Access restricted to S2 administrators"
                className="py-24"
              />
            </div>
          ) : (
            <>
              {/* Filter bar */}
              <div
                className="mb-4 flex flex-wrap items-center gap-3 rounded border px-4 py-3"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {/* Severity dropdown */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                    Severity
                  </span>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger
                      data-ocid="audit.severity.select"
                      className="h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-slate-300"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#0f1626",
                        borderColor: "#1a2235",
                      }}
                    >
                      {["all", "critical", "high", "medium", "low"].map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="font-mono text-[10px] uppercase tracking-wider text-slate-300"
                        >
                          {s === "all"
                            ? "All"
                            : s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status buttons */}
                <div className="flex items-center gap-1">
                  {(["all", "unresolved", "resolved"] as StatusFilter[]).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        data-ocid="audit.status.tab"
                        onClick={() => setStatusFilter(s)}
                        className="rounded px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={
                          statusFilter === s
                            ? {
                                backgroundColor: "rgba(245,158,11,0.15)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.3)",
                              }
                            : {
                                color: "#64748b",
                                border: "1px solid transparent",
                              }
                        }
                      >
                        {s === "all"
                          ? "All"
                          : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ),
                  )}
                </div>

                <div className="ml-auto font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {isLoading ? "Loading…" : `${filteredEvents.length} events`}
                </div>
              </div>

              {/* Table */}
              <div
                className="overflow-hidden rounded border"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {isLoading ? (
                  <AuditSkeleton />
                ) : filteredEvents.length === 0 ? (
                  <div data-ocid="audit.empty_state">
                    <EmptyState
                      icon={<ClipboardList />}
                      message="No events match the selected filters"
                      className="py-16"
                    />
                  </div>
                ) : (
                  <ScrollArea>
                    <Table data-ocid="audit.table">
                      <TableHeader>
                        <TableRow
                          className="border-b hover:bg-transparent"
                          style={{ borderColor: "#1a2235" }}
                        >
                          {[
                            "Severity",
                            "Type",
                            "Description",
                            "Affected User",
                            "Detected",
                            "Status",
                            "Action",
                          ].map((h) => (
                            <TableHead
                              key={h}
                              className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600"
                              style={{ backgroundColor: "#0d1525" }}
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event, idx) => {
                          const svStyles = getSeverityStyles(event.severity);
                          const affectedName = event.affectedUserId
                            ? resolveName(
                                profiles,
                                event.affectedUserId.toString(),
                              )
                            : "—";

                          return (
                            <TableRow
                              key={event.id}
                              data-ocid={`audit.row.${idx + 1}`}
                              className="border-b hover:bg-white/[0.02]"
                              style={{ borderColor: "#1a2235" }}
                            >
                              {/* Severity */}
                              <TableCell className="py-3">
                                <span
                                  className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                                  style={svStyles}
                                >
                                  {event.severity}
                                </span>
                              </TableCell>

                              {/* Type */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                  {event.eventType}
                                </span>
                              </TableCell>

                              {/* Description */}
                              <TableCell className="max-w-[240px] py-3">
                                <span
                                  className="block truncate font-mono text-[10px] text-slate-300"
                                  title={event.description}
                                >
                                  {event.description}
                                </span>
                              </TableCell>

                              {/* Affected User */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {affectedName}
                                </span>
                              </TableCell>

                              {/* Detected */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] text-slate-500">
                                  {formatRelativeTime(event.detectedAt)}
                                </span>
                              </TableCell>

                              {/* Status */}
                              <TableCell className="py-3">
                                {event.resolved ? (
                                  <Badge
                                    className="border font-mono text-[9px] uppercase tracking-wider"
                                    style={{
                                      backgroundColor: "rgba(74,222,128,0.1)",
                                      borderColor: "rgba(74,222,128,0.3)",
                                      color: "#4ade80",
                                    }}
                                  >
                                    Resolved
                                  </Badge>
                                ) : (
                                  <Badge
                                    className="border font-mono text-[9px] uppercase tracking-wider"
                                    style={{
                                      backgroundColor: "rgba(248,113,113,0.1)",
                                      borderColor: "rgba(248,113,113,0.3)",
                                      color: "#f87171",
                                    }}
                                  >
                                    Unresolved
                                  </Badge>
                                )}
                              </TableCell>

                              {/* Action */}
                              <TableCell className="py-3">
                                {isS2Admin && !event.resolved ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    data-ocid={`audit.resolve.button.${idx + 1}`}
                                    className="h-7 border px-2 font-mono text-[9px] uppercase tracking-wider text-amber-400 hover:text-amber-300"
                                    style={{
                                      borderColor: "rgba(245,158,11,0.3)",
                                      backgroundColor: "rgba(245,158,11,0.05)",
                                    }}
                                    onClick={() => setResolveTarget(event)}
                                  >
                                    Resolve
                                  </Button>
                                ) : (
                                  <span className="font-mono text-[9px] text-slate-700">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </div>
      </main>

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
