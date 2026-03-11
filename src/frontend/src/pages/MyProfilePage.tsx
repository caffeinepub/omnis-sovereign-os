/**
 * MyProfilePage — Full profile view for the logged-in user.
 * Sensitive fields (rank, clearance, org role) are read-only for non-S2 users.
 * S2 admins retain full edit rights.
 */
import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { RankSelector } from "@/components/shared/RankSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useStorageClient } from "@/hooks/useStorageClient";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { getInitials } from "@/lib/formatters";
import { CheckCircle2, Lock, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MyProfilePage() {
  const {
    profile,
    isS2Admin,
    isValidatedByCommander,
    refreshProfile,
    isLoading,
  } = usePermissions();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [email, setEmail] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [clearanceLevel, setClearanceLevel] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rank = profile.rank ?? "";
      setRankVal(rank);
      const inferred = inferBranchCategory(rank);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setEmail(profile.email ?? "");
      setOrgRole(profile.orgRole ?? "");
      setClearanceLevel(Number(profile.clearanceLevel ?? 0));
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [profile]);

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
      toast.success("Photo uploaded");
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

      const updates: ExtendedProfile = {
        ...profile,
        name: formattedName,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: isS2Admin ? orgRole.trim() : profile.orgRole,
        clearanceLevel: isS2Admin
          ? BigInt(clearanceLevel)
          : profile.clearanceLevel,
        avatarUrl: avatarUrl || undefined,
      };
      await actor.updateMyProfile(updates);
      await refreshProfile();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = profile?.name ? getInitials(profile.name) : "OP";
  const formattedName = profile?.name?.trim() || "OPERATOR";

  const clearanceLabelMap: Record<number, string> = CLEARANCE_LABELS ?? {};

  if (isLoading) {
    return (
      <div
        data-ocid="my_profile.loading_state"
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        data-ocid="my_profile.error_state"
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-red-400">
            Profile not found. Please complete registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="my_profile.page"
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
                My Profile
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {/* Profile header */}
          <div
            className="mb-8 flex flex-col items-center gap-4 rounded border p-8 sm:flex-row sm:items-start sm:gap-6"
            style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
          >
            <div className="relative shrink-0">
              <Avatar
                className="h-24 w-24 border-2"
                style={{ borderColor: "rgba(245,158,11,0.3)" }}
              >
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={formattedName} />
                ) : null}
                <AvatarFallback
                  className="font-mono text-2xl font-bold"
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
              <button
                type="button"
                data-ocid="my_profile.avatar.upload_button"
                className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2"
                style={{
                  backgroundColor: "#1a2235",
                  borderColor: "#2a3347",
                  color: "#f59e0b",
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || !storageReady}
                title={isUploadingAvatar ? "Uploading..." : "Upload photo"}
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.15em] text-white">
                {formattedName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {profile.rank && (
                  <Badge
                    className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      borderColor: "rgba(245,158,11,0.3)",
                      color: "#f59e0b",
                    }}
                  >
                    {profile.rank}
                  </Badge>
                )}
                {isValidatedByCommander && (
                  <Badge
                    className="flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.08)",
                      borderColor: "rgba(34,197,94,0.25)",
                      color: "#4ade80",
                    }}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    S2 Verified
                  </Badge>
                )}
                {isS2Admin && (
                  <Badge
                    className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      borderColor: "rgba(245,158,11,0.3)",
                      color: "#f59e0b",
                    }}
                  >
                    S2 Admin
                  </Badge>
                )}
              </div>
              {profile.orgRole && (
                <p className="font-mono text-xs text-slate-500">
                  {profile.orgRole}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Sensitive Fields ───────────────────────────────────────── */}
            <section
              className="rounded border p-5"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-slate-600" />
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Sensitive Fields
                </h2>
                {!isS2Admin && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
                    — managed by S2
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Clearance Level */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Clearance Level
                    </Label>
                    {!isS2Admin && (
                      <Lock className="h-2.5 w-2.5 text-slate-700" />
                    )}
                  </div>
                  <div
                    className="rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    <p className="font-mono text-xs text-amber-500">
                      Level {Number(profile.clearanceLevel)}{" "}
                      <span className="text-slate-600">
                        —{" "}
                        {clearanceLabelMap[Number(profile.clearanceLevel)] ??
                          "Unknown"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Org Role */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Organizational Role
                    </Label>
                    {!isS2Admin && (
                      <Lock className="h-2.5 w-2.5 text-slate-700" />
                    )}
                  </div>
                  {isS2Admin ? (
                    <Input
                      value={orgRole}
                      onChange={(e) => setOrgRole(e.target.value)}
                      className="border font-mono text-xs text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded border px-3 py-2"
                      style={{
                        borderColor: "#1a2235",
                        backgroundColor: "#0a0e1a",
                      }}
                    >
                      <p className="font-mono text-xs text-slate-400">
                        {profile.orgRole || "—"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Verification status */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Verification Status
                  </Label>
                  <div
                    className="flex items-center gap-2 rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    {isValidatedByCommander ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                        <p className="font-mono text-xs text-green-400">
                          Verified by S2
                        </p>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-slate-600" />
                        <p className="font-mono text-xs text-slate-600">
                          Pending S2 verification
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isS2Admin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid="my_profile.request_correction.button"
                  className="mt-4 w-full border font-mono text-[10px] uppercase tracking-wider text-slate-500"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#1a2235",
                  }}
                  onClick={() => setCorrectionDialogOpen(true)}
                >
                  Request Correction
                </Button>
              )}
            </section>

            {/* ── My Information ────────────────────────────────────────── */}
            <section
              className="rounded border p-5"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <div className="mb-4">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  My Information
                </h2>
              </div>

              <div className="space-y-4">
                {/* Name fields */}
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Name
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        Last
                      </Label>
                      <Input
                        data-ocid="my_profile.name.last.input"
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
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        First
                      </Label>
                      <Input
                        data-ocid="my_profile.name.first.input"
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
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        MI
                      </Label>
                      <Input
                        data-ocid="my_profile.name.mi.input"
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
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                  />
                </div>

                {/* Preview */}
                {(lastName || firstName) && (
                  <div
                    className="rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      Preview
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-amber-400">
                      {formatDisplayName(
                        rankVal || profile.rank,
                        lastName,
                        firstName,
                        mi,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Save / Cancel actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              data-ocid="my_profile.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => {
                // Re-populate from profile
                if (profile) {
                  const parsed = parseDisplayName(profile.name ?? "");
                  setLastName(parsed.lastName);
                  setFirstName(parsed.firstName);
                  setMi(parsed.mi);
                  const rank = profile.rank ?? "";
                  setRankVal(rank);
                  const inferred = inferBranchCategory(rank);
                  setBranch(inferred.branch);
                  setCategory(inferred.category);
                  setEmail(profile.email ?? "");
                  setOrgRole(profile.orgRole ?? "");
                  setAvatarUrl(profile.avatarUrl ?? "");
                }
              }}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              type="button"
              data-ocid="my_profile.save_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </main>
      </ScrollArea>

      {/* Request Correction dialog */}
      <Dialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
      >
        <DialogContent
          data-ocid="my_profile.correction.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Request Correction
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-slate-500">
              Sensitive fields are managed by your S2 administrator.
            </DialogDescription>
          </DialogHeader>
          <div
            className="rounded border px-4 py-3"
            style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
          >
            <p className="font-mono text-xs leading-relaxed text-slate-400">
              To correct your rank, name, clearance level, or organizational
              role, contact your S2 administrator directly. They can update and
              re-verify your profile through the Admin Panel.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              data-ocid="my_profile.correction.close_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => setCorrectionDialogOpen(false)}
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
