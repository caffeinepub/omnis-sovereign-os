import { c as useExtActor, a as useInternetIdentity, a4 as useQueryClient, a3 as useQuery, j as jsxRuntimeExports, L as Link, m as Bell, B as Button, p as ue, M as MessageSquare, F as FolderOpen, l as Shield } from "./index-BlEGMROs.js";
import { u as useMutation, T as TopNav, S as ScrollArea, f as formatRelativeTime } from "./TopNav-D8UQSmDX.js";
import { E as EmptyState } from "./EmptyState-0-AYWQ3I.js";
import { S as SkeletonCard } from "./SkeletonCard-DEpFfpMx.js";
import { e as Badge } from "./displayName-Dizd79pw.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-CXZKGbs0.js";
import "./constants-O6cGduIW.js";
import "./check-BXhHek9h.js";
import "./chevron-right-D4lTJ-EH.js";
function getNotificationIcon(type) {
  switch (type) {
    case "security":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 shrink-0", style: { color: "#f87171" } });
    case "access":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-4 w-4 shrink-0", style: { color: "#60a5fa" } });
    case "message":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        MessageSquare,
        {
          className: "h-4 w-4 shrink-0",
          style: { color: "#4ade80" }
        }
      );
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 shrink-0", style: { color: "#f59e0b" } });
  }
}
function getIconBg(type) {
  switch (type) {
    case "security":
      return "rgba(248,113,113,0.1)";
    case "access":
      return "rgba(96,165,250,0.1)";
    case "message":
      return "rgba(74,222,128,0.1)";
    default:
      return "rgba(245,158,11,0.1)";
  }
}
function NotificationsSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "notifications.loading_state",
      className: "divide-y",
      style: { borderColor: "#1a2235" },
      children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SkeletonCard,
          {
            width: "32px",
            height: "32px",
            className: "shrink-0 rounded"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "10px", width: "40%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "10px", width: "75%" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "10px", width: "50px", className: "shrink-0" })
      ] }, i))
    }
  );
}
function NotificationsPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getMyNotifications();
      return items.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0
  });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", principalStr]
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"]
      });
    },
    onError: () => {
      ue.error("Failed to mark notification as read");
    }
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", principalStr]
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"]
      });
      ue.success("All notifications marked as read");
    },
    onError: () => {
      ue.error("Failed to mark all notifications as read");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "notifications.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Notifications" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                  style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6", style: { color: "#f59e0b" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Notifications" }),
                  unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      className: "rounded-full px-2 py-0.5 font-mono text-[9px] font-bold",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: unreadCount
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: isLoading ? "Loading…" : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}` })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "notifications.mark_all.button",
                variant: "outline",
                size: "sm",
                disabled: markAllReadMutation.isPending || unreadCount === 0 || notifications.length === 0,
                onClick: () => void markAllReadMutation.mutate(),
                className: "border font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 disabled:opacity-40",
                style: {
                  borderColor: "rgba(245,158,11,0.3)",
                  backgroundColor: "transparent"
                },
                children: markAllReadMutation.isPending ? "Marking…" : "Mark All Read"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "overflow-hidden rounded border",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsSkeleton, {}) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "notifications.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                EmptyState,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, {}),
                  message: "No notifications",
                  className: "py-20"
                }
              ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-ocid": "notifications.list.table",
                  className: "divide-y",
                  style: { borderColor: "#1a2235" },
                  children: notifications.map((notif, idx) => {
                    const isUnread = !notif.read;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `notifications.item.${idx + 1}`,
                        onClick: () => {
                          if (isUnread && !markReadMutation.isPending) {
                            void markReadMutation.mutate(notif.id);
                          }
                        },
                        className: "relative flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                        style: {
                          backgroundColor: isUnread ? "rgba(245,158,11,0.04)" : void 0,
                          borderLeft: isUnread ? "2px solid #f59e0b" : "2px solid transparent"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                              style: {
                                backgroundColor: getIconBg(notif.notificationType)
                              },
                              children: getNotificationIcon(notif.notificationType)
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "p",
                              {
                                className: `truncate font-mono text-[11px] uppercase tracking-wider ${isUnread ? "font-bold text-white" : "font-medium text-slate-400"}`,
                                children: notif.title
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500", children: notif.body })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-slate-600", children: formatRelativeTime(notif.createdAt) }),
                            isUnread && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: "font-mono text-[9px] uppercase tracking-wider text-amber-500 hover:text-amber-400",
                                "aria-label": "Click to mark as read",
                                children: "Mark read"
                              }
                            )
                          ] })
                        ]
                      },
                      notif.id
                    );
                  })
                }
              ) })
            }
          )
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
  NotificationsPage as default
};
