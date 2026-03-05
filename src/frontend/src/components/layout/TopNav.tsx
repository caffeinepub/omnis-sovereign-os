import type { Message, Notification } from "@/backend.d";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  PenSquare,
  Shield,
  Unlock,
  User,
} from "lucide-react";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "clearance_changed":
      return <Shield className="h-4 w-4 shrink-0 text-slate-400" />;
    case "access_granted":
      return <Unlock className="h-4 w-4 shrink-0 text-green-400" />;
    case "access_revoked":
      return <Lock className="h-4 w-4 shrink-0 text-red-400" />;
    case "anomaly_detected":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />;
    case "message_received":
      return <Mail className="h-4 w-4 shrink-0 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 shrink-0 text-slate-400" />;
  }
}

export function TopNav() {
  const { profile, isS2Admin } = usePermissions();
  const { clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const count = await actor.getUnreadNotificationCount();
        return Number(count);
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 30_000,
  });

  // Notifications for the dropdown — fetched on demand via refetch
  const {
    data: notifications = [],
    isFetching: notifsFetching,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ["topnav-notifications-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const items = await actor.getMyNotifications();
        return items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      } catch {
        return [];
      }
    },
    enabled: false, // only fetch on dropdown open
    staleTime: 0,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["unreadNotificationCount"],
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["unreadNotificationCount"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["topnav-notifications-preview"],
      });
    },
  });

  // Inbox messages for the dropdown — fetched on demand via refetch
  const { data: recentInboxMessages = [], refetch: refetchInbox } = useQuery<
    Message[]
  >({
    queryKey: ["topnav-inbox-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const msgs = await actor.getInboxMessages();
        return msgs
          .filter((m) => !m.deleted)
          .sort((a, b) => (a.sentAt > b.sentAt ? -1 : 1))
          .slice(0, 5);
      } catch {
        return [];
      }
    },
    enabled: false, // only fetch on dropdown open
    staleTime: 0,
  });

  // Count unread inbox messages
  const unreadMsgCount = recentInboxMessages.filter((m) => !m.read).length;

  const initials = profile?.name ? getInitials(profile.name) : "??";
  const displayName = profile
    ? `${profile.rank} ${profile.name}`.trim()
    : "Unknown";

  const navLinks = [
    { label: "Documents", to: "/documents", ocid: "topnav.documents.link" },
    { label: "Messaging", to: "/messages", ocid: "topnav.messages.link" },
    {
      label: "Personnel Directory",
      to: "/personnel",
      ocid: "topnav.personnel.link",
    },
    {
      label: "Email Directory",
      to: "/email-directory",
      ocid: "topnav.email_directory.link",
    },
    {
      label: "File Storage",
      to: "/file-storage",
      ocid: "topnav.file_storage.link",
    },
    ...(isS2Admin
      ? [
          {
            label: "Access Monitoring",
            to: "/monitoring",
            ocid: "topnav.monitoring.link",
          },
        ]
      : []),
  ] as const;

  return (
    <header
      className="sticky top-0 z-50 flex h-14 w-full items-center justify-between px-4"
      style={{
        backgroundColor: "#0a0e1a",
        borderBottom: "1px solid #1a2235",
      }}
    >
      {/* Left — OMNIS wordmark + Hub dropdown */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          data-ocid="topnav.link"
          className="font-mono text-lg font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: "#f59e0b" }}
        >
          OMNIS
        </Link>

        {/* Hub dropdown — immediately right of logo */}
        <DropdownMenu>
          <DropdownMenuTrigger
            data-ocid="topnav.hub_dropdown.toggle"
            className="flex items-center gap-1 rounded px-3 py-1.5 font-mono text-sm font-semibold uppercase tracking-widest text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Hub
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[200px] border font-mono"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            {navLinks.map((link) => (
              <DropdownMenuItem
                key={link.to}
                data-ocid={link.ocid}
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
                onClick={() => void navigate({ to: link.to })}
              >
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right — Actions + user */}
      <div className="flex items-center gap-1">
        {/* Messages dropdown */}
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) void refetchInbox();
          }}
        >
          <DropdownMenuTrigger
            data-ocid="topnav.messages_dropdown.toggle"
            className="relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Messages"
          >
            <MessageSquare className="h-[18px] w-[18px]" />
            {unreadMsgCount > 0 && (
              <Badge
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[320px] border p-0 font-mono"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between border-b px-3 py-2"
              style={{ borderColor: "#1a2235" }}
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Messages
              </span>
              <button
                type="button"
                data-ocid="topnav.messages_dropdown.compose_button"
                className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() =>
                  void navigate({
                    to: "/messages",
                    search: { compose: "true" },
                  })
                }
              >
                <PenSquare className="h-3 w-3" />
                Compose
              </button>
            </div>

            {/* Message list */}
            {recentInboxMessages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <MessageSquare className="h-6 w-6 text-slate-700" />
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  No messages
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="py-1">
                  {recentInboxMessages.map((msg, idx) => {
                    const isUnread = !msg.read;
                    const truncatedSubject =
                      msg.subject.length > 40
                        ? `${msg.subject.slice(0, 40)}…`
                        : msg.subject;

                    return (
                      <DropdownMenuItem
                        key={msg.id}
                        data-ocid={`topnav.messages_dropdown.item.${idx + 1}`}
                        className="flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5 focus:bg-white/5"
                        style={{
                          backgroundColor: isUnread
                            ? "rgba(245,158,11,0.04)"
                            : undefined,
                        }}
                        onClick={() => void navigate({ to: "/messages" })}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isUnread && (
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: "#f59e0b" }}
                              />
                            )}
                            <span
                              className={
                                isUnread
                                  ? "truncate font-mono text-[10px] font-bold uppercase tracking-wider text-white"
                                  : "truncate font-mono text-[10px] uppercase tracking-wider text-slate-400"
                              }
                            >
                              {truncatedSubject}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[9px] text-slate-600">
                            {formatRelativeTime(msg.sentAt)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Footer */}
            <div className="border-t" style={{ borderColor: "#1a2235" }}>
              <DropdownMenuItem
                data-ocid="topnav.messages_dropdown.view_all.link"
                className="cursor-pointer justify-center py-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 hover:text-amber-400 focus:text-amber-400"
                onClick={() => void navigate({ to: "/messages" })}
              >
                View all messages
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification bell dropdown */}
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) void refetchNotifications();
          }}
        >
          <DropdownMenuTrigger
            data-ocid="notifications.bell_button"
            className="relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-ocid="notifications.dropdown_menu"
            align="end"
            className="w-[340px] border p-0 font-mono"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between border-b px-3 py-2"
              style={{ borderColor: "#1a2235" }}
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Notifications
              </span>
              <button
                type="button"
                data-ocid="notifications.mark_all_button"
                className="font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
                onClick={() => void markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>

            {/* Notification list */}
            {notifsFetching ? (
              <div
                data-ocid="notifications.loading_state"
                className="space-y-px py-1"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                    <Skeleton
                      className="h-4 w-4 shrink-0 rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton
                        className="h-2.5 w-3/4 rounded"
                        style={{ backgroundColor: "#1a2235" }}
                      />
                      <Skeleton
                        className="h-2 w-full rounded"
                        style={{ backgroundColor: "#1a2235" }}
                      />
                    </div>
                    <Skeleton
                      className="h-2 w-10 shrink-0 rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div
                data-ocid="notifications.empty_state"
                className="flex flex-col items-center gap-2 py-8 text-center"
              >
                <Bell className="h-6 w-6 text-slate-700" />
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  No notifications
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[360px]">
                <div className="py-1">
                  {notifications.map((notif, idx) => {
                    const isUnread = !notif.read;
                    const isAnomaly =
                      notif.notificationType === "anomaly_detected";

                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        data-ocid={`notifications.item.${idx + 1}`}
                        className="flex cursor-pointer items-start gap-3 px-3 py-2.5 focus:bg-white/5"
                        style={{
                          backgroundColor: isUnread
                            ? "rgba(245,158,11,0.05)"
                            : undefined,
                          borderLeft: isAnomaly
                            ? "2px solid #f59e0b"
                            : "2px solid transparent",
                          opacity: notif.read ? 0.6 : 1,
                          transition: "opacity 0.2s ease",
                        }}
                        onClick={() => {
                          if (isUnread) {
                            void markReadMutation.mutate(notif.id);
                          }
                        }}
                      >
                        {/* Type icon */}
                        <div className="mt-0.5 shrink-0">
                          {getNotificationIcon(notif.notificationType)}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-mono text-[10px] uppercase tracking-wider ${
                              isUnread
                                ? "font-bold text-white"
                                : "font-medium text-slate-400"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-500">
                            {notif.body}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <span className="mt-0.5 shrink-0 font-mono text-[9px] text-slate-600">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            data-ocid="topnav.user_dropdown.toggle"
            className="ml-1 flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Avatar
              className="h-7 w-7 border"
              style={{ borderColor: "#1a2235" }}
            >
              {profile?.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              ) : null}
              <AvatarFallback
                className="font-mono text-[10px] font-bold"
                style={{ backgroundColor: "#1a2235", color: "#f59e0b" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:block">
              {displayName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[160px] border font-mono"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <DropdownMenuItem
              data-ocid="topnav.profile.link"
              className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
              onClick={() => {
                console.log("Profile clicked");
              }}
            >
              <User className="mr-2 h-3.5 w-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ backgroundColor: "#1a2235" }} />
            <DropdownMenuItem
              data-ocid="topnav.signout.button"
              className="cursor-pointer font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300 focus:text-red-300"
              onClick={clear}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
