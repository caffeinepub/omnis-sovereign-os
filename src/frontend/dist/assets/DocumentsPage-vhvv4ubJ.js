import { j as jsxRuntimeExports, d as cn, c as useExtActor, h as usePermissions, a as useInternetIdentity, r as reactExports, D as DocumentPermission, o as ue, S as Shield, p as FileText, L as Link, B as Button, q as Dialog, s as DialogContent, t as DialogHeader, v as DialogTitle, w as DialogFooter } from "./index-3JmW1yt2.js";
import { T as TopNav, S as ScrollArea, U as Upload } from "./TopNav-DiCFNdIt.js";
import { C as CLEARANCE_LABELS, a as CLEARANCE_COLORS } from "./constants-O6cGduIW.js";
import { C as ConfirmDialog } from "./ConfirmDialog-1EDTm5Yr.js";
import { E as EmptyState } from "./EmptyState-C_D-ewVe.js";
import { F as FormError } from "./FormError-B_fwtcLv.js";
import { S as SkeletonCard } from "./SkeletonCard-CyVoIr0k.js";
import { L as Label, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./displayName-C1ThBuVF.js";
import { S as Switch } from "./switch-CvRgRp58.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-KN1c1gUS.js";
import { T as Textarea } from "./textarea-oh3HfiS8.js";
import { C as ChevronDown } from "./chevron-down-DIFMpEfn.js";
import { C as ChevronRight } from "./chevron-right-CDFR456G.js";
import { L as LoaderCircle } from "./loader-circle-Cnu8h2Il.js";
import { D as Download } from "./download-DaqnCTb_.js";
import { T as Trash2 } from "./trash-2-B2bzslN2.js";
import "./check-BjjR4Zqv.js";
const COLOR_CLASSES = {
  gray: "bg-zinc-800/80 text-zinc-400 border-zinc-600",
  green: "bg-green-950/80 text-green-400 border-green-800",
  blue: "bg-blue-950/80 text-blue-400 border-blue-800",
  orange: "bg-orange-950/80 text-orange-400 border-orange-800",
  red: "bg-red-950/80 text-red-400 border-red-800"
};
function ClassificationBadge({
  level,
  className
}) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "data-ocid": "classification.badge",
      className: cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
        colorClass,
        className
      ),
      children: label
    }
  );
}
function formatFileSize(bytes) {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(ts) {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1e6) : new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function truncatePrincipal(p) {
  const s = p.toString();
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}
function getProfileName(profiles, principal) {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString()
  );
  return match ? `${match.rank} ${match.name}`.trim() : truncatePrincipal(principal);
}
function SidebarSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "documents.sidebar.loading_state", className: "space-y-3 p-4", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "h-8", className: "w-full" }, i)) });
}
function DocumentListSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "documents.list.loading_state", className: "space-y-2 p-4", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "h-12", className: "w-full" }, i)) });
}
function PermissionsSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "documents.permissions.loading_state",
      className: "space-y-2 p-4",
      children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "h-12", className: "w-full" }, i))
    }
  );
}
function UploadModal({
  open,
  onOpenChange,
  folder,
  callerPrincipal,
  onUploaded,
  actor
}) {
  const fileInputRef = reactExports.useRef(null);
  const [file, setFile] = reactExports.useState(null);
  const [docName, setDocName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [classLevel, setClassLevel] = reactExports.useState(
    String(Number(folder.requiredClearanceLevel))
  );
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setFile(null);
      setDocName("");
      setDescription("");
      setClassLevel(String(Number(folder.requiredClearanceLevel)));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, folder.requiredClearanceLevel, folder.id]);
  function handleFileChange(e) {
    var _a;
    const f = ((_a = e.target.files) == null ? void 0 : _a[0]) ?? null;
    setFile(f);
    if (f && !docName) setDocName(f.name);
  }
  function validate() {
    const errs = {};
    if (!file) errs.file = "Please select a file.";
    if (!docName.trim()) errs.docName = "Document name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const doc = {
        id: "",
        folderId: folder.id,
        name: docName.trim(),
        description: description.trim(),
        uploadedBy: callerPrincipal,
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(file.size),
        mimeType: file.type || "application/octet-stream",
        blobStorageKey: void 0,
        classificationLevel: BigInt(Number.parseInt(classLevel, 10)),
        documentStatus: "Active",
        sha256Hash: "",
        downloadCount: 0n,
        orgId: "",
        version: 1n
      };
      await actor.createDocument(doc);
      ue.success("Document uploaded successfully");
      onOpenChange(false);
      onUploaded();
    } catch {
      ue.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "documents.upload.modal",
      className: "border-border sm:max-w-lg",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Upload Document" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400", children: [
              "File ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                className: "hidden",
                onChange: handleFileChange
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                "data-ocid": "documents.upload.upload_button",
                className: "w-full justify-start gap-2 border-border font-mono text-xs uppercase tracking-wider text-slate-300",
                style: { backgroundColor: "#1a2235" },
                onClick: () => {
                  var _a;
                  return (_a = fileInputRef.current) == null ? void 0 : _a.click();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
                  file ? file.name : "Choose file…"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: errors.file })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400", children: [
              "Document Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "documents.upload.input",
                value: docName,
                onChange: (e) => setDocName(e.target.value),
                className: "border-border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235" },
                placeholder: "Enter document name"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: errors.docName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "data-ocid": "documents.upload.textarea",
                value: description,
                onChange: (e) => setDescription(e.target.value),
                className: "border-border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235" },
                placeholder: "Optional description",
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400", children: "Classification Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: classLevel, onValueChange: setClassLevel, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectTrigger,
                {
                  "data-ocid": "documents.upload.select",
                  className: "border-border font-mono text-xs text-white",
                  style: { backgroundColor: "#1a2235" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectContent,
                {
                  style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                  children: Object.entries(CLEARANCE_LABELS).map(([lvl, lbl]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectItem,
                    {
                      value: lvl,
                      className: "font-mono text-xs text-slate-300 focus:text-white",
                      children: lbl
                    },
                    lvl
                  ))
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              "data-ocid": "documents.upload.cancel_button",
              className: "border-border font-mono text-xs uppercase tracking-wider text-slate-300",
              onClick: () => onOpenChange(false),
              disabled: isSubmitting,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              "data-ocid": "documents.upload.submit_button",
              className: "font-mono text-xs uppercase tracking-wider",
              style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
              onClick: () => void handleSubmit(),
              disabled: isSubmitting,
              children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }),
                "Uploading…"
              ] }) : "Upload"
            }
          )
        ] })
      ]
    }
  ) });
}
function PermissionsTab({
  folder,
  actor,
  callerPrincipal
}) {
  const [rows, setRows] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [revokeTarget, setRevokeTarget] = reactExports.useState(
    null
  );
  const [savingFor, setSavingFor] = reactExports.useState(null);
  const loadData = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, perms] = await Promise.all([
        actor.getAllProfiles(),
        actor.getFolderPermissions(folder.id)
      ]);
      const built = profiles.map((p) => ({
        profile: p,
        permission: perms.find(
          (pm) => pm.userId.toString() === p.principalId.toString()
        ) ?? null
      }));
      setRows(built);
    } catch {
      ue.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [actor, folder.id]);
  reactExports.useEffect(() => {
    void loadData();
  }, [loadData]);
  async function handleRoleChange(row, newRole) {
    var _a;
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: newRole,
        needToKnow: ((_a = row.permission) == null ? void 0 : _a.needToKnow) ?? false,
        grantedBy: callerPrincipal,
        grantedAt: BigInt(Date.now())
      };
      await actor.setFolderPermission(perm);
      setRows(
        (prev) => prev.map(
          (r) => r.profile.principalId.toString() === key ? { ...r, permission: perm } : r
        )
      );
      ue.success("Permission updated");
    } catch {
      ue.error("Failed to update permission");
    } finally {
      setSavingFor(null);
    }
  }
  async function handleNeedToKnowToggle(row, value) {
    var _a;
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: ((_a = row.permission) == null ? void 0 : _a.role) ?? DocumentPermission.Viewer,
        needToKnow: value,
        grantedBy: callerPrincipal,
        grantedAt: BigInt(Date.now())
      };
      await actor.setFolderPermission(perm);
      setRows(
        (prev) => prev.map(
          (r) => r.profile.principalId.toString() === key ? { ...r, permission: perm } : r
        )
      );
      ue.success("Need-to-know updated");
    } catch {
      ue.error("Failed to update need-to-know");
    } finally {
      setSavingFor(null);
    }
  }
  async function handleRevoke(profile) {
    try {
      await actor.revokeFolderPermission(folder.id, profile.principalId);
      setRows(
        (prev) => prev.map(
          (r) => r.profile.principalId.toString() === profile.principalId.toString() ? { ...r, permission: null } : r
        )
      );
      ue.success("Permission revoked");
    } catch {
      ue.error("Failed to revoke permission");
    } finally {
      setRevokeTarget(null);
    }
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionsSkeleton, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "documents.permissions.panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        isOpen: !!revokeTarget,
        onOpenChange: (v) => {
          if (!v) setRevokeTarget(null);
        },
        title: "Revoke Permission",
        description: `Remove all folder access for ${(revokeTarget == null ? void 0 : revokeTarget.name) ?? "this user"}?`,
        confirmLabel: "Revoke",
        cancelLabel: "Cancel",
        onConfirm: () => {
          if (revokeTarget) void handleRevoke(revokeTarget);
        },
        onCancel: () => setRevokeTarget(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", style: { borderColor: "#1a2235" }, children: rows.map((row, idx) => {
      var _a, _b;
      const key = row.profile.principalId.toString();
      const isSaving = savingFor === key;
      const currentRole = ((_a = row.permission) == null ? void 0 : _a.role) ?? DocumentPermission.NoAccess;
      const hasAccess = currentRole !== DocumentPermission.NoAccess;
      const isCallerSelf = key === callerPrincipal.toString();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `documents.permissions.row.${idx + 1}`,
          className: "flex items-center gap-3 px-4 py-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-mono text-xs font-semibold uppercase tracking-wider text-white", children: row.profile.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: row.profile.rank })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: currentRole,
                onValueChange: (v) => void handleRoleChange(row, v),
                disabled: isSaving || isCallerSelf,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      "data-ocid": `documents.permissions.role.select.${idx + 1}`,
                      className: "h-7 w-28 border-border font-mono text-[10px] uppercase tracking-wider text-slate-300",
                      style: { backgroundColor: "#0a0e1a" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectContent,
                    {
                      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                      children: Object.values(DocumentPermission).map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectItem,
                        {
                          value: role,
                          className: "font-mono text-[10px] uppercase tracking-wider text-slate-300 focus:text-white",
                          children: role
                        },
                        role
                      ))
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider text-slate-500", children: "NtK" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  "data-ocid": `documents.permissions.needtoknow.switch.${idx + 1}`,
                  checked: ((_b = row.permission) == null ? void 0 : _b.needToKnow) ?? false,
                  onCheckedChange: (v) => void handleNeedToKnowToggle(row, v),
                  disabled: isSaving || isCallerSelf
                }
              )
            ] }),
            hasAccess && !isCallerSelf && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                "data-ocid": `documents.permissions.revoke.button.${idx + 1}`,
                className: "h-7 px-2 font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-900/20 hover:text-red-300",
                onClick: () => setRevokeTarget(row.profile),
                disabled: isSaving,
                children: "Revoke"
              }
            ),
            isSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-amber-500" })
          ]
        },
        key
      );
    }) })
  ] });
}
function DocumentsPage() {
  const { actor, isFetching } = useExtActor();
  const { isS2Admin, clearanceLevel } = usePermissions();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity == null ? void 0 : identity.getPrincipal();
  const [tiers, setTiers] = reactExports.useState([]);
  const [_myPermissions, setMyPermissions] = reactExports.useState([]);
  const [isSidebarLoading, setIsSidebarLoading] = reactExports.useState(true);
  const [selectedFolder, setSelectedFolder] = reactExports.useState(null);
  const [documents, setDocuments] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState([]);
  const [isDocsLoading, setIsDocsLoading] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [uploadOpen, setUploadOpen] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState(
    "documents"
  );
  const loadSidebar = reactExports.useCallback(async () => {
    if (!actor || isFetching) return;
    setIsSidebarLoading(true);
    try {
      const [allFolders, myPerms] = await Promise.all([
        actor.getAllFolders(),
        actor.getMyFolderPermission()
      ]);
      setMyPermissions(myPerms);
      const grouped = {};
      for (const f of allFolders) {
        const lvl = Number(f.requiredClearanceLevel);
        if (!grouped[lvl]) grouped[lvl] = [];
        grouped[lvl].push(f);
      }
      const tierList = [];
      for (let lvl = 0; lvl <= 4; lvl++) {
        const foldersAtLevel = grouped[lvl] ?? [];
        if (foldersAtLevel.length === 0) continue;
        let visibleFolders;
        if (isS2Admin) {
          visibleFolders = foldersAtLevel;
        } else {
          visibleFolders = foldersAtLevel.filter((f) => {
            if (clearanceLevel < lvl) return false;
            const perm = myPerms.find((p) => p.folderId === f.id);
            return perm !== void 0 && perm.needToKnow === true && perm.role !== DocumentPermission.NoAccess;
          });
        }
        if (visibleFolders.length === 0) continue;
        tierList.push({
          level: lvl,
          folders: visibleFolders,
          expanded: lvl === 0
        });
      }
      setTiers(tierList);
    } catch {
      ue.error("Failed to load folders");
    } finally {
      setIsSidebarLoading(false);
    }
  }, [actor, isFetching, isS2Admin, clearanceLevel]);
  reactExports.useEffect(() => {
    void loadSidebar();
  }, [loadSidebar]);
  const loadDocuments = reactExports.useCallback(
    async (folderId) => {
      if (!actor) return;
      setIsDocsLoading(true);
      try {
        const [docs, allProfiles] = await Promise.all([
          actor.getDocumentsByFolder(folderId),
          actor.getAllProfiles()
        ]);
        setDocuments(docs);
        setProfiles(allProfiles);
      } catch {
        ue.error("Failed to load documents");
      } finally {
        setIsDocsLoading(false);
      }
    },
    [actor]
  );
  reactExports.useEffect(() => {
    if (selectedFolder) {
      setActiveTab("documents");
      void loadDocuments(selectedFolder.id);
    }
  }, [selectedFolder, loadDocuments]);
  function toggleTier(level) {
    setTiers(
      (prev) => prev.map(
        (t) => t.level === level ? { ...t, expanded: !t.expanded } : t
      )
    );
  }
  async function handleDeleteConfirm() {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      await actor.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      ue.success("Document deleted");
    } catch {
      ue.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }
  const activeTierLabel = selectedFolder ? CLEARANCE_LABELS[Number(selectedFolder.requiredClearanceLevel)] ?? "UNCLASSIFIED" : null;
  const showTabs = isS2Admin && selectedFolder !== null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "documents.page",
      className: "flex h-screen flex-col overflow-hidden",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfirmDialog,
          {
            isOpen: !!deleteTarget,
            onOpenChange: (v) => {
              if (!v) setDeleteTarget(null);
            },
            title: "Delete Document",
            description: "This document will be permanently deleted. This cannot be undone.",
            confirmLabel: isDeleting ? "Deleting…" : "Delete",
            cancelLabel: "Cancel",
            onConfirm: () => void handleDeleteConfirm(),
            onCancel: () => setDeleteTarget(null)
          }
        ),
        selectedFolder && actor && callerPrincipal && /* @__PURE__ */ jsxRuntimeExports.jsx(
          UploadModal,
          {
            open: uploadOpen,
            onOpenChange: setUploadOpen,
            folder: selectedFolder,
            callerPrincipal,
            onUploaded: () => void loadDocuments(selectedFolder.id),
            actor
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex shrink-0 items-center gap-3 border-b px-5 py-3",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-amber-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none", children: "Documents" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "Classified document management" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "aside",
            {
              "data-ocid": "documents.sidebar.panel",
              className: "flex w-[280px] shrink-0 flex-col overflow-hidden border-r",
              style: {
                backgroundColor: "#0a0e1a",
                borderColor: "#1a2235"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center px-4 py-3 border-b",
                    style: { borderColor: "#1a2235" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "mr-2 h-3.5 w-3.5 text-amber-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500", children: "Classified Folders" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: isSidebarLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarSkeleton, {}) : tiers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: "No accessible folders" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: tiers.map((tier, tierIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `documents.folder.tier.${tierIdx + 1}`,
                      onClick: () => toggleTier(tier.level),
                      className: "flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none",
                      children: [
                        tier.expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 shrink-0 text-slate-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 shrink-0 text-slate-500" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400", children: CLEARANCE_LABELS[tier.level] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-slate-600", children: tier.folders.length })
                      ]
                    }
                  ),
                  tier.expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-1", children: tier.folders.map((folder, folderIdx) => {
                    const isActive = (selectedFolder == null ? void 0 : selectedFolder.id) === folder.id;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `documents.folder.item.${folderIdx + 1}`,
                        onClick: () => setSelectedFolder(folder),
                        className: cn(
                          "flex w-full items-center gap-2 py-2 pl-8 pr-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-none",
                          isActive && "border-l-2 border-amber-500 bg-amber-500/5"
                        ),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            FileText,
                            {
                              className: cn(
                                "h-3 w-3 shrink-0",
                                isActive ? "text-amber-500" : "text-slate-600"
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: cn(
                                "flex-1 truncate font-mono text-[10px] uppercase tracking-wider",
                                isActive ? "text-amber-400" : "text-slate-400"
                              ),
                              children: folder.name
                            }
                          )
                        ]
                      },
                      folder.id
                    );
                  }) })
                ] }, tier.level)) }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex flex-1 flex-col overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3",
                style: { borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "nav",
                    {
                      "data-ocid": "documents.breadcrumb.panel",
                      className: "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Link,
                          {
                            to: "/",
                            "data-ocid": "documents.breadcrumb.hub.link",
                            className: "text-amber-500 hover:text-amber-400 transition-colors",
                            children: "Hub"
                          }
                        ),
                        activeTierLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-slate-600" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: activeTierLabel })
                        ] }),
                        selectedFolder && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-slate-600" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: selectedFolder.name })
                        ] })
                      ]
                    }
                  ),
                  selectedFolder && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      "data-ocid": "documents.upload.open_modal_button",
                      className: "h-7 gap-1.5 font-mono text-[10px] uppercase tracking-wider",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      onClick: () => setUploadOpen(true),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3 w-3" }),
                        "Upload Document"
                      ]
                    }
                  )
                ]
              }
            ),
            showTabs ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Tabs,
              {
                value: activeTab,
                onValueChange: (v) => setActiveTab(v),
                className: "flex flex-1 flex-col overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "shrink-0 border-b px-5",
                      style: { borderColor: "#1a2235" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-9 bg-transparent p-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          TabsTrigger,
                          {
                            value: "documents",
                            "data-ocid": "documents.documents.tab",
                            className: "h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none",
                            children: "Documents"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          TabsTrigger,
                          {
                            value: "permissions",
                            "data-ocid": "documents.permissions.tab",
                            className: "h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none",
                            children: "Permissions"
                          }
                        )
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsContent,
                    {
                      value: "documents",
                      className: "mt-0 flex-1 overflow-hidden",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        DocumentListContent,
                        {
                          isLoading: isDocsLoading,
                          documents,
                          profiles,
                          callerPrincipal,
                          isS2Admin,
                          onDelete: setDeleteTarget
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsContent,
                    {
                      value: "permissions",
                      className: "mt-0 flex-1 overflow-hidden",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: actor && callerPrincipal && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        PermissionsTab,
                        {
                          folder: selectedFolder,
                          actor,
                          callerPrincipal
                        }
                      ) })
                    }
                  )
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              DocumentListContent,
              {
                isLoading: isDocsLoading,
                documents,
                profiles,
                callerPrincipal,
                isS2Admin,
                onDelete: setDeleteTarget,
                noFolderSelected: selectedFolder === null
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "shrink-0 border-t px-4 py-3 text-center",
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
function DocumentListContent({
  isLoading,
  documents,
  profiles,
  callerPrincipal,
  isS2Admin,
  onDelete,
  noFolderSelected = false
}) {
  if (noFolderSelected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "Select a folder to view documents" }) });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentListSkeleton, {});
  if (documents.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, {}),
        message: "No documents in this folder yet",
        className: "h-full"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "documents.list.table",
      className: "divide-y",
      style: { borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-3 px-5 py-2", children: ["Name", "Class.", "Ver.", "Uploaded By", "Date", "Size", ""].map(
          (h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600",
              children: h
            },
            h
          )
        ) }),
        documents.map((doc, idx) => {
          const isOwner = callerPrincipal && doc.uploadedBy.toString() === callerPrincipal.toString();
          const canDelete = isOwner || isS2Admin;
          const uploaderName = getProfileName(profiles, doc.uploadedBy);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `documents.list.row.${idx + 1}`,
              className: "grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate font-mono text-xs text-white", children: doc.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClassificationBadge, { level: Number(doc.classificationLevel) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-slate-500", children: [
                  "v",
                  Number(doc.version)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[120px] truncate font-mono text-[10px] text-slate-400", children: uploaderName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-500", children: formatDate(doc.uploadedAt) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-500", children: formatFileSize(doc.fileSize) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      "data-ocid": `documents.download.button.${idx + 1}`,
                      className: "h-7 w-7 p-0 text-slate-500 hover:text-amber-400",
                      disabled: !doc.blobStorageKey,
                      title: doc.blobStorageKey ? "Download" : "No file attached",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      "data-ocid": `documents.delete.open_modal_button.${idx + 1}`,
                      className: "h-7 w-7 p-0 text-slate-500 hover:text-red-400",
                      onClick: () => onDelete(doc),
                      title: "Delete document",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ]
            },
            doc.id
          );
        })
      ]
    }
  ) });
}
export {
  DocumentsPage as default
};
