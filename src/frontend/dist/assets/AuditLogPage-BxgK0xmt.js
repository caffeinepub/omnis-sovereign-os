import { c as useExtActor, a as useInternetIdentity, h as usePermissions, b as useNavigate, a4 as useQueryClient, r as reactExports, a3 as useQuery, j as jsxRuntimeExports, B as Button, p as ue } from "./index-CnBkd1vF.js";
import { u as useMutation, T as TopNav, S as ScrollArea, f as formatRelativeTime } from "./TopNav-D92LzMme.js";
import { C as ConfirmDialog } from "./ConfirmDialog-DiFls1EX.js";
import { E as EmptyState } from "./EmptyState-BDJMqCdQ.js";
import { S as SkeletonCard } from "./SkeletonCard-i07i4n6l.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as Badge } from "./displayName-B5NkxsrN.js";
import { T as Table, d as TableHeader, b as TableRow, e as TableHead, a as TableBody, c as TableCell } from "./table-CGHcNlzb.js";
import { S as SEVERITY_COLORS } from "./constants-O6cGduIW.js";
import { C as ChevronRight } from "./chevron-right-B23VjFYD.js";
import { C as ClipboardList } from "./clipboard-list-C6k5BaYX.js";
import { S as ShieldOff } from "./shield-off-Bb7Fec01.js";
import "./check-C4XqBZ-7.js";
function truncatePrincipal(p) {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}…${p.slice(-4)}`;
}
function resolveName(profiles, principalStr) {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match)
    return `${match.rank} ${match.name}`.trim() || truncatePrincipal(principalStr);
  return truncatePrincipal(principalStr);
}
function getSeverityStyles(severity) {
  const color = SEVERITY_COLORS[severity.toLowerCase()] ?? "gray";
  const map = {
    red: {
      borderColor: "rgba(248,113,113,0.4)",
      color: "#f87171",
      backgroundColor: "rgba(248,113,113,0.1)"
    },
    orange: {
      borderColor: "rgba(251,146,60,0.4)",
      color: "#fb923c",
      backgroundColor: "rgba(251,146,60,0.1)"
    },
    yellow: {
      borderColor: "rgba(250,204,21,0.4)",
      color: "#facc15",
      backgroundColor: "rgba(250,204,21,0.1)"
    },
    green: {
      borderColor: "rgba(74,222,128,0.4)",
      color: "#4ade80",
      backgroundColor: "rgba(74,222,128,0.1)"
    },
    gray: {
      borderColor: "rgba(148,163,184,0.2)",
      color: "#94a3b8",
      backgroundColor: "rgba(148,163,184,0.05)"
    }
  };
  return map[color] ?? map.gray;
}
function AuditSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "audit.loading_state",
      className: "divide-y",
      style: { borderColor: "#1a2235" },
      children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "18px", width: "60px" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "18px", width: "80px" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "flex-1 h-[18px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "18px", width: "80px" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "18px", width: "60px" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "18px", width: "70px" })
      ] }, i))
    }
  );
}
function AuditLogPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const { isS2Admin, isLoading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  const [severityFilter, setSeverityFilter] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [resolveTarget, setResolveTarget] = reactExports.useState(null);
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["anomalyEvents", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getAnomalyEvents();
      return items.sort((a, b) => a.detectedAt > b.detectedAt ? -1 : 1);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["allProfiles", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching
  });
  const resolveMutation = useMutation({
    mutationFn: async (event) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      await actor.resolveAnomalyEvent(event.id, identity.getPrincipal());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["anomalyEvents", principalStr]
      });
      setResolveTarget(null);
      ue.success("Anomaly event resolved");
    },
    onError: () => {
      ue.error("Failed to resolve event");
      setResolveTarget(null);
    }
  });
  const filteredEvents = events.filter((e) => {
    const severityMatch = severityFilter === "all" || e.severity.toLowerCase() === severityFilter.toLowerCase();
    const statusMatch = statusFilter === "all" || (statusFilter === "resolved" ? e.resolved : !e.resolved);
    return severityMatch && statusMatch;
  });
  const isLoading = eventsLoading || permissionsLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "audit.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfirmDialog,
          {
            isOpen: !!resolveTarget,
            onOpenChange: (v) => {
              if (!v) setResolveTarget(null);
            },
            title: "Resolve Anomaly Event?",
            description: "Mark this event as resolved. This action is logged and cannot be undone.",
            confirmLabel: resolveMutation.isPending ? "Resolving…" : "Resolve",
            cancelLabel: "Cancel",
            onConfirm: () => {
              if (resolveTarget) void resolveMutation.mutate(resolveTarget);
            },
            onCancel: () => setResolveTarget(null)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => void navigate({ to: "/" }),
                className: "font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                children: "Hub"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-slate-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-300", children: "Audit Log" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-6 w-6", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Audit Log" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Anomaly events and oversight trail" })
            ] })
          ] }),
          !isLoading && !isS2Admin ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "audit.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            EmptyState,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, {}),
              message: "Access restricted to S2 administrators",
              className: "py-24"
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "mb-4 flex flex-wrap items-center gap-3 rounded border px-4 py-3",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Severity" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: severityFilter,
                        onValueChange: setSeverityFilter,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectTrigger,
                            {
                              "data-ocid": "audit.severity.select",
                              className: "h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-slate-300",
                              style: {
                                backgroundColor: "#1a2235",
                                borderColor: "#2a3347"
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectContent,
                            {
                              style: {
                                backgroundColor: "#0f1626",
                                borderColor: "#1a2235"
                              },
                              children: ["all", "critical", "high", "medium", "low"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectItem,
                                {
                                  value: s,
                                  className: "font-mono text-[10px] uppercase tracking-wider text-slate-300",
                                  children: s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)
                                },
                                s
                              ))
                            }
                          )
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: ["all", "unresolved", "resolved"].map(
                    (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "audit.status.tab",
                        onClick: () => setStatusFilter(s),
                        className: "rounded px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        style: statusFilter === s ? {
                          backgroundColor: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.3)"
                        } : {
                          color: "#64748b",
                          border: "1px solid transparent"
                        },
                        children: s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)
                      },
                      s
                    )
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto font-mono text-[9px] uppercase tracking-widest text-slate-600", children: isLoading ? "Loading…" : `${filteredEvents.length} events` })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "overflow-hidden rounded border",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(AuditSkeleton, {}) : filteredEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "audit.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  EmptyState,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, {}),
                    message: "No events match the selected filters",
                    className: "py-16"
                  }
                ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { "data-ocid": "audit.table", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TableRow,
                    {
                      className: "border-b hover:bg-transparent",
                      style: { borderColor: "#1a2235" },
                      children: [
                        "Severity",
                        "Type",
                        "Description",
                        "Affected User",
                        "Detected",
                        "Status",
                        "Action"
                      ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TableHead,
                        {
                          className: "font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600",
                          style: { backgroundColor: "#0d1525" },
                          children: h
                        },
                        h
                      ))
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredEvents.map((event, idx) => {
                    const svStyles = getSeverityStyles(event.severity);
                    const affectedName = event.affectedUserId ? resolveName(
                      profiles,
                      event.affectedUserId.toString()
                    ) : "—";
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      TableRow,
                      {
                        "data-ocid": `audit.row.${idx + 1}`,
                        className: "border-b hover:bg-white/[0.02]",
                        style: { borderColor: "#1a2235" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: "rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                              style: svStyles,
                              children: event.severity
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: event.eventType }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[240px] py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: "block truncate font-mono text-[10px] text-slate-300",
                              title: event.description,
                              children: event.description
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-400", children: affectedName }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-500", children: formatRelativeTime(event.detectedAt) }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: event.resolved ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: "border font-mono text-[9px] uppercase tracking-wider",
                              style: {
                                backgroundColor: "rgba(74,222,128,0.1)",
                                borderColor: "rgba(74,222,128,0.3)",
                                color: "#4ade80"
                              },
                              children: "Resolved"
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: "border font-mono text-[9px] uppercase tracking-wider",
                              style: {
                                backgroundColor: "rgba(248,113,113,0.1)",
                                borderColor: "rgba(248,113,113,0.3)",
                                color: "#f87171"
                              },
                              children: "Unresolved"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: isS2Admin && !event.resolved ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              type: "button",
                              variant: "ghost",
                              size: "sm",
                              "data-ocid": `audit.resolve.button.${idx + 1}`,
                              className: "h-7 border px-2 font-mono text-[9px] uppercase tracking-wider text-amber-400 hover:text-amber-300",
                              style: {
                                borderColor: "rgba(245,158,11,0.3)",
                                backgroundColor: "rgba(245,158,11,0.05)"
                              },
                              onClick: () => setResolveTarget(event),
                              children: "Resolve"
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-slate-700", children: "—" }) })
                        ]
                      },
                      event.id
                    );
                  }) })
                ] }) })
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "border-t px-4 py-4 text-center",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              ".",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "transition-colors hover:text-slate-400",
                  children: "Built with love using caffeine.ai"
                }
              )
            ] })
          }
        )
      ]
    }
  );
}
export {
  AuditLogPage as default
};
