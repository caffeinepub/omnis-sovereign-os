/**
 * PersonnelPage — Directory + S2 Onboarding Queue + profile field locking
 *
 * MOTOKO BACKLOG (future session):
 * - verified, verifiedBy, verifiedAt fields on ExtendedProfile for true backend enforcement
 * - lockProfileFields / unlockProfileFields S2-only backend functions
 * - registrationStatus (pending/verified/active/suspended) on ExtendedProfile
 * - Backend-enforced rejection of field updates on verified profiles
 */

import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ClearanceBadge } from "@/components/shared/ClearanceBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { RankSelector } from "@/components/shared/RankSelector";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Pencil,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarCircle({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-[#2a3347]">
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider"
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Personnel Card ───────────────────────────────────────────────────────────

interface PersonnelCardProps {
  profile: ExtendedProfile;
  index: number;
  isS2Admin: boolean;
  onEdit: (profile: ExtendedProfile) => void;
}

function PersonnelCard({
  profile,
  index,
  isS2Admin,
  onEdit,
}: PersonnelCardProps) {
  return (
    <div
      data-ocid={`personnel.card.${index}`}
      className="group relative flex flex-col items-center gap-4 rounded border p-5 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.02]"
      style={{
        backgroundColor: "#1a2235",
        borderColor: "#243048",
      }}
    >
      {/* S2 Edit Button */}
      {isS2Admin && (
        <button
          type="button"
          data-ocid={`personnel.edit_button.${index}`}
          onClick={() => onEdit(profile)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-amber-500/10"
          title="Edit profile"
          aria-label="Edit personnel profile"
        >
          <Pencil className="h-3.5 w-3.5 text-amber-500" />
        </button>
      )}

      {/* Avatar */}
      <AvatarCircle name={profile.name} avatarUrl={profile.avatarUrl} />

      {/* Info */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
            {profile.name}
          </p>
          {profile.isValidatedByCommander && <VerifiedBadge />}
        </div>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {profile.rank || "—"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
          {profile.orgRole || "—"}
        </p>
      </div>

      {/* Verification status row */}
      <div className="w-full">
        {profile.isValidatedByCommander ? (
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500/80">
              S2 Verified
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3 text-slate-600" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
              Pending Verification
            </span>
          </div>
        )}
      </div>

      {/* Clearance Badge */}
      <div className="mt-auto">
        <ClearanceBadge level={Number(profile.clearanceLevel)} />
      </div>
    </div>
  );
}

// ─── Skeleton Grid ────────────────────────────────────────────────────────────

const SKELETON_IDS = ["a", "b", "c", "d", "e", "f", "g", "h"];

function PersonnelSkeleton() {
  return (
    <div
      data-ocid="personnel.loading_state"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {SKELETON_IDS.map((id) => (
        <div
          key={id}
          className="flex flex-col items-center gap-4 rounded border p-5"
          style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
        >
          <SkeletonCard width="64px" height="64px" className="rounded-full" />
          <div className="w-full space-y-2">
            <SkeletonCard height="14px" className="mx-auto w-3/4" />
            <SkeletonCard height="10px" className="mx-auto w-1/2" />
            <SkeletonCard height="10px" className="mx-auto w-2/3" />
          </div>
          <SkeletonCard height="22px" width="80px" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Locked field display ─────────────────────────────────────────────────────

function LockedField({
  label,
  value,
  dataOcid,
}: {
  label: string;
  value: string;
  dataOcid?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              data-ocid={dataOcid ?? "personnel.field_locked.tooltip"}
              className="flex items-center gap-2 rounded border px-3 py-2"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            >
              <Lock className="h-3 w-3 shrink-0 text-slate-600" />
              <span className="font-mono text-xs text-slate-300">
                {value || "—"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-xs font-mono text-[10px]"
            style={{ backgroundColor: "#0f1626", borderColor: "#2a3347" }}
          >
            Field locked after S2 verification. Submit a correction request to
            your S2.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  profile: ExtendedProfile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  viewerIsS2Admin: boolean;
  viewerPrincipal: string;
}

function EditModal({
  profile,
  open,
  onOpenChange,
  onSuccess,
  viewerIsS2Admin,
  viewerPrincipal,
}: EditModalProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  // Split name state
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [rank, setRank] = useState(profile?.rank ?? "");
  const [editBranch, setEditBranch] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [orgRole, setOrgRole] = useState(profile?.orgRole ?? "");
  const [clearanceLevel, setClearanceLevel] = useState(
    String(profile ? Number(profile.clearanceLevel) : 0),
  );
  const [makeS2Admin, setMakeS2Admin] = useState(profile?.isS2Admin ?? false);
  const [nameError, setNameError] = useState("");
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);

  // Sync state when profile prop changes
  const prevProfileId = profile?.principalId.toString();
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(
    prevProfileId,
  );

  if (prevProfileId !== lastSyncedId && profile) {
    setLastSyncedId(prevProfileId);
    const parsed = parseDisplayName(profile.name);
    setLastName(parsed.lastName);
    setFirstName(parsed.firstName);
    setMi(parsed.mi);
    setRank(profile.rank);
    setEditBranch("");
    setEditCategory("");
    setEmail(profile.email);
    setOrgRole(profile.orgRole);
    setClearanceLevel(String(Number(profile.clearanceLevel)));
    setMakeS2Admin(profile.isS2Admin);
    setNameError("");
  }

  // Field locking: locked if profile is verified AND the viewer is NOT S2 AND viewing their own profile
  const isViewingOwnProfile =
    profile?.principalId.toString() === viewerPrincipal;
  const nameRankLocked =
    profile?.isValidatedByCommander === true &&
    !viewerIsS2Admin &&
    isViewingOwnProfile;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || !profile) throw new Error("Not ready");

      const formattedName = formatDisplayName(rank, lastName, firstName, mi);
      const trimmedName = formattedName.trim();
      if (!trimmedName || !lastName.trim() || !firstName.trim()) {
        setNameError("Last name and first name are required.");
        throw new Error("Validation failed");
      }
      setNameError("");

      const updatedProfile: ExtendedProfile = {
        ...profile,
        name: trimmedName,
        rank: rank.trim(),
        email: email.trim(),
        orgRole: orgRole.trim(),
        clearanceLevel: BigInt(clearanceLevel),
        isS2Admin: makeS2Admin,
      };
      await actor.updateUserProfile(updatedProfile);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({
        queryKey: [viewerPrincipal, "personnel-profiles"],
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (err: Error) => {
      if (err.message !== "Validation failed") {
        toast.error("Failed to update profile");
      }
    },
  });

  const lockedDisplayName = profile
    ? formatDisplayName(rank, lastName, firstName, mi) || profile.name
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          data-ocid="personnel.edit_modal.modal"
          className="border sm:max-w-lg"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Edit Personnel Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name — locked if verified and non-S2 viewing own profile */}
            {nameRankLocked ? (
              <LockedField label="Name *" value={lockedDisplayName} />
            ) : (
              <div className="space-y-2">
                <Label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Name <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-[1fr_1fr_56px] gap-2">
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      Last
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.last_name.input"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                      }}
                      className="border font-mono text-xs uppercase text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                      placeholder="SMITH"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      First
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.first_name.input"
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
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      MI
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.mi.input"
                      value={mi}
                      onChange={(e) => setMi(e.target.value.slice(0, 1))}
                      maxLength={1}
                      className="border font-mono text-xs text-center uppercase text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                      placeholder="A"
                    />
                  </div>
                </div>
                <FormError message={nameError} />
              </div>
            )}

            {/* Rank — locked if verified and non-S2 viewing own profile */}
            {nameRankLocked ? (
              <LockedField label="Rank" value={rank} />
            ) : (
              <RankSelector
                branch={editBranch}
                category={editCategory}
                rank={rank}
                onBranchChange={(v) => {
                  setEditBranch(v);
                  setEditCategory("");
                  setRank("");
                }}
                onCategoryChange={(v) => {
                  setEditCategory(v);
                  setRank("");
                }}
                onRankChange={setRank}
                variant="modal"
              />
            )}

            {/* Request correction link — visible only to non-S2 viewing their own verified profile */}
            {nameRankLocked && (
              <button
                type="button"
                data-ocid="personnel.request_correction.button"
                onClick={() => setShowCorrectionDialog(true)}
                className="font-mono text-[10px] uppercase tracking-wider text-amber-500/70 underline-offset-4 hover:text-amber-500 hover:underline"
              >
                Request Correction for Locked Fields
              </button>
            )}

            {/* Email */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Email
              </Label>
              <Input
                data-ocid="personnel.edit_modal.email.input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                placeholder="email@unit.mil"
                type="email"
              />
            </div>

            {/* OrgRole */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Org Role
              </Label>
              <Input
                data-ocid="personnel.edit_modal.org_role.input"
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                placeholder="e.g. S2, S6, Commander"
              />
            </div>

            {/* Clearance Level */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Clearance Level
              </Label>
              <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
                <SelectTrigger
                  data-ocid="personnel.edit_modal.clearance.select"
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                    <SelectItem
                      key={lvl}
                      value={lvl}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {lvl} — {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Make S2 Admin */}
            <div
              className="flex items-center justify-between rounded border px-3 py-2.5"
              style={{ borderColor: "#2a3347" }}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                  S2 Admin
                </p>
                <p className="font-mono text-[9px] text-slate-600">
                  Grants full system access
                </p>
              </div>
              <Switch
                data-ocid="personnel.edit_modal.s2_admin.switch"
                checked={makeS2Admin}
                onCheckedChange={setMakeS2Admin}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="personnel.edit_modal.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347" }}
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="personnel.edit_modal.save_button"
              className="gap-1.5 font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correction request info dialog */}
      <AlertDialog
        open={showCorrectionDialog}
        onOpenChange={setShowCorrectionDialog}
      >
        <AlertDialogContent
          data-ocid="personnel.correction_info.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Locked Field Correction
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              To correct a locked field, contact your S2 or security officer
              directly. They will unlock and re-verify your profile. Name and
              rank fields are locked after S2 verification to prevent
              misrepresentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowCorrectionDialog(false)}
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Re-auth confirm dialog (S2 editing verified profile) ─────────────────────

interface ReAuthConfirmProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  profileName: string;
}

function ReAuthConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  profileName,
}: ReAuthConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-ocid="personnel.edit_verified.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Edit Verified Profile
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
            You are about to edit the verified profile of{" "}
            <span className="font-semibold text-amber-500">{profileName}</span>.
            This action is logged and requires S2 authority. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            data-ocid="personnel.edit_verified.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="personnel.edit_verified.confirm_button"
            onClick={onConfirm}
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Onboarding Queue (S2 only) ───────────────────────────────────────────────

interface OnboardingQueueProps {
  profiles: ExtendedProfile[];
  isLoading: boolean;
  principalStr: string;
  onVerified: () => void;
}

function OnboardingQueue({
  profiles,
  isLoading,
  principalStr,
  onVerified,
}: OnboardingQueueProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [confirmTarget, setConfirmTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Deny state
  const [denyTarget, setDenyTarget] = useState<ExtendedProfile | null>(null);
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  const pendingProfiles = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin,
  );

  const verifyMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.validateS2Admin(profile.principalId);
      // Send approval notification (non-blocking)
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Approved",
          body: "Your access request has been approved. You may now log in to Omnis.",
          userId: profile.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: undefined,
        });
      } catch {
        /* non-blocking */
      }
    },
    onSuccess: () => {
      toast.success("User verified and activated");
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "personnel-profiles"],
      });
      setConfirmOpen(false);
      setConfirmTarget(null);
      onVerified();
    },
    onError: () => {
      toast.error("Failed to verify user");
    },
  });

  const handleVerifyClick = (profile: ExtendedProfile) => {
    setConfirmTarget(profile);
    setConfirmOpen(true);
  };

  const handleDenyClick = (profile: ExtendedProfile) => {
    setDenyTarget(profile);
    setDenyReason("");
    setDenyOpen(true);
  };

  const handleDenyConfirm = async () => {
    if (!denyTarget || !denyReason.trim()) return;
    // Write denial record to localStorage
    localStorage.setItem(
      `omnis_denial_${denyTarget.principalId.toString()}`,
      JSON.stringify({
        reason: denyReason.trim(),
        deniedAt: new Date().toISOString(),
      }),
    );
    // Send denial notification (non-blocking)
    if (actor) {
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Denied",
          body: `Your access request was denied. Reason: ${denyReason.trim()}. Contact your S2 or security officer.`,
          userId: denyTarget.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: undefined,
        });
      } catch {
        /* non-blocking */
      }
    }
    void queryClient.invalidateQueries({
      queryKey: [principalStr, "personnel-profiles"],
    });
    toast.success("User denied");
    setDenyOpen(false);
    setDenyTarget(null);
    setDenyReason("");
  };

  if (isLoading) {
    return (
      <div data-ocid="personnel.queue.loading_state" className="py-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
          <span className="font-mono text-xs text-slate-600">
            Loading queue…
          </span>
        </div>
      </div>
    );
  }

  if (pendingProfiles.length === 0) {
    return (
      <div
        data-ocid="personnel.queue.empty_state"
        className="py-12 text-center"
      >
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-700" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
          No users pending verification.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        data-ocid="personnel.queue.table"
        className="overflow-hidden rounded border"
        style={{ borderColor: "#1a2235" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-4 border-b px-4 py-2.5"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          {["Name", "Rank", "Email", "Org Role", "Org", "Action"].map((col) => (
            <span
              key={col}
              className="font-mono text-[9px] uppercase tracking-widest text-slate-600"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {pendingProfiles.map((profile, idx) => {
          // Read org request from localStorage
          let orgName = "—";
          try {
            const raw = localStorage.getItem(
              `omnis_org_request_${profile.principalId.toString()}`,
            );
            if (raw) {
              const parsed = JSON.parse(raw) as { workspace?: string };
              if (parsed.workspace) orgName = parsed.workspace;
            }
          } catch {
            /* ignore */
          }

          return (
            <div
              key={profile.principalId.toString()}
              data-ocid={`personnel.queue.item.${idx + 1}`}
              className="grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] items-center gap-4 border-b px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.02]"
              style={{ borderColor: "#1a2235" }}
            >
              <span className="truncate font-mono text-xs text-white">
                {profile.name || "—"}
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-slate-400">
                {profile.rank || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {profile.email || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {profile.orgRole || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {orgName}
              </span>
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid={`personnel.queue.verify_button.${idx + 1}`}
                  onClick={() => handleVerifyClick(profile)}
                  disabled={verifyMutation.isPending}
                  className="shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-amber-500/10 disabled:opacity-40"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  Verify & Activate
                </button>
                <button
                  type="button"
                  data-ocid={`personnel.queue.deny_button.${idx + 1}`}
                  onClick={() => handleDenyClick(profile)}
                  disabled={verifyMutation.isPending}
                  className="shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-red-500/10 disabled:opacity-40"
                  style={{
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  Deny
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Verify Personnel
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              Verify{" "}
              <span className="font-semibold text-amber-500">
                {confirmTarget?.name}
              </span>{" "}
              and grant system access? This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
              onClick={() => {
                setConfirmOpen(false);
                setConfirmTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmTarget && verifyMutation.mutate(confirmTarget)
              }
              disabled={verifyMutation.isPending}
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              {verifyMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deny confirm dialog */}
      <AlertDialog open={denyOpen} onOpenChange={setDenyOpen}>
        <AlertDialogContent
          data-ocid="personnel.deny_dialog.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Deny Access
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              Deny access for{" "}
              <span className="font-semibold text-red-400">
                {denyTarget?.name}
              </span>
              ? This will notify the user and record the reason.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-1 py-2">
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Reason for Denial <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="personnel.deny_dialog.reason.input"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Enter reason..."
              className="border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="personnel.deny_dialog.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
              onClick={() => {
                setDenyOpen(false);
                setDenyTarget(null);
                setDenyReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="personnel.deny_dialog.confirm_button"
              onClick={() => void handleDenyConfirm()}
              disabled={!denyReason.trim()}
              className="font-mono text-xs uppercase tracking-wider disabled:opacity-40"
              style={{ backgroundColor: "rgba(239,68,68,0.85)", color: "#fff" }}
            >
              Confirm Deny
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Demo Profile (preview only — not stored in backend) ─────────────────────

const DEMO_PROFILE: ExtendedProfile = {
  principalId: {
    toString: () => "demo-gracie-preview",
    compareTo: () => 0 as 0 | 1 | -1,
    isAnonymous: () => false,
    toUint8Array: () => new Uint8Array(),
    toHex: () => "",
    toText: () => "demo-gracie-preview",
  } as unknown as ExtendedProfile["principalId"],
  name: "1SG GRACIE, Nicholas J",
  rank: "First Sergeant (1SG)",
  email: "nicholas.j.gracie.mil@army.mil",
  orgRole: "First Sergeant, HHC 1-501ST PIR",
  clearanceLevel: 4n,
  isS2Admin: false,
  isValidatedByCommander: true,
  registered: true,
  avatarUrl: undefined,
};

// ─── Demo Card wrapper (amber outline to distinguish from live data) ──────────

function DemoPersonnelCard({
  isS2Admin,
  onViewProfile,
}: {
  isS2Admin: boolean;
  onViewProfile: () => void;
}) {
  return (
    <div className="relative">
      {/* Demo label */}
      <div className="absolute -top-2.5 left-3 z-10">
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
          style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
        >
          Preview
        </span>
      </div>

      <div
        data-ocid="personnel.demo_card"
        className="group relative flex flex-col items-center gap-4 rounded border-2 p-5 transition-all duration-200"
        style={{
          backgroundColor: "#1a2235",
          borderColor: "#f59e0b",
        }}
      >
        {/* S2 Edit hint */}
        {isS2Admin && (
          <button
            type="button"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-60 hover:bg-amber-500/10 hover:opacity-100"
            title="Demo only — edit not connected to backend"
            aria-label="Demo edit"
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500/60" />
          </button>
        )}

        {/* Avatar */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.3)",
            color: "#f59e0b",
          }}
        >
          NJG
        </div>

        {/* Info */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
              {DEMO_PROFILE.name}
            </p>
            <VerifiedBadge />
          </div>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            {DEMO_PROFILE.rank}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
            {DEMO_PROFILE.orgRole}
          </p>
        </div>

        {/* Verification status */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500/80">
              S2 Verified
            </span>
          </div>
        </div>

        {/* Clearance Badge */}
        <div className="mt-auto">
          <ClearanceBadge level={Number(DEMO_PROFILE.clearanceLevel)} />
        </div>

        {/* View full profile link */}
        <button
          type="button"
          data-ocid="personnel.demo_view_profile.button"
          onClick={onViewProfile}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-500/70 transition-colors hover:text-amber-500"
        >
          <ExternalLink className="h-3 w-3" />
          View Full Profile
        </button>
      </div>
    </div>
  );
}

// ─── Main PersonnelPage ───────────────────────────────────────────────────────

export default function PersonnelPage() {
  const { actor, isFetching } = useActor();
  const { isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [clearanceFilter, setClearanceFilter] = useState("all");

  // Edit state
  const [editTarget, setEditTarget] = useState<ExtendedProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Re-auth confirm before editing verified profile (S2 only)
  const [reAuthTarget, setReAuthTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [reAuthOpen, setReAuthOpen] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: profiles = [], isLoading } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "personnel-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  // Use deferred search value so the filter only applies after React yields,
  // keeping the input responsive even on large lists (no per-keystroke filter).
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        !deferredSearchQuery ||
        p.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());

      const matchesClearance =
        clearanceFilter === "all" ||
        Number(p.clearanceLevel) === Number(clearanceFilter);

      return matchesSearch && matchesClearance;
    });
  }, [profiles, deferredSearchQuery, clearanceFilter]);

  // ── Edit handlers ─────────────────────────────────────────────────────────
  function handleEdit(profile: ExtendedProfile) {
    // S2 editing a verified profile: show re-auth confirmation first
    if (isS2Admin && profile.isValidatedByCommander) {
      setReAuthTarget(profile);
      setReAuthOpen(true);
    } else {
      setEditTarget(profile);
      setEditOpen(true);
    }
  }

  function handleReAuthConfirm() {
    setReAuthOpen(false);
    if (reAuthTarget) {
      setEditTarget(reAuthTarget);
      setEditOpen(true);
    }
    setReAuthTarget(null);
  }

  const pendingCount = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin,
  ).length;

  return (
    <div
      data-ocid="personnel.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Personnel Directory</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Personnel Directory
                </h1>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  {isLoading
                    ? "Loading..."
                    : `${filteredProfiles.length} of ${profiles.length} personnel`}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Input
                data-ocid="personnel.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-52 border font-mono text-xs text-white placeholder:text-slate-600"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
              <Select
                value={clearanceFilter}
                onValueChange={setClearanceFilter}
              >
                <SelectTrigger
                  data-ocid="personnel.clearance_filter.select"
                  className="w-44 border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="All Clearances" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <SelectItem
                    value="all"
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    All Clearances
                  </SelectItem>
                  {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                    <SelectItem
                      key={lvl}
                      value={lvl}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs — S2 sees both; others see only the directory */}
          {isS2Admin ? (
            <Tabs defaultValue="directory">
              <TabsList
                className="mb-6 border"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <TabsTrigger
                  value="directory"
                  data-ocid="personnel.directory.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
                >
                  All Personnel
                </TabsTrigger>
                <TabsTrigger
                  value="queue"
                  data-ocid="personnel.queue.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
                >
                  Onboarding Queue
                  {pendingCount > 0 && (
                    <span
                      className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.2)",
                        color: "#f59e0b",
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="directory">
                {isLoading ? (
                  <PersonnelSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Demo preview card — always shown at top */}
                    <DemoPersonnelCard
                      isS2Admin={isS2Admin}
                      onViewProfile={() =>
                        void navigate({ to: "/profile-preview" })
                      }
                    />
                    {filteredProfiles.length === 0 ? (
                      <div
                        data-ocid="personnel.empty_state"
                        className="col-span-full flex flex-col items-center py-12"
                      >
                        <Users className="mb-3 h-8 w-8 text-slate-700" />
                        <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
                          {searchQuery || clearanceFilter !== "all"
                            ? "No personnel match your filters"
                            : "No personnel registered"}
                        </p>
                      </div>
                    ) : (
                      filteredProfiles.map((profile, idx) => (
                        <PersonnelCard
                          key={profile.principalId.toString()}
                          profile={profile}
                          index={idx + 1}
                          isS2Admin={isS2Admin}
                          onEdit={handleEdit}
                        />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="queue">
                <OnboardingQueue
                  profiles={profiles}
                  isLoading={isLoading}
                  principalStr={principalStr}
                  onVerified={() => {}}
                />
              </TabsContent>
            </Tabs>
          ) : (
            // Non-S2: just show the directory, no tabs
            <>
              {isLoading ? (
                <PersonnelSkeleton />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {/* Demo preview card — always shown at top */}
                  <DemoPersonnelCard
                    isS2Admin={isS2Admin}
                    onViewProfile={() =>
                      void navigate({ to: "/profile-preview" })
                    }
                  />
                  {filteredProfiles.length === 0 ? (
                    <div
                      data-ocid="personnel.empty_state"
                      className="col-span-full flex flex-col items-center py-12"
                    >
                      <Users className="mb-3 h-8 w-8 text-slate-700" />
                      <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
                        {searchQuery || clearanceFilter !== "all"
                          ? "No personnel match your filters"
                          : "No personnel registered"}
                      </p>
                    </div>
                  ) : (
                    filteredProfiles.map((profile, idx) => (
                      <PersonnelCard
                        key={profile.principalId.toString()}
                        profile={profile}
                        index={idx + 1}
                        isS2Admin={isS2Admin}
                        onEdit={handleEdit}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <EditModal
        profile={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => setEditTarget(null)}
        viewerIsS2Admin={isS2Admin}
        viewerPrincipal={principalStr}
      />

      {/* Re-auth confirm dialog for S2 editing a verified profile */}
      <ReAuthConfirmDialog
        open={reAuthOpen}
        onOpenChange={setReAuthOpen}
        onConfirm={handleReAuthConfirm}
        profileName={reAuthTarget?.name ?? ""}
      />

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
