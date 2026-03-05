import type {
  Document,
  ExtendedProfile,
  Folder,
  FolderPermission,
} from "@/backend.d";
import { DocumentPermission } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ClassificationBadge } from "@/components/shared/ClassificationBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  // ts can be in nanoseconds (ICP) or milliseconds — detect
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string },
): string {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match
    ? `${match.rank} ${match.name}`.trim()
    : truncatePrincipal(principal);
}

// ─── Sidebar skeleton ────────────────────────────────────────────────────────

function SidebarSkeleton() {
  return (
    <div data-ocid="documents.sidebar.loading_state" className="space-y-3 p-4">
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} height="h-8" className="w-full" />
      ))}
    </div>
  );
}

// ─── Document row skeleton ───────────────────────────────────────────────────

function DocumentListSkeleton() {
  return (
    <div data-ocid="documents.list.loading_state" className="space-y-2 p-4">
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} height="h-12" className="w-full" />
      ))}
    </div>
  );
}

// ─── Permissions skeleton ────────────────────────────────────────────────────

function PermissionsSkeleton() {
  return (
    <div
      data-ocid="documents.permissions.loading_state"
      className="space-y-2 p-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} height="h-12" className="w-full" />
      ))}
    </div>
  );
}

// ─── Upload Modal ────────────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folder: Folder;
  callerPrincipal: { toString(): string };
  onUploaded: () => void;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
}

