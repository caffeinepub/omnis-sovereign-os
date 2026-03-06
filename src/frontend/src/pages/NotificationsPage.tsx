import type { Notification } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  FolderOpen,
  MessageSquare,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "security":
      return (
        <Shield className="h-4 w-4 shrink-0" style={{ color: "#f87171" }} />
      );
    case "access":
      return (
        <FolderOpen className="h-4 w-4 shrink-0" style={{ color: "#60a5fa" }} />
      );
    case "message":
      return (
        <MessageSquare
          className="h-4 w-4 shrink-0"
          style={{ color: "#4ade80" }}
        />
      );
    default:
      // "system" and everything else
      return <Bell className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />;
  }
}

function getIconBg(type: string): string {
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

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div
      data-ocid="notifications.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <SkeletonCard
            width="32px"
            height="32px"
            className="shrink-0 rounded"
          />
          <div className="flex-1 space-y-2">
            <SkeletonCard height="10px" width="40%" />
            <SkeletonCard height="10px" width="75%" />
          </div>
          <SkeletonCard height="10px" width="50px" className="shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── NotificationsPage ────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["notifications", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getMyNotifications();
      return items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mark single read ──────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      void refetch();
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  // ── Mark all read ─────────────────────────────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void refetch();
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  return (
    <div
      data-ocid="notifications.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
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
              Notifications
            </span>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                <Bell className="h-6 w-6" style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <Badge
                      className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
                      style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                  {isLoading
                    ? "Loading…"
                    : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Mark all read */}
            <Button
              type="button"
              data-ocid="notifications.mark_all.button"
              variant="outline"
              size="sm"
              disabled={
                markAllReadMutation.isPending ||
                unreadCount === 0 ||
                notifications.length === 0
              }
              onClick={() => void markAllReadMutation.mutate()}
              className="border font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 disabled:opacity-40"
              style={{
                borderColor: "rgba(245,158,11,0.3)",
                backgroundColor: "transparent",
              }}
            >
              {markAllReadMutation.isPending ? "Marking…" : "Mark All Read"}
            </Button>
          </div>

          {/* Content card */}
          <div
            className="overflow-hidden rounded border"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.length === 0 ? (
              <div data-ocid="notifications.empty_state">
                <EmptyState
                  icon={<Bell />}
                  message="No notifications"
                  className="py-20"
                />
              </div>
            ) : (
              <ScrollArea>
                <div
                  data-ocid="notifications.list.table"
                  className="divide-y"
                  style={{ borderColor: "#1a2235" }}
                >
                  {notifications.map((notif, idx) => {
                    const isUnread = !notif.read;
                    return (
                      <button
                        type="button"
                        key={notif.id}
                        data-ocid={`notifications.item.${idx + 1}`}
                        onClick={() => {
                          if (isUnread && !markReadMutation.isPending) {
                            void markReadMutation.mutate(notif.id);
                          }
                        }}
                        className="relative flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                        style={{
                          backgroundColor: isUnread
                            ? "rgba(245,158,11,0.04)"
                            : undefined,
                          borderLeft: isUnread
                            ? "2px solid #f59e0b"
                            : "2px solid transparent",
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                          style={{
                            backgroundColor: getIconBg(notif.notificationType),
                          }}
                        >
                          {getNotificationIcon(notif.notificationType)}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-mono text-[11px] uppercase tracking-wider ${
                              isUnread
                                ? "font-bold text-white"
                                : "font-medium text-slate-400"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500">
                            {notif.body}
                          </p>
                        </div>

                        {/* Right side: timestamp + mark read */}
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="font-mono text-[9px] text-slate-600">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                          {isUnread && (
                            <span
                              className="font-mono text-[9px] uppercase tracking-wider text-amber-500 hover:text-amber-400"
                              aria-label="Click to mark as read"
                            >
                              Mark read
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
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
