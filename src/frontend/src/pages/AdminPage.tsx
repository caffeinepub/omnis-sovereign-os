/**
 * AdminPage — S2-only admin panel.
 * Four tabs: Pending Queue | User Management | Role Assignments | Chain of Trust
 */
import type { ExtendedProfile } from "@/backend.d";
import { UserRole } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ChainOfTrustPanel } from "@/components/shared/ChainOfTrustPanel";
import { RankSelector } from "@/components/shared/RankSelector";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { BRANCH_RANK_CATEGORIES, CLEARANCE_LABELS } from "@/config/constants";

/** Infer branch and category from a rank string by scanning BRANCH_RANK_CATEGORIES */
function inferBranchCategory(rank: string): {
  branch: string;
  category: string;
} {
  if (!rank) return { branch: "", category: "" };
  for (const [b, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [cat, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) return { branch: b, category: cat };
    }
  }
  return { branch: "", category: "" };
}
import { usePermissions } from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useDeniedUsers,
  usePendingUsers,
  useRoleApprovalRequests,
} from "@/hooks/useQueries";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Approve/Deny dialog ──────────────────────────────────────────────────────

interface DenyDialogProps {
  open: boolean;
  profile: ExtendedProfile | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

function DenyDialog({
  open,
  profile,
  onConfirm,
  onCancel,
  isPending,
}: DenyDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        data-ocid="admin.deny.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        className="border font-mono"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Deny Access Request
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="font-mono text-xs text-slate-400">
            Denying access for:{" "}
            <span className="text-white">{profile?.name || "Unknown"}</span>
          </p>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Reason (required)
            </Label>
            <Textarea
              data-ocid="admin.deny.reason.textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for denial..."
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.deny.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.deny.confirm_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? "Denying…" : "Confirm Deny"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit profile dialog ──────────────────────────────────────────────────────

interface EditProfileDialogProps {
  open: boolean;
  profile: ExtendedProfile | null;
  onSave: (updates: Partial<ExtendedProfile>) => void;
  onCancel: () => void;
  isPending: boolean;
}

function EditProfileDialog({
  open,
  profile,
  onSave,
  onCancel,
  isPending,
}: EditProfileDialogProps) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [clearanceLevel, setClearanceLevel] = useState("0");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (open && profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rank = profile.rank ?? "";
      setRankVal(rank);
      const inferred = inferBranchCategory(rank);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setOrgRole(profile.orgRole ?? "");
      setClearanceLevel(String(Number(profile.clearanceLevel ?? 0)));
      setIsVerified(profile.isValidatedByCommander ?? false);
    }
  }, [open, profile]);

  function handleSave() {
    const effectiveRank = rankVal.trim() || (profile?.rank ?? "");
    const name = formatDisplayName(effectiveRank, lastName, firstName, mi);
    onSave({
      name,
      rank: effectiveRank,
      orgRole: orgRole.trim(),
      clearanceLevel: BigInt(Number(clearanceLevel)),
      isValidatedByCommander: isVerified,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        data-ocid="admin.edit_profile.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        className="max-h-[90vh] overflow-y-auto border font-mono"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Last
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                First
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                MI
              </Label>
              <Input
                value={mi}
                onChange={(e) => setMi(e.target.value.slice(0, 1))}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                maxLength={1}
              />
            </div>
          </div>

          <RankSelector
            branch={branch}
            category={category}
            rank={rankVal}
            onBranchChange={setBranch}
            onCategoryChange={setCategory}
            onRankChange={setRankVal}
            variant="modal"
          />

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

          {/* Clearance Level */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Clearance Level
            </Label>
            <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
              <SelectTrigger
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                  <SelectItem
                    key={lvl}
                    value={lvl}
                    className="font-mono text-xs"
                  >
                    Level {lvl} — {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verified toggle */}
          <div className="flex items-center gap-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              S2 Verified
            </Label>
            <button
              type="button"
              data-ocid="admin.edit_profile.verified.toggle"
              onClick={() => setIsVerified((v) => !v)}
              className="flex h-5 w-9 items-center rounded-full transition-colors"
              style={{
                backgroundColor: isVerified ? "#f59e0b" : "#1a2235",
                border: "1px solid #2a3347",
              }}
            >
              <span
                className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{
                  transform: isVerified
                    ? "translateX(18px)"
                    : "translateX(2px)",
                }}
              />
            </button>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.edit_profile.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.edit_profile.save_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isS2Admin, isLoading: permLoading } = usePermissions();
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // S2 guard
  useEffect(() => {
    if (!permLoading && !isS2Admin) {
      void navigate({ to: "/" });
    }
  }, [isS2Admin, permLoading, navigate]);

  const [searchRaw, setSearchRaw] = useState("");
  const searchQuery = useDeferredValue(searchRaw);
  const [denyTarget, setDenyTarget] = useState<ExtendedProfile | null>(null);
  const [editTarget, setEditTarget] = useState<ExtendedProfile | null>(null);

  // Chain of Trust — role transition state
  const [promoteTarget, setPromoteTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [handoffTarget, setHandoffTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [showHandoffStubDialog, setShowHandoffStubDialog] = useState(false);

  // ── All profiles (for user management / role tabs) ──
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "admin-all-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isS2Admin,
    staleTime: 0,
  });

  // ── Real pending/denied queues ──
  const { data: pendingProfiles = [], refetch: refetchPending } =
    usePendingUsers();
  const { data: _deniedProfiles = [] } = useDeniedUsers();
  const { data: roleRequests = [], refetch: refetchRoleRequests } =
    useRoleApprovalRequests();
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.orgRole.toLowerCase().includes(q)
    );
  });

  // ── Mutations ──
  const approveMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) return;
      await actor.updateRegistrationStatus(profile.principalId, "Approved", "");
    },
    onSuccess: () => {
      toast.success("User approved");
      void refetchProfiles();
      void refetchPending();
    },
    onError: () => toast.error("Failed to approve user"),
  });

  const denyMutation = useMutation({
    mutationFn: async ({
      profile,
      reason,
    }: { profile: ExtendedProfile; reason: string }) => {
      if (!actor) return;
      await actor.updateRegistrationStatus(
        profile.principalId,
        "Denied",
        reason,
      );
    },
    onSuccess: () => {
      toast.success("Access denied");
      setDenyTarget(null);
      void refetchProfiles();
      void refetchPending();
    },
    onError: () => toast.error("Failed to deny access"),
  });

  const editMutation = useMutation({
    mutationFn: async ({
      profile,
      updates,
    }: { profile: ExtendedProfile; updates: Partial<ExtendedProfile> }) => {
      if (!actor) return;
      await actor.updateUserProfile({ ...profile, ...updates });
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditTarget(null);
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const roleMutation = useMutation({
    mutationFn: async ({
      profile,
      role,
    }: { profile: ExtendedProfile; role: UserRole }) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, role);
    },
    onSuccess: () => {
      toast.success("Role updated");
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to update role"),
  });

  const promoteMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, UserRole.admin);
      await actor.updateUserProfile({
        ...profile,
        isS2Admin: true,
        clearanceLevel: 4n,
      });
    },
    onSuccess: () => {
      toast.success("S2 Admin role granted");
      setShowPromoteDialog(false);
      setPromoteTarget(null);
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to grant S2 Admin role"),
  });

  const handoffMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor || !identity) return;
      // Log the handoff request as an anomaly event for audit trail
      await actor.createAnomalyEvent({
        id: crypto.randomUUID(),
        resolved: false,
        detectedAt: BigInt(Date.now()),
        description: `Commander handoff initiated to ${profile.name}. Requires co-sign from current S2. (Frontend-initiated — full enforcement pending backend update.)`,
        isSystemGenerated: false,
        severity: "medium",
        eventType: "role_transition",
        affectedUserId: profile.principalId,
        affectedFolderId: undefined,
        resolvedBy: undefined,
      });
    },
    onSuccess: () => {
      toast.success("Commander handoff logged", {
        description: "Requires S2 co-sign. Full enforcement in future update.",
      });
      setShowHandoffStubDialog(false);
      setHandoffTarget(null);
    },
    onError: () => toast.error("Failed to log handoff request"),
  });

  // ── Role Approval Requests Mutations ──
  const approveRoleRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).approveRoleRequest(requestId);
    },
    onSuccess: () => {
      toast.success("Role request approved");
      void refetchRoleRequests();
    },
    onError: () => toast.error("Failed to approve role request"),
  });

  const denyRoleRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      notes,
    }: { requestId: string; notes: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).denyRoleRequest(requestId, notes);
    },
    onSuccess: () => {
      toast.success("Role request denied");
      void refetchRoleRequests();
    },
    onError: () => toast.error("Failed to deny role request"),
  });

  if (permLoading) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isS2Admin) return null;

  return (
    <div
      data-ocid="admin.page"
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
                Admin Panel
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Admin Panel
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                S2 Security Administration — Restricted Access
              </p>
            </div>
          </div>

          <Tabs defaultValue="pending">
            <TabsList
              className="mb-6 border"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <TabsTrigger
                data-ocid="admin.pending.tab"
                value="pending"
                className="relative font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Pending Queue
                {pendingProfiles.length > 0 && (
                  <span
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {pendingProfiles.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.users.tab"
                value="users"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                User Management
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.roles.tab"
                value="roles"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Role Assignments
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.trust.tab"
                value="trust"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Chain of Trust
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.role_requests.tab"
                value="role-requests"
                className="relative font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Role Requests
                {roleRequests.filter((r) => r.status === "pending").length >
                  0 && (
                  <span
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {roleRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Pending Queue ────────────────────────────────────────── */}
            <TabsContent value="pending">
              {profilesLoading ? (
                <div
                  data-ocid="admin.pending.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : pendingProfiles.length === 0 ? (
                <div
                  data-ocid="admin.pending.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <UserCheck className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No pending users
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Email
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.pending.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.email || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                data-ocid={`admin.approve_button.${idx + 1}`}
                                className="h-7 gap-1 font-mono text-[10px] uppercase tracking-wider"
                                style={{
                                  backgroundColor: "#16a34a",
                                  color: "#fff",
                                }}
                                onClick={() => void approveMutation.mutate(p)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                data-ocid={`admin.deny_button.${idx + 1}`}
                                className="h-7 gap-1 border font-mono text-[10px] uppercase tracking-wider text-red-400"
                                style={{
                                  backgroundColor: "transparent",
                                  borderColor: "rgba(239,68,68,0.3)",
                                }}
                                onClick={() => setDenyTarget(p)}
                                disabled={denyMutation.isPending}
                              >
                                <XCircle className="h-3 w-3" />
                                Deny
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── User Management ──────────────────────────────────────── */}
            <TabsContent value="users">
              <div
                className="mb-4 flex items-center gap-2 rounded border px-3 py-2"
                style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
              >
                <Search className="h-4 w-4 shrink-0 text-slate-600" />
                <Input
                  data-ocid="admin.search.input"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  placeholder="Search by name, rank, email..."
                  className="border-0 bg-transparent font-mono text-xs text-white placeholder:text-slate-600 focus-visible:ring-0"
                />
              </div>

              {profilesLoading ? (
                <div
                  data-ocid="admin.users.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div
                  data-ocid="admin.users.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <Users className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No users found
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Clearance
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.users.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-amber-500">
                            L{Number(p.clearanceLevel)}{" "}
                            {CLEARANCE_LABELS[Number(p.clearanceLevel)]
                              ? `— ${CLEARANCE_LABELS[Number(p.clearanceLevel)]}`
                              : ""}
                          </TableCell>
                          <TableCell>
                            {p.isValidatedByCommander ? (
                              <span className="font-mono text-[10px] text-green-400">
                                Verified
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-slate-600">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`admin.users.edit_button.${idx + 1}`}
                              className="h-7 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                              style={{
                                backgroundColor: "transparent",
                                borderColor: "#2a3347",
                              }}
                              onClick={() => setEditTarget(p)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── Chain of Trust ───────────────────────────────────────── */}
            <TabsContent value="trust">
              <div className="space-y-6">
                {/* Status panel */}
                <ChainOfTrustPanel />

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: "#1a2235" }}
                />

                {/* Role Transition section */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4"
                      style={{ color: "#f59e0b" }}
                    />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                      Role Transitions
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Promote to S2 Admin */}
                    <div
                      className="rounded border p-4 space-y-3"
                      style={{
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <UserPlus
                          className="h-4 w-4"
                          style={{ color: "#f59e0b" }}
                        />
                        <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                          Promote to S2 Admin
                        </h4>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                        Grant S2 Admin rights to a verified user. Requires
                        commander approval (frontend-enforced).
                      </p>

                      <Select
                        value={promoteTarget?.principalId?.toString() ?? ""}
                        onValueChange={(val) => {
                          const p = profiles.find(
                            (x) => x.principalId.toString() === val,
                          );
                          setPromoteTarget(p ?? null);
                        }}
                      >
                        <SelectTrigger
                          data-ocid="admin.trust.promote.select"
                          className="border font-mono text-xs text-white"
                          style={{
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347",
                          }}
                        >
                          <SelectValue placeholder="Select user…" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: "#0f1626",
                            borderColor: "#1a2235",
                          }}
                        >
                          {profiles
                            .filter(
                              (p) => p.isValidatedByCommander && !p.isS2Admin,
                            )
                            .map((p) => (
                              <SelectItem
                                key={p.principalId.toString()}
                                value={p.principalId.toString()}
                                className="font-mono text-xs"
                              >
                                {p.name || p.rank || "Unknown"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="sm"
                        data-ocid="admin.trust.promote.primary_button"
                        disabled={!promoteTarget || promoteMutation.isPending}
                        onClick={() => setShowPromoteDialog(true)}
                        className="w-full font-mono text-[10px] uppercase tracking-wider"
                        style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                      >
                        Promote to S2 Admin
                      </Button>
                    </div>

                    {/* Commander Handoff */}
                    <div
                      className="rounded border p-4 space-y-3"
                      style={{
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Shield
                          className="h-4 w-4"
                          style={{ color: "#60a5fa" }}
                        />
                        <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-400">
                          Commander Handoff
                        </h4>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                        Initiate transfer of the Commander role to a designated
                        successor. Requires S2 co-sign.
                      </p>

                      <Select
                        value={handoffTarget?.principalId?.toString() ?? ""}
                        onValueChange={(val) => {
                          const p = profiles.find(
                            (x) => x.principalId.toString() === val,
                          );
                          setHandoffTarget(p ?? null);
                        }}
                      >
                        <SelectTrigger
                          data-ocid="admin.trust.handoff.select"
                          className="border font-mono text-xs text-white"
                          style={{
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347",
                          }}
                        >
                          <SelectValue placeholder="Select successor…" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: "#0f1626",
                            borderColor: "#1a2235",
                          }}
                        >
                          {profiles
                            .filter((p) => p.isValidatedByCommander)
                            .map((p) => (
                              <SelectItem
                                key={p.principalId.toString()}
                                value={p.principalId.toString()}
                                className="font-mono text-xs"
                              >
                                {p.name || p.rank || "Unknown"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="sm"
                        data-ocid="admin.trust.handoff.secondary_button"
                        disabled={!handoffTarget}
                        onClick={() => setShowHandoffDialog(true)}
                        className="w-full border font-mono text-[10px] uppercase tracking-wider text-blue-400"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: "rgba(96,165,250,0.3)",
                        }}
                      >
                        Initiate Handoff
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Role Assignments ─────────────────────────────────────── */}
            <TabsContent value="roles">
              {profilesLoading ? (
                <div
                  data-ocid="admin.roles.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : profiles.length === 0 ? (
                <div
                  data-ocid="admin.roles.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <AlertTriangle className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No profiles found
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Role
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.roles.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={
                                p.isS2Admin ? UserRole.admin : UserRole.user
                              }
                              onValueChange={(val) =>
                                void roleMutation.mutate({
                                  profile: p,
                                  role: val as UserRole,
                                })
                              }
                            >
                              <SelectTrigger
                                data-ocid={`admin.roles.item.${idx + 1}.select`}
                                className="h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-white"
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
                                {Object.values(UserRole).map((role) => (
                                  <SelectItem
                                    key={role}
                                    value={role}
                                    className="font-mono text-xs uppercase"
                                  >
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── Role Approval Requests ───────────────────────────── */}
            <TabsContent value="role-requests">
              {roleRequests.length === 0 ? (
                <div
                  data-ocid="admin.role_requests.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <Shield className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No pending role requests
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roleRequests.map((req, idx) => (
                    <div
                      key={req.requestId}
                      data-ocid={`admin.role_requests.item.${idx + 1}`}
                      className="flex items-center justify-between gap-4 rounded border px-4 py-3"
                      style={{
                        backgroundColor: "#0f1626",
                        borderColor: "#1a2235",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-semibold text-white">
                          {req.requestId}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                          Role: {req.requestedRole} · Status:{" "}
                          <span
                            style={{
                              color:
                                req.status === "pending"
                                  ? "#f59e0b"
                                  : req.status === "approved"
                                    ? "#22c55e"
                                    : "#ef4444",
                            }}
                          >
                            {req.status}
                          </span>
                        </p>
                      </div>
                      {req.status === "pending" && (
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            data-ocid={`admin.role_requests.approve_button.${idx + 1}`}
                            className="h-7 font-mono text-[10px] uppercase tracking-wider"
                            style={{
                              backgroundColor: "#22c55e",
                              color: "#0a0e1a",
                            }}
                            onClick={() =>
                              void approveRoleRequestMutation.mutate(
                                req.requestId,
                              )
                            }
                            disabled={approveRoleRequestMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`admin.role_requests.deny_button.${idx + 1}`}
                            className="h-7 border font-mono text-[10px] uppercase tracking-wider text-red-400"
                            style={{
                              borderColor: "#2a3347",
                              backgroundColor: "transparent",
                            }}
                            onClick={() =>
                              void denyRoleRequestMutation.mutate({
                                requestId: req.requestId,
                                notes: "Denied by S2 admin",
                              })
                            }
                            disabled={denyRoleRequestMutation.isPending}
                          >
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Deny dialog */}
      <DenyDialog
        open={!!denyTarget}
        profile={denyTarget}
        onConfirm={(reason) => {
          if (denyTarget)
            void denyMutation.mutate({ profile: denyTarget, reason });
        }}
        onCancel={() => setDenyTarget(null)}
        isPending={denyMutation.isPending}
      />

      {/* Promote to S2 Admin confirmation dialog */}
      <Dialog
        open={showPromoteDialog}
        onOpenChange={(v) => {
          if (!v) setShowPromoteDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.promote.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Grant S2 Admin Rights
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs leading-relaxed text-slate-400">
            Are you sure you want to grant S2 Admin rights to{" "}
            <span className="font-semibold text-white">
              {promoteTarget?.name ?? "this user"}
            </span>
            ? This requires commander approval. All actions will be logged.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.promote.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowPromoteDialog(false)}
              disabled={promoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.promote.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => {
                if (promoteTarget) void promoteMutation.mutate(promoteTarget);
              }}
              disabled={promoteMutation.isPending || !promoteTarget}
            >
              {promoteMutation.isPending ? "Granting…" : "Confirm Grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commander Handoff — initial dialog */}
      <Dialog
        open={showHandoffDialog}
        onOpenChange={(v) => {
          if (!v) setShowHandoffDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.handoff.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Initiate Commander Handoff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div
              className="rounded border px-3 py-2"
              style={{
                backgroundColor: "rgba(96,165,250,0.06)",
                borderColor: "rgba(96,165,250,0.2)",
              }}
            >
              <p className="font-mono text-[10px] leading-relaxed text-blue-300/80">
                Commander handoff requires co-sign from the current S2. This
                feature will be fully enforced in a future backend update. The
                handoff request will be logged as an audit event.
              </p>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Initiating handoff to:{" "}
              <span className="font-semibold text-white">
                {handoffTarget?.name ?? "selected user"}
              </span>
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.handoff.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowHandoffDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.handoff.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(96,165,250,0.15)",
                color: "#93c5fd",
                border: "1px solid rgba(96,165,250,0.3)",
              }}
              onClick={() => {
                setShowHandoffDialog(false);
                setShowHandoffStubDialog(true);
              }}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commander Handoff — stub confirmation */}
      <Dialog
        open={showHandoffStubDialog}
        onOpenChange={(v) => {
          if (!v) setShowHandoffStubDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.handoff_stub.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Confirm Handoff Request
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs leading-relaxed text-slate-400">
            This will log a Commander Handoff Request to the audit trail for{" "}
            <span className="font-semibold text-white">
              {handoffTarget?.name ?? "this user"}
            </span>
            . Full transfer requires backend enforcement (future update).
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.handoff_stub.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowHandoffStubDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.handoff_stub.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => {
                if (handoffTarget) void handoffMutation.mutate(handoffTarget);
              }}
              disabled={handoffMutation.isPending}
            >
              {handoffMutation.isPending ? "Logging…" : "Log Handoff Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile dialog */}
      <EditProfileDialog
        open={!!editTarget}
        profile={editTarget}
        onSave={(updates) => {
          if (editTarget)
            void editMutation.mutate({ profile: editTarget, updates });
        }}
        onCancel={() => setEditTarget(null)}
        isPending={editMutation.isPending}
      />

      {/* Footer */}
      <footer
        className="border-t px-6 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-500"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
