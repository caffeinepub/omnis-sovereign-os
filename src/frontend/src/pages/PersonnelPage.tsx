import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ClearanceBadge } from "@/components/shared/ClearanceBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
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
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
      className="group relative flex flex-col items-center gap-4 rounded border p-5 transition-all duration-200 hover:border-amber-500/50"
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
        <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
          {profile.name}
        </p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {profile.rank || "—"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
          {profile.orgRole || "—"}
        </p>
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  profile: ExtendedProfile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function EditModal({ profile, open, onOpenChange, onSuccess }: EditModalProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  const [name, setName] = useState(profile?.name ?? "");
  const [rank, setRank] = useState(profile?.rank ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [orgRole, setOrgRole] = useState(profile?.orgRole ?? "");
  const [clearanceLevel, setClearanceLevel] = useState(
    String(profile ? Number(profile.clearanceLevel) : 0),
  );
  const [makeS2Admin, setMakeS2Admin] = useState(profile?.isS2Admin ?? false);
  const [nameError, setNameError] = useState("");

  // Sync state when profile prop changes (i.e., when a different card is clicked)
  const prevProfileId = profile?.principalId.toString();
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(
    prevProfileId,
  );

  if (prevProfileId !== lastSyncedId && profile) {
    setLastSyncedId(prevProfileId);
    setName(profile.name);
    setRank(profile.rank);
    setEmail(profile.email);
    setOrgRole(profile.orgRole);
    setClearanceLevel(String(Number(profile.clearanceLevel)));
    setMakeS2Admin(profile.isS2Admin);
    setNameError("");
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || !profile) throw new Error("Not ready");
      const trimmedName = name.trim();
      if (!trimmedName) {
        setNameError("Name is required.");
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
        queryKey: [principalStr, "personnel-profiles"],
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

  return (
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
          {/* Name */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="personnel.edit_modal.name.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Full name"
            />
            <FormError message={nameError} />
          </div>

          {/* Rank */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Rank
            </Label>
            <Input
              data-ocid="personnel.edit_modal.rank.input"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="e.g. SGT, CPT, MAJ"
            />
          </div>

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
                style={{
                  backgroundColor: "#0f1626",
                  borderColor: "#1a2235",
                }}
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
  );
}

// ─── Main PersonnelPage ───────────────────────────────────────────────────────

export default function PersonnelPage() {
  const { actor, isFetching } = useActor();
  const { isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();

  const [searchQuery, setSearchQuery] = useState("");
  const [clearanceFilter, setClearanceFilter] = useState("all");
  const [editTarget, setEditTarget] = useState<ExtendedProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClearance =
        clearanceFilter === "all" ||
        Number(p.clearanceLevel) === Number(clearanceFilter);

      return matchesSearch && matchesClearance;
    });
  }, [profiles, searchQuery, clearanceFilter]);

  // ── Edit handlers ─────────────────────────────────────────────────────────
  function handleEdit(profile: ExtendedProfile) {
    setEditTarget(profile);
    setEditOpen(true);
  }

  return (
    <div
      data-ocid="personnel.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
              {/* Search */}
              <Input
                data-ocid="personnel.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-52 border font-mono text-xs text-white placeholder:text-slate-600"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />

              {/* Clearance filter */}
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
                  style={{
                    backgroundColor: "#0f1626",
                    borderColor: "#1a2235",
                  }}
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

          {/* Content */}
          {isLoading ? (
            <PersonnelSkeleton />
          ) : filteredProfiles.length === 0 ? (
            <div data-ocid="personnel.empty_state">
              <EmptyState
                icon={<Users />}
                message={
                  searchQuery || clearanceFilter !== "all"
                    ? "No personnel match your filters"
                    : "No personnel registered"
                }
                className="mt-12"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProfiles.map((profile, idx) => (
                <PersonnelCard
                  key={profile.principalId.toString()}
                  profile={profile}
                  index={idx + 1}
                  isS2Admin={isS2Admin}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <EditModal
        profile={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => setEditTarget(null)}
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
