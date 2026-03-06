import type { Document, ExtendedProfile, Folder, Section } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useStorageClient } from "@/hooks/useStorageClient";
import { cn } from "@/lib/utils";

import {
  Download,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  FolderOpen,
  HardDrive,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const VAULT_SECTION_NAME = "__file_vault_section__";
const VAULT_FOLDER_NAME = "__file_vault__";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy: string; // principal string
  uploaderName: string;
  uploadedAt: number; // ms timestamp
  blobUrl: string; // direct URL for download
  blobHash: string; // storage hash key
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <FileImage className="h-4 w-4 text-blue-400" />;
  if (mimeType.startsWith("video/"))
    return <FileVideo className="h-4 w-4 text-purple-400" />;
  if (mimeType.startsWith("audio/"))
    return <FileAudio className="h-4 w-4 text-green-400" />;
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("word")
  )
    return <FileText className="h-4 w-4 text-amber-400" />;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("compress")
  )
    return <File className="h-4 w-4 text-orange-400" />;
  return <File className="h-4 w-4 text-slate-400" />;
}

/** Normalize ICP timestamps — could be nanoseconds or milliseconds */
function normalizeTimestamp(ts: bigint): number {
  const n = Number(ts);
  return n > 1e15 ? Math.floor(n / 1_000_000) : n;
}

