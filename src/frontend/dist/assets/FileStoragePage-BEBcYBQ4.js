import { f as createLucideIcon, r as reactExports, j as jsxRuntimeExports, H as createContextScope, $ as Primitive, e as cn, c as useExtActor, h as usePermissions, a as useInternetIdentity, p as ue, X, B as Button, F as FolderOpen, y as FileText } from "./index-CnBkd1vF.js";
import { c as useStorageClient, T as TopNav, S as ScrollArea, U as Upload } from "./TopNav-D92LzMme.js";
import { C as ConfirmDialog } from "./ConfirmDialog-DiFls1EX.js";
import { E as EmptyState } from "./EmptyState-BDJMqCdQ.js";
import { S as SkeletonCard } from "./SkeletonCard-i07i4n6l.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-DKCCDcWa.js";
import { H as HardDrive } from "./hard-drive-vR_P-u0G.js";
import { L as LoaderCircle } from "./loader-circle-CXCl3Roj.js";
import { D as Download } from "./download-CVtNtxRm.js";
import { T as Trash2 } from "./trash-2-BRLLZ9cv.js";
import "./displayName-B5NkxsrN.js";
import "./check-C4XqBZ-7.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-B23VjFYD.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3", key: "rslqgf" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    {
      d: "M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0",
      key: "9f7x3i"
    }
  ]
];
const FileAudio = createLucideIcon("file-audio", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["circle", { cx: "10", cy: "12", r: "2", key: "737tya" }],
  ["path", { d: "m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22", key: "wt3hpn" }]
];
const FileImage = createLucideIcon("file-image", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m10 11 5 3-5 3v-6Z", key: "7ntvm4" }]
];
const FileVideo = createLucideIcon("file-video", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
];
const File = createLucideIcon("file", __iconNode);
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress$1.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root = Progress$1;
var Indicator = ProgressIndicator;
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
const VAULT_SECTION_NAME = "__file_vault_section__";
const VAULT_FOLDER_NAME = "__file_vault__";
function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function getMimeIcon(mimeType) {
  if (mimeType.startsWith("image/"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileImage, { className: "h-4 w-4 text-blue-400" });
  if (mimeType.startsWith("video/"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileVideo, { className: "h-4 w-4 text-purple-400" });
  if (mimeType.startsWith("audio/"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileAudio, { className: "h-4 w-4 text-green-400" });
  if (mimeType === "application/pdf" || mimeType.startsWith("text/") || mimeType.includes("document") || mimeType.includes("word"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-amber-400" });
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("gzip") || mimeType.includes("rar") || mimeType.includes("7z") || mimeType.includes("compress"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-4 w-4 text-orange-400" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-4 w-4 text-slate-400" });
}
function normalizeTimestamp(ts) {
  const n = Number(ts);
  return n > 1e15 ? Math.floor(n / 1e6) : n;
}
function resolveUploaderName(profiles, principalStr) {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match) return `${match.rank} ${match.name}`.trim();
  return `${principalStr.slice(0, 6)}…${principalStr.slice(-4)}`;
}
function FileListSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "file_storage.loading_state",
      className: "divide-y",
      style: { borderColor: "#1a2235" },
      children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { width: "w-4", height: "h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "h-4 flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "h-4 w-24" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "h-4 w-28" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { className: "h-7 w-16" })
      ] }, i))
    }
  );
}
function DropZone({
  onFileSelected,
  selectedFile,
  onClear,
  uploadProgress,
  isUploading,
  onUpload,
  storageReady,
  vaultReady
}) {
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const handleDragEnter = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDragOver = reactExports.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        onFileSelected(files[0]);
      }
    },
    [onFileSelected]
  );
  const handleInputChange = reactExports.useCallback(
    (e) => {
      var _a;
      const file = (_a = e.target.files) == null ? void 0 : _a[0];
      if (file) {
        onFileSelected(file);
        e.target.value = "";
      }
    },
    [onFileSelected]
  );
  const handleZoneClick = reactExports.useCallback(() => {
    var _a;
    if (!selectedFile) {
      (_a = fileInputRef.current) == null ? void 0 : _a.click();
    }
  }, [selectedFile]);
  const handleZoneKeyDown = reactExports.useCallback(
    (e) => {
      var _a;
      if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
        e.preventDefault();
        (_a = fileInputRef.current) == null ? void 0 : _a.click();
      }
    },
    [selectedFile]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "file_storage.dropzone",
        "aria-label": "Drop zone: drag and drop files here or click to browse",
        className: cn(
          "relative flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-8 py-10 transition-all",
          isDragging ? "border-amber-500 bg-amber-500/5" : "border-[#1a2235] hover:border-amber-500/50 hover:bg-white/[0.02]",
          selectedFile ? "cursor-default" : "cursor-pointer"
        ),
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onClick: handleZoneClick,
        onKeyDown: handleZoneKeyDown,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              className: "sr-only",
              onChange: handleInputChange,
              tabIndex: -1
            }
          ),
          isUploading && uploadProgress !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-[#0a0e1a]/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mb-3 h-6 w-6 animate-spin text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 font-mono text-xs uppercase tracking-widest text-amber-500", children: "Uploading…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: uploadProgress, className: "h-1.5 bg-[#1a2235]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 font-mono text-[10px] text-slate-500", children: [
              uploadProgress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "flex flex-col items-center gap-3 transition-opacity",
                isUploading && "opacity-0"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "rounded-sm border p-3 transition-colors",
                      isDragging ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-[#1a2235] bg-[#0f1626] text-slate-500"
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-6 w-6" })
                  }
                ),
                selectedFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-white", children: selectedFile.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-slate-500", children: formatFileSize(selectedFile.size) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Remove selected file",
                      className: "ml-2 rounded-sm p-1 text-slate-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400",
                      onClick: (e) => {
                        e.stopPropagation();
                        onClear();
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm uppercase tracking-widest text-slate-300", children: "Drag & drop files here" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs text-slate-600", children: "or click to browse" })
                ] }) })
              ]
            }
          )
        ]
      }
    ),
    selectedFile && !isUploading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        "data-ocid": "file_storage.upload_button",
        disabled: !selectedFile || !storageReady || !vaultReady || isUploading,
        onClick: onUpload,
        className: "gap-2 font-mono text-xs uppercase tracking-wider",
        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
          "Confirm Upload"
        ]
      }
    ) })
  ] });
}
function FileTable({
  files,
  currentPrincipal,
  isS2Admin,
  onDelete
}) {
  if (files.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "file_storage.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, {}),
        message: "No files uploaded yet",
        className: "py-20"
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "file_storage.file_list.table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid items-center gap-4 border-b px-6 py-2.5",
        style: {
          borderColor: "#1a2235",
          gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem"
        },
        children: ["", "Name", "Size", "Date", "Uploaded By", "", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600",
            children: h
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", style: { borderColor: "#1a2235" }, children: files.map((file, idx) => {
      const isOwner = file.uploadedBy === currentPrincipal;
      const canDelete = isOwner || isS2Admin;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `file_storage.file.item.${idx + 1}`,
          className: "grid items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]",
          style: {
            gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: getMimeIcon(file.mimeType) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate font-mono text-xs text-white", children: file.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-400", children: formatFileSize(file.size) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-400", children: formatDate(file.uploadedAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-[10px] text-slate-400", children: file.uploaderName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                "data-ocid": `file_storage.file.download_button.${idx + 1}`,
                className: "h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-amber-400",
                onClick: () => {
                  window.open(file.blobUrl, "_blank", "noopener,noreferrer");
                },
                title: "Download file",
                disabled: !file.blobUrl,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Get" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: canDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                "data-ocid": `file_storage.file.delete_button.${idx + 1}`,
                className: "h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-red-400",
                onClick: () => onDelete(file),
                title: "Delete file",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delete" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7" }) })
          ]
        },
        file.id
      );
    }) })
  ] });
}
function FileStoragePage() {
  const { actor, isFetching } = useExtActor();
  const { profile, isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null
  );
  const [files, setFiles] = reactExports.useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = reactExports.useState(true);
  const [vaultFolderId, setVaultFolderId] = reactExports.useState(null);
  const [vaultReady, setVaultReady] = reactExports.useState(false);
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [uploadProgress, setUploadProgress] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const initializingRef = reactExports.useRef(false);
  const isCreatingVaultRef = reactExports.useRef(false);
  const currentPrincipal = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "";
  const uploaderName = profile ? `${profile.rank} ${profile.name}`.trim() : "Unknown";
  const initializeVaultAndLoadFiles = reactExports.useCallback(async () => {
    if (!actor || isFetching || initializingRef.current) return;
    initializingRef.current = true;
    setIsLoadingInitial(true);
    try {
      const allFolders = await actor.getAllFolders();
      let vaultFolder = allFolders.find(
        (f) => f.name === VAULT_FOLDER_NAME
      );
      if (!vaultFolder) {
        if (isCreatingVaultRef.current) return;
        isCreatingVaultRef.current = true;
        try {
          const allSections = await actor.getSections();
          let vaultSection = allSections.find(
            (s) => s.name === VAULT_SECTION_NAME
          );
          if (!vaultSection) {
            const callerPrincipal2 = identity == null ? void 0 : identity.getPrincipal();
            if (!callerPrincipal2) throw new Error("No identity available");
            const newSectionId = await actor.createSection({
              id: "",
              name: VAULT_SECTION_NAME,
              description: "Internal file vault section",
              createdBy: callerPrincipal2,
              createdAt: BigInt(Date.now()),
              iconName: "HardDrive",
              parentSectionId: void 0
            });
            const sections = await actor.getSections();
            vaultSection = sections.find(
              (s) => s.id === newSectionId || s.name === VAULT_SECTION_NAME
            );
            if (!vaultSection)
              throw new Error("Failed to create vault section");
          }
          const callerPrincipal = identity == null ? void 0 : identity.getPrincipal();
          if (!callerPrincipal) throw new Error("No identity available");
          const newFolderId = await actor.createFolder({
            id: "",
            sectionId: vaultSection.id,
            name: VAULT_FOLDER_NAME,
            description: "Secure file vault",
            isPersonal: false,
            assignedUserId: void 0,
            requiredClearanceLevel: 0n,
            createdBy: callerPrincipal,
            createdAt: BigInt(Date.now())
          });
          const refreshedFolders = await actor.getAllFolders();
          vaultFolder = refreshedFolders.find(
            (f) => f.id === newFolderId || f.name === VAULT_FOLDER_NAME
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
      const [docs, profiles] = await Promise.all([
        actor.getDocumentsByFolder(folderId),
        actor.getAllProfiles()
      ]);
      const records = await Promise.all(
        docs.map(async (doc) => {
          const principalStr = doc.uploadedBy.toString();
          const uploaderDisplayName = resolveUploaderName(
            profiles,
            principalStr
          );
          const uploadedAtMs = normalizeTimestamp(doc.uploadedAt);
          let blobUrl = "";
          if (doc.blobStorageKey && storageClient) {
            try {
              blobUrl = await storageClient.getDirectURL(doc.blobStorageKey);
            } catch {
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
            blobHash: doc.blobStorageKey ?? ""
          };
        })
      );
      records.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setFiles(records);
      setVaultReady(true);
    } catch (err) {
      console.error("Vault initialization failed:", err);
      ue.error(
        "Failed to initialize file vault. Some features may be unavailable."
      );
      setVaultReady(false);
    } finally {
      setIsLoadingInitial(false);
      initializingRef.current = false;
    }
  }, [actor, isFetching, identity, storageClient]);
  reactExports.useEffect(() => {
    if (actor && !isFetching) {
      void initializeVaultAndLoadFiles();
    }
  }, [actor, isFetching, initializeVaultAndLoadFiles]);
  reactExports.useEffect(() => {
    if (storageClient && storageReady && actor && !isFetching && !vaultReady && !isLoadingInitial) {
      void initializeVaultAndLoadFiles();
    }
  }, [
    storageClient,
    storageReady,
    actor,
    isFetching,
    vaultReady,
    isLoadingInitial,
    initializeVaultAndLoadFiles
  ]);
  const handleUpload = reactExports.useCallback(async () => {
    if (!selectedFile || !storageClient) {
      ue.error("Storage not ready. Please try again.");
      return;
    }
    if (!actor || !vaultFolderId) {
      ue.error("File vault not ready. Please try again.");
      return;
    }
    const callerPrincipal = identity == null ? void 0 : identity.getPrincipal();
    if (!callerPrincipal) {
      ue.error("Not authenticated.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });
      const docPayload = {
        id: "",
        folderId: vaultFolderId,
        name: selectedFile.name,
        description: "",
        uploadedBy: callerPrincipal,
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(selectedFile.size),
        mimeType: selectedFile.type || "application/octet-stream",
        blobStorageKey: hash,
        classificationLevel: 0n,
        documentStatus: "Active",
        sha256Hash: "",
        downloadCount: 0n,
        orgId: "",
        version: 1n
      };
      const docId = await actor.createDocument(docPayload);
      let blobUrl = "";
      try {
        blobUrl = await storageClient.getDirectURL(hash);
      } catch {
      }
      const newRecord = {
        id: docId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type || "application/octet-stream",
        uploadedBy: currentPrincipal,
        uploaderName,
        uploadedAt: Date.now(),
        blobUrl,
        blobHash: hash
      };
      setFiles((prev) => [newRecord, ...prev]);
      setSelectedFile(null);
      setUploadProgress(null);
      ue.success(`"${selectedFile.name}" uploaded successfully`);
    } catch (err) {
      console.error("Upload failed:", err);
      ue.error("Upload failed. Please try again.");
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
    uploaderName
  ]);
  const handleDeleteConfirm = reactExports.useCallback(async () => {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      await actor.deleteDocument(deleteTarget.id);
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      ue.success("File deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      ue.error("Failed to delete file. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, actor]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "file_storage.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "nav",
          {
            className: "border-b px-6 py-2.5",
            style: { borderColor: "#1a2235", backgroundColor: "#0a0e1a" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                BreadcrumbLink,
                {
                  href: "/",
                  className: "font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300",
                  children: "Hub"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, { className: "text-slate-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "File Storage" }) })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfirmDialog,
          {
            isOpen: !!deleteTarget,
            onOpenChange: (v) => {
              if (!v) setDeleteTarget(null);
            },
            title: "Delete this file?",
            description: "This cannot be undone.",
            confirmLabel: isDeleting ? "Deleting…" : "Delete",
            cancelLabel: "Cancel",
            onConfirm: () => void handleDeleteConfirm(),
            onCancel: () => setDeleteTarget(null)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex flex-1 flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex shrink-0 items-center justify-between border-b px-6 py-4",
              style: { borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-5 w-5 text-amber-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "File Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "Secure file vault" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          storageReady ? "bg-green-500" : "bg-slate-600"
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: storageReady ? "Storage Ready" : "Initializing…" })
                  ] }),
                  !isLoadingInitial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          vaultReady ? "bg-green-500" : "bg-red-500/50"
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: vaultReady ? "Vault Synced" : "Vault Error" })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-6 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-4 w-4 text-amber-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs uppercase tracking-[0.2em] text-amber-500", children: "Secure File Vault" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-1 border-t",
                  style: { borderColor: "#1a2235" }
                }
              ),
              !isLoadingInitial && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: [
                files.length,
                " ",
                files.length === 1 ? "file" : "files"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-sm border p-5",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600", children: "Upload File" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DropZone,
                    {
                      onFileSelected: setSelectedFile,
                      selectedFile,
                      onClear: () => setSelectedFile(null),
                      uploadProgress,
                      isUploading,
                      onUpload: () => void handleUpload(),
                      storageReady,
                      vaultReady
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-sm border overflow-hidden",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex items-center gap-3 border-b px-6 py-3",
                      style: { borderColor: "#1a2235" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600", children: "Uploaded Files" })
                    }
                  ),
                  isLoadingInitial ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileListSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FileTable,
                    {
                      files,
                      currentPrincipal,
                      isS2Admin,
                      onDelete: setDeleteTarget
                    }
                  )
                ]
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "shrink-0 border-t px-6 py-4",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center font-mono text-[9px] uppercase tracking-widest text-slate-700", children: [
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
                  className: "text-slate-600 transition-colors hover:text-slate-500",
                  children: "Built with ♥ using caffeine.ai"
                }
              )
            ] })
          }
        )
      ]
    }
  );
}
export {
  FileStoragePage as default
};
