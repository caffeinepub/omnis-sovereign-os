import type { Message, Notification } from "@/backend.d";
import { RankSelector } from "@/components/shared/RankSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { NETWORK_MODE_CONFIGS } from "@/config/constants";
import { BRANCH_RANK_CATEGORIES } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useStorageClient } from "@/hooks/useStorageClient";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { formatRelativeTime } from "@/lib/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  PenSquare,
  Settings,
  Shield,
  Unlock,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Infer branch and category from a rank string by scanning BRANCH_RANK_CATEGORIES */
function inferBranchCategory(rank: string): {
  branch: string;
  category: string;
} {
  if (!rank) return { branch: "", category: "" };
  for (const [branch, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [category, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) {
        return { branch, category };
      }
    }
  }
  return { branch: "", category: "" };
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

// ─── Profile Sheet ────────────────────────────────────────────────────────────

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { profile, refreshProfile } = usePermissions();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [orgRole, setOrgRole] = useState(profile?.orgRole ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when profile changes or sheet opens
  useEffect(() => {
    if (open && profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rankStr = profile.rank ?? "";
      setRankVal(rankStr);
      // Infer branch and category from rank so the selector pre-populates correctly
      const inferred = inferBranchCategory(rankStr);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setEmail(profile.email);
      setOrgRole(profile.orgRole);
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [open, profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storageClient || !storageReady) {
      toast.error("Storage not ready. Please try again.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      toast.success("Avatar uploaded");
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!actor || !profile) return;
    setIsSaving(true);
    try {
      const effectiveRank = rankVal.trim() || profile.rank;
      const formattedName = formatDisplayName(
        effectiveRank,
        lastName,
        firstName,
        mi,
      );
      await actor.updateMyProfile({
        ...profile,
        name: formattedName,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: orgRole.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      await refreshProfile();
      toast.success("Profile updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = profile?.name ? getInitials(profile.name) : "??";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="topnav.profile.modal"
        className="flex w-[380px] flex-col border-l p-0 sm:max-w-[380px]"
        style={{ backgroundColor: "#0a0e1a", borderColor: "#1a2235" }}
      >
        <SheetHeader
          className="border-b px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          <SheetTitle className="font-mono text-sm uppercase tracking-[0.2em] text-white">
            Profile
          </SheetTitle>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Non-sensitive fields only
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-6 py-5">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar
                className="h-16 w-16 border-2"
                style={{ borderColor: "rgba(245,158,11,0.3)" }}
              >
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile?.name ?? ""} />
                ) : null}
                <AvatarFallback
                  className="font-mono text-lg font-bold"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarUpload(e)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="topnav.profile.avatar.upload_button"
                className="h-7 gap-1.5 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || !storageReady}
              >
                <Upload className="h-3 w-3" />
                {isUploadingAvatar ? "Uploading…" : "Upload Photo"}
              </Button>
              <button
                type="button"
                data-ocid="topnav.profile.view_full.link"
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/my-profile" });
                }}
              >
                <ExternalLink className="h-3 w-3" />
                View Full Profile
              </button>
            </div>

            {/* Clearance level (read-only) */}
            <div
              className="rounded border px-3 py-2"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                Clearance Level
              </p>
              <p className="mt-0.5 font-mono text-xs text-amber-500">
                {profile?.clearanceLevel !== undefined
                  ? `Level ${Number(profile.clearanceLevel)}`
                  : "—"}{" "}
                <span className="text-slate-600">(managed by S2 admin)</span>
              </p>
            </div>

            {/* Split name inputs */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Name
              </p>
              <div className="grid grid-cols-[1fr_1fr_52px] gap-2">
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Last Name
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.last.input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="SMITH"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    First Name
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.first.input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    MI
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.mi.input"
                    value={mi}
                    onChange={(e) => setMi(e.target.value.slice(0, 1))}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="A"
                    maxLength={1}
                  />
                </div>
              </div>
            </div>

            {/* Rank selector */}
            <RankSelector
              branch={branch}
              category={category}
              rank={rankVal}
              onBranchChange={setBranch}
              onCategoryChange={setCategory}
              onRankChange={setRankVal}
              variant="modal"
            />

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>

            {/* Org Role */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Organizational Role
              </Label>
              <Input
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter
          className="flex gap-2 border-t px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          <Button
            type="button"
            variant="outline"
            data-ocid="topnav.profile.cancel_button"
            className="flex-1 border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="topnav.profile.save_button"
            className="flex-1 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

export function TopNav() {
  const { profile, isS2Admin } = usePermissions();
  const { mode: networkMode } = useNetworkMode();
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const currentPath = router.state.location.pathname;

  // Returns true if the current path starts with or exactly matches the given route
  function isActivePath(to: string): boolean {
    if (to === "/") return currentPath === "/";
    return currentPath === to || currentPath.startsWith(`${to}/`);
  }

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  const handleSignOut = () => {
    // Clear all react-query cache so stale data doesn't bleed into next session
    queryClient.clear();
    // Call clear() to trigger authClient.logout() (clears IndexedDB delegation).
    // Immediately hard-navigate to /login — a full page reload re-creates all
    // React state and the AuthClient from scratch, avoiding the race condition
    // where clear() sets authClient→undefined, re-triggers the init useEffect,
    // briefly sets loginStatus back to "initializing", and leaves the Sign In
    // button disabled on the re-rendered login page.
    clear();
    window.location.href = "/login";
  };

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: [principalStr, "unreadNotificationCount"],
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
    queryKey: [principalStr, "topnav-notifications-preview"],
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
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      void refetchNotifications();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "topnav-notifications-preview"],
      });
      // Immediately refetch while dropdown is open (Step B fix)
      void refetchNotifications();
    },
  });

  // Inbox messages for the dropdown — fetched on demand via refetch
  const { data: recentInboxMessages = [], refetch: refetchInbox } = useQuery<
    Message[]
  >({
    queryKey: [principalStr, "topnav-inbox-preview"],
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

  const initials = profile?.name ? getInitials(profile.name) : "OP";
  // profile.name is already formatted as "RANK LAST, First MI" — use it directly
  const displayName = profile?.name?.trim() || "OPERATOR";

  const navLinks = [
    { label: "Documents", to: "/documents", ocid: "topnav.documents.link" },
    { label: "Messaging", to: "/messages", ocid: "topnav.messages.link" },
    {
      label: "File Storage",
      to: "/file-storage",
      ocid: "topnav.file_storage.link",
    },
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

  const secondaryNavLinks = [
    {
      label: "Notifications",
      to: "/notifications",
      ocid: "topnav.notifications.link",
    },
    { label: "Audit Log", to: "/audit-log", ocid: "topnav.audit_log.link" },
    {
      label: "Announcements",
      to: "/announcements",
      ocid: "topnav.announcements.link",
    },
    { label: "Calendar", to: "/calendar", ocid: "topnav.calendar.link" },
    { label: "Tasks", to: "/tasks", ocid: "topnav.tasks.link" },
    { label: "Settings", to: "/settings", ocid: "topnav.settings.link" },
    { label: "Governance", to: "/governance", ocid: "topnav.governance.link" },
    { label: "Help", to: "/help", ocid: "topnav.help.link" },
  ] as const;

  return (
    <>
      <ProfileSheet
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
      />

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
            className="flex flex-col shrink-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              className="font-mono text-lg font-bold uppercase tracking-[0.25em] leading-none"
              style={{ color: "#f59e0b" }}
            >
              OMNIS
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-none mt-0.5 sm:block">
              Sovereign OS
            </span>
          </Link>

          {/* Network mode badge — shown when mode is configured */}
          {networkMode && (
            <span
              className="rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
              style={{
                borderColor: networkMode.startsWith("military")
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(139,92,246,0.4)",
                color: networkMode.startsWith("military")
                  ? "#60a5fa"
                  : "#a78bfa",
                backgroundColor: networkMode.startsWith("military")
                  ? "rgba(59,130,246,0.08)"
                  : "rgba(139,92,246,0.08)",
              }}
            >
              {NETWORK_MODE_CONFIGS[networkMode]?.shortCode ?? ""}
            </span>
          )}

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
              {navLinks.map((link) => {
                const active = isActivePath(link.to);
                return (
                  <DropdownMenuItem
                    key={link.to}
                    data-ocid={link.ocid}
                    className="cursor-pointer font-mono text-xs uppercase tracking-widest hover:text-white focus:text-white"
                    style={{ color: active ? "#f59e0b" : "#cbd5e1" }}
                    onClick={() => void navigate({ to: link.to })}
                  >
                    {active && (
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                  </DropdownMenuItem>
                );
              })}
              {isS2Admin && (
                <DropdownMenuItem
                  data-ocid="topnav.hub_dropdown.admin_panel.link"
                  className="cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300"
                  onClick={() => void navigate({ to: "/admin" })}
                >
                  <Settings className="mr-2 h-3 w-3" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ backgroundColor: "#1a2235" }} />
              {secondaryNavLinks.map((link) => {
                const active = isActivePath(link.to);
                return (
                  <DropdownMenuItem
                    key={link.to}
                    data-ocid={link.ocid}
                    className="cursor-pointer font-mono text-[10px] uppercase tracking-widest hover:text-slate-300 focus:text-slate-300"
                    style={{ color: active ? "#f59e0b" : "#64748b" }}
                    onClick={() => void navigate({ to: link.to })}
                  >
                    {active && (
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right — Actions + user */}
        <div className="flex items-center gap-1">
          {/* Ctrl+K command palette hint */}
          <button
            type="button"
            data-ocid="topnav.command_palette_open"
            aria-label="Open command palette (Ctrl+K)"
            className="hidden items-center gap-1 rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex"
            style={{ borderColor: "#1a2235", backgroundColor: "transparent" }}
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                }),
              );
            }}
          >
            <span>⌘K</span>
          </button>

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
                            <div className="flex min-w-0 items-center gap-1.5">
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
                data-ocid="topnav.profile.open_modal_button"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
                onClick={() => setProfileSheetOpen(true)}
              >
                <User className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="topnav.my_profile.link"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
                onClick={() => void navigate({ to: "/my-profile" })}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                My Profile
              </DropdownMenuItem>
              {isS2Admin && (
                <DropdownMenuItem
                  data-ocid="topnav.admin_panel.link"
                  className="cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300"
                  onClick={() => void navigate({ to: "/admin" })}
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ backgroundColor: "#1a2235" }} />
              <DropdownMenuItem
                data-ocid="topnav.signout.button"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300 focus:text-red-300"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