function resolveUploaderName(
  profiles: ExtendedProfile[],
  principalStr: string,
): string {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match) return `${match.rank} ${match.name}`.trim();
  return `${principalStr.slice(0, 6)}…${principalStr.slice(-4)}`;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function FileListSkeleton() {
  return (
    <div
      data-ocid="file_storage.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <SkeletonCard width="w-4" height="h-4" />
          <SkeletonCard className="h-4 flex-1" />
          <SkeletonCard className="h-4 w-20" />
          <SkeletonCard className="h-4 w-24" />
          <SkeletonCard className="h-4 w-28" />
          <SkeletonCard className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  uploadProgress: number | null;
  isUploading: boolean;
  onUpload: () => void;
  storageReady: boolean;
  vaultReady: boolean;
}

function DropZone({
  onFileSelected,
  selectedFile,
  onClear,
  uploadProgress,
  isUploading,
  onUpload,
  storageReady,
  vaultReady,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        onFileSelected(files[0]);
      }
    },
    [onFileSelected],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
        // Reset input so re-selecting same file still fires
        e.target.value = "";
      }
    },
    [onFileSelected],
  );

  const handleZoneClick = useCallback(() => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  }, [selectedFile]);

  const handleZoneKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [selectedFile],
  );

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        data-ocid="file_storage.dropzone"
        aria-label="Drop zone: drag and drop files here or click to browse"
        className={cn(
          "relative flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-8 py-10 transition-all",
          isDragging
            ? "border-amber-500 bg-amber-500/5"
            : "border-[#1a2235] hover:border-amber-500/50 hover:bg-white/[0.02]",
          selectedFile ? "cursor-default" : "cursor-pointer",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleInputChange}
          tabIndex={-1}
        />

        {/* Upload progress overlay */}
        {isUploading && uploadProgress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-[#0a0e1a]/90">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-amber-500" />
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-amber-500">
              Uploading…
            </p>
            <div className="w-48">
              <Progress value={uploadProgress} className="h-1.5 bg-[#1a2235]" />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-slate-500">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col items-center gap-3 transition-opacity",
            isUploading && "opacity-0",
          )}
        >
          <div
            className={cn(
              "rounded-sm border p-3 transition-colors",
              isDragging
                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                : "border-[#1a2235] bg-[#0f1626] text-slate-500",
            )}
          >
            <HardDrive className="h-6 w-6" />
          </div>

          {selectedFile ? (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-white">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove selected file"
                className="ml-2 rounded-sm p-1 text-slate-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-slate-300">
                  Drag & drop files here
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload button */}
      {selectedFile && !isUploading && (
        <div className="flex justify-end">
          <Button
            type="button"
            data-ocid="file_storage.upload_button"
            disabled={
              !selectedFile || !storageReady || !vaultReady || isUploading
            }
            onClick={onUpload}
            className="gap-2 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
          >
            <Upload className="h-3.5 w-3.5" />
            Confirm Upload
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── File Table ───────────────────────────────────────────────────────────────

interface FileTableProps {
  files: FileRecord[];
  currentPrincipal: string;
  isS2Admin: boolean;
  onDelete: (file: FileRecord) => void;
}

function FileTable({
  files,
  currentPrincipal,
  isS2Admin,
  onDelete,
}: FileTableProps) {
  if (files.length === 0) {
    return (
      <div data-ocid="file_storage.empty_state">
        <EmptyState
          icon={<FolderOpen />}
          message="No files uploaded yet"
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div data-ocid="file_storage.file_list.table">
      {/* Table header */}
      <div
        className="grid items-center gap-4 border-b px-6 py-2.5"
        style={{
          borderColor: "#1a2235",
          gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem",
        }}
      >
        {["", "Name", "Size", "Date", "Uploaded By", "", ""].map((h, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static header row
            key={i}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Table rows */}
      <div className="divide-y" style={{ borderColor: "#1a2235" }}>
        {files.map((file, idx) => {
          const isOwner = file.uploadedBy === currentPrincipal;
          const canDelete = isOwner || isS2Admin;

          return (
            <div
              key={file.id}
              data-ocid={`file_storage.file.item.${idx + 1}`}
              className="grid items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
              style={{
                gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem",
              }}
            >
              {/* Icon */}
              <div className="flex justify-center">
                {getMimeIcon(file.mimeType)}
              </div>

              {/* Name */}
              <span className="min-w-0 truncate font-mono text-xs text-white">
                {file.name}
              </span>

              {/* Size */}
              <span className="font-mono text-[10px] text-slate-400">
                {formatFileSize(file.size)}
              </span>

              {/* Date */}
              <span className="font-mono text-[10px] text-slate-400">
                {formatDate(file.uploadedAt)}
              </span>

              {/* Uploader */}
              <span className="truncate font-mono text-[10px] text-slate-400">
                {file.uploaderName}
              </span>

              {/* Download */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`file_storage.file.download_button.${idx + 1}`}
                  className="h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-amber-400"
                  onClick={() => {
                    window.open(file.blobUrl, "_blank", "noopener,noreferrer");
                  }}
                  title="Download file"
                  disabled={!file.blobUrl}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Get</span>
                </Button>
              </div>

              {/* Delete */}
              <div>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`file_storage.file.delete_button.${idx + 1}`}
                    className="h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-red-400"
                    onClick={() => onDelete(file)}
                    title="Delete file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                ) : (
                  <div className="h-7" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FileStoragePage ──────────────────────────────────────────────────────────

export default function FileStoragePage() {
  const { actor, isFetching } = useActor();
  const { profile, isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );

  // File list state
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [vaultFolderId, setVaultFolderId] = useState<string | null>(null);
  const [vaultReady, setVaultReady] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard to prevent duplicate vault initialization calls
  const initializingRef = useRef(false);
  // Extra guard to prevent vault creation firing more than once (Strict Mode double-invoke)
  const isCreatingVaultRef = useRef(false);

  const currentPrincipal = identity?.getPrincipal().toString() ?? "";
  const uploaderName = profile
    ? `${profile.rank} ${profile.name}`.trim()
    : "Unknown";

  // ── Vault initialization & file loading ────────────────────────────────────
  const initializeVaultAndLoadFiles = useCallback(async () => {
    if (!actor || isFetching || initializingRef.current) return;

    initializingRef.current = true;
    setIsLoadingInitial(true);

    try {
      // Step 1: Find or create the vault folder
      const allFolders = await actor.getAllFolders();
      let vaultFolder = allFolders.find(
        (f: Folder) => f.name === VAULT_FOLDER_NAME,
      );

      if (!vaultFolder) {
        // Guard against concurrent vault creation (e.g., React Strict Mode double-invoke)
        if (isCreatingVaultRef.current) return;
        isCreatingVaultRef.current = true;

        try {
          // Find or create the vault section
          const allSections = await actor.getSections();
          let vaultSection = allSections.find(
            (s: Section) => s.name === VAULT_SECTION_NAME,
          );

          if (!vaultSection) {
            const callerPrincipal = identity?.getPrincipal();
            if (!callerPrincipal) throw new Error("No identity available");

            const newSectionId = await actor.createSection({
              id: "",
              name: VAULT_SECTION_NAME,
              description: "Internal file vault section",
              createdBy: callerPrincipal,
              createdAt: BigInt(Date.now()),
              iconName: "HardDrive",
              parentSectionId: undefined,
            });

            // Fetch again to get the real section
            const sections = await actor.getSections();
            vaultSection = sections.find(
              (s: Section) =>
                s.id === newSectionId || s.name === VAULT_SECTION_NAME,
            );
            if (!vaultSection)
              throw new Error("Failed to create vault section");
          }

          const callerPrincipal = identity?.getPrincipal();
          if (!callerPrincipal) throw new Error("No identity available");

          const newFolderId = await actor.createFolder({
            id: "",
            sectionId: vaultSection.id,
            name: VAULT_FOLDER_NAME,
            description: "Secure file vault",
            isPersonal: false,
            assignedUserId: undefined,
            requiredClearanceLevel: 0n,
            createdBy: callerPrincipal,
            createdAt: BigInt(Date.now()),
          });

          // Fetch folders again to get the real folder
          const refreshedFolders = await actor.getAllFolders();
          vaultFolder = refreshedFolders.find(
            (f: Folder) => f.id === newFolderId || f.name === VAULT_FOLDER_NAME,
          );
          if (!vaultFolder) throw new Error("Failed to create vault folder");
        } catch (creationErr) {
          isCreatingVaultRef.current = false;
          throw creationErr;
        }

        isCreatingVaultRef.current = false;
      }

      const folderId = vaultFolder.id;
      setVaultFolderId(folderId);

      // Step 2: Load documents + profiles in parallel
      const [docs, profiles] = await Promise.all([
        actor.getDocumentsByFolder(folderId),
        actor.getAllProfiles(),
      ]);

      // Step 3: Build FileRecord array from Document objects
      const records: FileRecord[] = await Promise.all(
        docs.map(async (doc: Document) => {
          const principalStr = doc.uploadedBy.toString();
          const uploaderDisplayName = resolveUploaderName(
            profiles,
            principalStr,
          );
          const uploadedAtMs = normalizeTimestamp(doc.uploadedAt);

          let blobUrl = "";
          if (doc.blobStorageKey && storageClient) {
            try {
              blobUrl = await storageClient.getDirectURL(doc.blobStorageKey);
            } catch {
              // Non-fatal — blob URL may not be resolvable without live client
            }
          }

          return {
            id: doc.id,
            name: doc.name,
            size: Number(doc.fileSize),
            mimeType: doc.mimeType,
            uploadedBy: principalStr,
            uploaderName: uploaderDisplayName,
            uploadedAt: uploadedAtMs,
            blobUrl,
            blobHash: doc.blobStorageKey ?? "",
          };
        }),
      );

      // Newest first
      records.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setFiles(records);
      setVaultReady(true);
    } catch (err) {
      console.error("Vault initialization failed:", err);
      toast.error(
        "Failed to initialize file vault. Some features may be unavailable.",
      );
      // Graceful degradation — vault not ready but page doesn't crash
      setVaultReady(false);
    } finally {
      setIsLoadingInitial(false);
      initializingRef.current = false;
    }
  }, [actor, isFetching, identity, storageClient]);

  useEffect(() => {
    if (actor && !isFetching) {
      void initializeVaultAndLoadFiles();
    }
  }, [actor, isFetching, initializeVaultAndLoadFiles]);

  // Re-run vault init when storage client becomes ready and vault hasn't loaded yet
  useEffect(() => {
    if (
      storageClient &&
      storageReady &&
      actor &&
      !isFetching &&
      !vaultReady &&
      !isLoadingInitial
    ) {
      void initializeVaultAndLoadFiles();
    }
  }, [
    storageClient,
    storageReady,
    actor,
    isFetching,
    vaultReady,
    isLoadingInitial,
    initializeVaultAndLoadFiles,
  ]);

  // ── Handle upload ───────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !storageClient) {
      toast.error("Storage not ready. Please try again.");
      return;
    }
    if (!actor || !vaultFolderId) {
      toast.error("File vault not ready. Please try again.");
      return;
    }

    const callerPrincipal = identity?.getPrincipal();
    if (!callerPrincipal) {
      toast.error("Not authenticated.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload to blob storage
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });

      // Step 2: Persist document metadata to backend
      const docPayload: Document = {
        id: "",
        folderId: vaultFolderId,
        name: selectedFile.name,
        description: "",
        uploadedBy: callerPrincipal as unknown as Document["uploadedBy"],
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(selectedFile.size),
        mimeType: selectedFile.type || "application/octet-stream",
        blobStorageKey: hash,
        classificationLevel: 0n,
        version: 1n,
      };
      const docId = await actor.createDocument(docPayload);

      // Step 3: Resolve blob URL for immediate download availability
      let blobUrl = "";
      try {
        blobUrl = await storageClient.getDirectURL(hash);
      } catch {
        // Non-fatal
      }

      const newRecord: FileRecord = {
        id: docId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type || "application/octet-stream",
        uploadedBy: currentPrincipal,
        uploaderName,
        uploadedAt: Date.now(),
        blobUrl,
        blobHash: hash,
      };

      setFiles((prev) => [newRecord, ...prev]);
      setSelectedFile(null);
      setUploadProgress(null);
      toast.success(`"${selectedFile.name}" uploaded successfully`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [
    selectedFile,
    storageClient,
    actor,
    vaultFolderId,
    identity,
    currentPrincipal,
    uploaderName,
  ]);

  // ── Handle delete ───────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      // Delete backend document record first
      await actor.deleteDocument(deleteTarget.id);
      // Remove from local state only after successful backend call
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("File deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete file. Please try again.");
      // Keep item in list — don't remove on failure
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, actor]);

  return (
    <div
      data-ocid="file_storage.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete this file?"
        description="This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          {/* Title area */}
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                File Storage
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                Secure file vault
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  storageReady ? "bg-green-500" : "bg-slate-600",
                )}
              />
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                {storageReady ? "Storage Ready" : "Initializing…"}
              </span>
            </div>
            {!isLoadingInitial && (
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    vaultReady ? "bg-green-500" : "bg-red-500/50",
                  )}
                />
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {vaultReady ? "Vault Synced" : "Vault Error"}
                </span>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            {/* Section label */}
            <div className="flex items-center gap-3">
              <HardDrive className="h-4 w-4 text-amber-500" />
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500">
                Secure File Vault
              </h2>
              <div
                className="flex-1 border-t"
                style={{ borderColor: "#1a2235" }}
              />
              {!isLoadingInitial && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              )}
            </div>

            {/* Upload zone */}
            <div
              className="rounded-sm border p-5"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Upload File
              </p>
              <DropZone
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onUpload={() => void handleUpload()}
                storageReady={storageReady}
                vaultReady={vaultReady}
              />
            </div>

            {/* File list */}
            <div
              className="rounded-sm border overflow-hidden"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <div
                className="flex items-center gap-3 border-b px-6 py-3"
                style={{ borderColor: "#1a2235" }}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  Uploaded Files
                </span>
              </div>

              {isLoadingInitial ? (
                <FileListSkeleton />
              ) : (
                <FileTable
                  files={files}
                  currentPrincipal={currentPrincipal}
                  isS2Admin={isS2Admin}
                  onDelete={setDeleteTarget}
                />
              )}
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* Footer */}
      <footer
        className="shrink-0 border-t px-6 py-4"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="text-center font-mono text-[9px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 transition-colors hover:text-slate-500"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