function UploadModal({
  open,
  onOpenChange,
  folder,
  callerPrincipal,
  onUploaded,
  actor,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [description, setDescription] = useState("");
  const [classLevel, setClassLevel] = useState<string>(
    String(Number(folder.requiredClearanceLevel)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFile(null);
      setDocName("");
      setDescription("");
      setClassLevel(String(Number(folder.requiredClearanceLevel)));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, folder.requiredClearanceLevel]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !docName) setDocName(f.name);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!file) errs.file = "Please select a file.";
    if (!docName.trim()) errs.docName = "Document name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const doc: Document = {
        id: "",
        folderId: folder.id,
        name: docName.trim(),
        description: description.trim(),
        uploadedBy: callerPrincipal as unknown as Document["uploadedBy"],
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(file!.size),
        mimeType: file!.type || "application/octet-stream",
        blobStorageKey: undefined,
        classificationLevel: BigInt(Number.parseInt(classLevel, 10)),
        version: 1n,
      };
      await actor.createDocument(doc);
      toast.success("Document uploaded successfully");
      onOpenChange(false);
      onUploaded();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="documents.upload.modal"
        className="border-border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File picker */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              File <span className="text-red-400">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              data-ocid="documents.upload.upload_button"
              className="w-full justify-start gap-2 border-border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ backgroundColor: "#1a2235" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {file ? file.name : "Choose file…"}
            </Button>
            <FormError message={errors.file} />
          </div>

          {/* Document name */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Document Name <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="documents.upload.input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="border-border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235" }}
              placeholder="Enter document name"
            />
            <FormError message={errors.docName} />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Description
            </Label>
            <Textarea
              data-ocid="documents.upload.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235" }}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Classification level */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Classification Level
            </Label>
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger
                data-ocid="documents.upload.select"
                className="border-border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.entries(CLEARANCE_LABELS).map(([lvl, lbl]) => (
                  <SelectItem
                    key={lvl}
                    value={lvl}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {lbl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="documents.upload.cancel_button"
            className="border-border font-mono text-xs uppercase tracking-wider text-slate-300"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="documents.upload.submit_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Permissions Tab ─────────────────────────────────────────────────────────

interface PermissionsTabProps {
  folder: Folder;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  callerPrincipal: { toString(): string };
}

interface PermRow {
  profile: ExtendedProfile;
  permission: FolderPermission | null;
}

function PermissionsTab({
  folder,
  actor,
  callerPrincipal,
}: PermissionsTabProps) {
  const [rows, setRows] = useState<PermRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [savingFor, setSavingFor] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, perms] = await Promise.all([
        actor.getAllProfiles(),
        actor.getFolderPermissions(folder.id),
      ]);
      const built: PermRow[] = profiles.map((p) => ({
        profile: p,
        permission:
          perms.find(
            (pm) => pm.userId.toString() === p.principalId.toString(),
          ) ?? null,
      }));
      setRows(built);
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [actor, folder.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleRoleChange(row: PermRow, newRole: string) {
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm: FolderPermission = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: newRole as DocumentPermission,
        needToKnow: row.permission?.needToKnow ?? false,
        grantedBy: callerPrincipal as unknown as FolderPermission["grantedBy"],
        grantedAt: BigInt(Date.now()),
      };
      await actor.setFolderPermission(perm);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === key
            ? { ...r, permission: perm }
            : r,
        ),
      );
      toast.success("Permission updated");
    } catch {
      toast.error("Failed to update permission");
    } finally {
      setSavingFor(null);
    }
  }

  async function handleNeedToKnowToggle(row: PermRow, value: boolean) {
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm: FolderPermission = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: row.permission?.role ?? DocumentPermission.Viewer,
        needToKnow: value,
        grantedBy: callerPrincipal as unknown as FolderPermission["grantedBy"],
        grantedAt: BigInt(Date.now()),
      };
      await actor.setFolderPermission(perm);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === key
            ? { ...r, permission: perm }
            : r,
        ),
      );
      toast.success("Need-to-know updated");
    } catch {
      toast.error("Failed to update need-to-know");
    } finally {
      setSavingFor(null);
    }
  }

  async function handleRevoke(profile: ExtendedProfile) {
    try {
      await actor.revokeFolderPermission(folder.id, profile.principalId);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === profile.principalId.toString()
            ? { ...r, permission: null }
            : r,
        ),
      );
      toast.success("Permission revoked");
    } catch {
      toast.error("Failed to revoke permission");
    } finally {
      setRevokeTarget(null);
    }
  }

  if (isLoading) return <PermissionsSkeleton />;

  return (
    <div data-ocid="documents.permissions.panel">
      {/* Revoke confirm */}
      <ConfirmDialog
        isOpen={!!revokeTarget}
        onOpenChange={(v) => {
          if (!v) setRevokeTarget(null);
        }}
        title="Revoke Permission"
        description={`Remove all folder access for ${revokeTarget?.name ?? "this user"}?`}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (revokeTarget) void handleRevoke(revokeTarget);
        }}
        onCancel={() => setRevokeTarget(null)}
      />

      <div className="divide-y" style={{ borderColor: "#1a2235" }}>
        {rows.map((row, idx) => {
          const key = row.profile.principalId.toString();
          const isSaving = savingFor === key;
          const currentRole =
            row.permission?.role ?? DocumentPermission.NoAccess;
          const hasAccess = currentRole !== DocumentPermission.NoAccess;
          const isCallerSelf = key === callerPrincipal.toString();

          return (
            <div
              key={key}
              data-ocid={`documents.permissions.row.${idx + 1}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Name + rank */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {row.profile.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {row.profile.rank}
                </p>
              </div>

              {/* Role dropdown */}
              <Select
                value={currentRole}
                onValueChange={(v) => void handleRoleChange(row, v)}
                disabled={isSaving || isCallerSelf}
              >
                <SelectTrigger
                  data-ocid={`documents.permissions.role.select.${idx + 1}`}
                  className="h-7 w-28 border-border font-mono text-[10px] uppercase tracking-wider text-slate-300"
                  style={{ backgroundColor: "#0a0e1a" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  {Object.values(DocumentPermission).map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="font-mono text-[10px] uppercase tracking-wider text-slate-300 focus:text-white"
                    >
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Need-to-know toggle */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  NtK
                </span>
                <Switch
                  data-ocid={`documents.permissions.needtoknow.switch.${idx + 1}`}
                  checked={row.permission?.needToKnow ?? false}
                  onCheckedChange={(v) => void handleNeedToKnowToggle(row, v)}
                  disabled={isSaving || isCallerSelf}
                />
              </div>

              {/* Revoke */}
              {hasAccess && !isCallerSelf && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`documents.permissions.revoke.button.${idx + 1}`}
                  className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={() => setRevokeTarget(row.profile)}
                  disabled={isSaving}
                >
                  Revoke
                </Button>
              )}

              {isSaving && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DocumentsPage ───────────────────────────────────────────────────────

interface TierState {
  level: number;
  folders: Folder[];
  expanded: boolean;
}

export default function DocumentsPage() {
  const { actor, isFetching } = useActor();
  const { isS2Admin, clearanceLevel } = usePermissions();
  const { identity } = useInternetIdentity();

  const callerPrincipal = identity?.getPrincipal();

  // Sidebar data
  const [tiers, setTiers] = useState<TierState[]>([]);
  const [_myPermissions, setMyPermissions] = useState<FolderPermission[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  // Selected folder
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);

  // Active panel tab
  const [activeTab, setActiveTab] = useState<"documents" | "permissions">(
    "documents",
  );

  // ── Load sidebar data ──────────────────────────────────────────────────────
  const loadSidebar = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsSidebarLoading(true);
    try {
      const [allFolders, myPerms] = await Promise.all([
        actor.getAllFolders(),
        actor.getMyFolderPermission(),
      ]);

      setMyPermissions(myPerms);

      // Group by clearance level
      const grouped: Record<number, Folder[]> = {};
      for (const f of allFolders) {
        const lvl = Number(f.requiredClearanceLevel);
        if (!grouped[lvl]) grouped[lvl] = [];
        grouped[lvl].push(f);
      }

      const tierList: TierState[] = [];
      for (let lvl = 0; lvl <= 4; lvl++) {
        const foldersAtLevel = grouped[lvl] ?? [];
        if (foldersAtLevel.length === 0) continue;

        // Filter folders this user can see
        let visibleFolders: Folder[];
        if (isS2Admin) {
          visibleFolders = foldersAtLevel;
        } else {
          visibleFolders = foldersAtLevel.filter((f) => {
            if (clearanceLevel < lvl) return false;
            const perm = myPerms.find((p) => p.folderId === f.id);
            return (
              perm !== undefined &&
              perm.needToKnow === true &&
              perm.role !== DocumentPermission.NoAccess
            );
          });
        }

        if (visibleFolders.length === 0) continue;

        tierList.push({
          level: lvl,
          folders: visibleFolders,
          expanded: lvl === 0,
        });
      }

      setTiers(tierList);
    } catch {
      toast.error("Failed to load folders");
    } finally {
      setIsSidebarLoading(false);
    }
  }, [actor, isFetching, isS2Admin, clearanceLevel]);

  useEffect(() => {
    void loadSidebar();
  }, [loadSidebar]);

  // ── Load documents + profiles when folder selected ─────────────────────────
  const loadDocuments = useCallback(
    async (folderId: string) => {
      if (!actor) return;
      setIsDocsLoading(true);
      try {
        const [docs, allProfiles] = await Promise.all([
          actor.getDocumentsByFolder(folderId),
          actor.getAllProfiles(),
        ]);
        setDocuments(docs);
        setProfiles(allProfiles);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setIsDocsLoading(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    if (selectedFolder) {
      setActiveTab("documents");
      void loadDocuments(selectedFolder.id);
    }
  }, [selectedFolder, loadDocuments]);

  // ── Tier expand toggle ─────────────────────────────────────────────────────
  function toggleTier(level: number) {
    setTiers((prev) =>
      prev.map((t) =>
        t.level === level ? { ...t, expanded: !t.expanded } : t,
      ),
    );
  }

  // ── Delete document ────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      await actor.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── Breadcrumb tier label ─────────────────────────────────────────────────
  const activeTierLabel = selectedFolder
    ? (CLEARANCE_LABELS[Number(selectedFolder.requiredClearanceLevel)] ??
      "Unknown")
    : null;

  const showTabs = isS2Admin && selectedFolder !== null;

  return (
    <div
      data-ocid="documents.page"
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete Document"
        description="This document will be permanently deleted. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Upload modal */}
      {selectedFolder && actor && callerPrincipal && (
        <UploadModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          folder={selectedFolder}
          callerPrincipal={callerPrincipal}
          onUploaded={() => void loadDocuments(selectedFolder.id)}
          actor={actor}
        />
      )}

      {/* Page header strip */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: "#1a2235" }}
      >
        <Shield className="h-4 w-4 text-amber-500" />
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none">
            Documents
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Classified document management
          </p>
        </div>
      </div>

      {/* Body — sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside
          data-ocid="documents.sidebar.panel"
          className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r"
          style={{
            backgroundColor: "#0a0e1a",
            borderColor: "#1a2235",
          }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center px-4 py-3 border-b"
            style={{ borderColor: "#1a2235" }}
          >
            <Shield className="mr-2 h-3.5 w-3.5 text-amber-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
              Classified Folders
            </span>
          </div>

          {/* Tier list */}
          <ScrollArea className="flex-1">
            {isSidebarLoading ? (
              <SidebarSkeleton />
            ) : tiers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  No accessible folders
                </p>
              </div>
            ) : (
              <div className="py-2">
                {tiers.map((tier, tierIdx) => (
                  <div key={tier.level}>
                    {/* Tier header — toggle */}
                    <button
                      type="button"
                      data-ocid={`documents.folder.tier.${tierIdx + 1}`}
                      onClick={() => toggleTier(tier.level)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none"
                    >
                      {tier.expanded ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                      )}
                      <span className="flex-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        {CLEARANCE_LABELS[tier.level]}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600">
                        {tier.folders.length}
                      </span>
                    </button>

                    {/* Folder items */}
                    {tier.expanded && (
                      <div className="pb-1">
                        {tier.folders.map((folder, folderIdx) => {
                          const isActive = selectedFolder?.id === folder.id;
                          return (
                            <button
                              key={folder.id}
                              type="button"
                              data-ocid={`documents.folder.item.${folderIdx + 1}`}
                              onClick={() => setSelectedFolder(folder)}
                              className={cn(
                                "flex w-full items-center gap-2 py-2 pl-8 pr-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-none",
                                isActive &&
                                  "border-l-2 border-amber-500 bg-amber-500/5",
                              )}
                            >
                              <FileText
                                className={cn(
                                  "h-3 w-3 shrink-0",
                                  isActive
                                    ? "text-amber-500"
                                    : "text-slate-600",
                                )}
                              />
                              <span
                                className={cn(
                                  "flex-1 truncate font-mono text-[10px] uppercase tracking-wider",
                                  isActive
                                    ? "text-amber-400"
                                    : "text-slate-400",
                                )}
                              >
                                {folder.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb + action bar */}
          <div
            className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3"
            style={{ borderColor: "#1a2235" }}
          >
            {/* Breadcrumb */}
            <nav
              data-ocid="documents.breadcrumb.panel"
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider"
            >
              <Link
                to="/"
                data-ocid="documents.breadcrumb.hub.link"
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                Hub
              </Link>
              {activeTierLabel && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className="text-slate-400">{activeTierLabel}</span>
                </>
              )}
              {selectedFolder && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className="text-white">{selectedFolder.name}</span>
                </>
              )}
            </nav>

            {/* Upload button */}
            {selectedFolder && (
              <Button
                type="button"
                size="sm"
                data-ocid="documents.upload.open_modal_button"
                className="h-7 gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-3 w-3" />
                Upload Document
              </Button>
            )}
          </div>

          {/* Tabs (S2 admin + folder selected) */}
          {showTabs ? (
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "documents" | "permissions")
              }
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div
                className="shrink-0 border-b px-5"
                style={{ borderColor: "#1a2235" }}
              >
                <TabsList className="h-9 bg-transparent p-0">
                  <TabsTrigger
                    value="documents"
                    data-ocid="documents.documents.tab"
                    className="h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none"
                  >
                    Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    data-ocid="documents.permissions.tab"
                    className="h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none"
                  >
                    Permissions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="documents"
                className="mt-0 flex-1 overflow-hidden"
              >
                <DocumentListContent
                  isLoading={isDocsLoading}
                  documents={documents}
                  profiles={profiles}
                  callerPrincipal={callerPrincipal}
                  isS2Admin={isS2Admin}
                  onDelete={setDeleteTarget}
                />
              </TabsContent>

              <TabsContent
                value="permissions"
                className="mt-0 flex-1 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  {actor && callerPrincipal && (
                    <PermissionsTab
                      folder={selectedFolder}
                      actor={actor}
                      callerPrincipal={callerPrincipal}
                    />
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <DocumentListContent
              isLoading={isDocsLoading}
              documents={documents}
              profiles={profiles}
              callerPrincipal={callerPrincipal}
              isS2Admin={isS2Admin}
              onDelete={setDeleteTarget}
              noFolderSelected={selectedFolder === null}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Document List Content ────────────────────────────────────────────────────

interface DocumentListContentProps {
  isLoading: boolean;
  documents: Document[];
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string } | undefined;
  isS2Admin: boolean;
  onDelete: (doc: Document) => void;
  noFolderSelected?: boolean;
}

function DocumentListContent({
  isLoading,
  documents,
  profiles,
  callerPrincipal,
  isS2Admin,
  onDelete,
  noFolderSelected = false,
}: DocumentListContentProps) {
  if (noFolderSelected) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
          Select a folder to view documents
        </p>
      </div>
    );
  }

  if (isLoading) return <DocumentListSkeleton />;

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        message="No documents in this folder yet"
        className="h-full"
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div
        data-ocid="documents.list.table"
        className="divide-y"
        style={{ borderColor: "#1a2235" }}
      >
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-3 px-5 py-2">
          {["Name", "Class.", "Ver.", "Uploaded By", "Date", "Size", ""].map(
            (h) => (
              <span
                key={h}
                className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {documents.map((doc, idx) => {
          const isOwner =
            callerPrincipal &&
            doc.uploadedBy.toString() === callerPrincipal.toString();
          const canDelete = isOwner || isS2Admin;
          const uploaderName = getProfileName(profiles, doc.uploadedBy);

          return (
            <div
              key={doc.id}
              data-ocid={`documents.list.row.${idx + 1}`}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
            >
              {/* Name */}
              <span className="min-w-0 truncate font-mono text-xs text-white">
                {doc.name}
              </span>

              {/* Classification badge */}
              <ClassificationBadge level={Number(doc.classificationLevel)} />

              {/* Version */}
              <span className="font-mono text-[10px] text-slate-500">
                v{Number(doc.version)}
              </span>

              {/* Uploader */}
              <span className="max-w-[120px] truncate font-mono text-[10px] text-slate-400">
                {uploaderName}
              </span>

              {/* Date */}
              <span className="font-mono text-[10px] text-slate-500">
                {formatDate(doc.uploadedAt)}
              </span>

              {/* Size */}
              <span className="font-mono text-[10px] text-slate-500">
                {formatFileSize(doc.fileSize)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`documents.download.button.${idx + 1}`}
                  className="h-7 w-7 p-0 text-slate-500 hover:text-amber-400"
                  disabled={!doc.blobStorageKey}
                  title={doc.blobStorageKey ? "Download" : "No file attached"}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`documents.delete.open_modal_button.${idx + 1}`}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                    onClick={() => onDelete(doc)}
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
