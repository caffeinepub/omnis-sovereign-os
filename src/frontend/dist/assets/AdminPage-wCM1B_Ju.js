import { f as createLucideIcon, h as usePermissions, c as useExtActor, a as useInternetIdentity, b as useNavigate, r as reactExports, a3 as useQuery, j as jsxRuntimeExports, l as Shield, B as Button, S as Search, i as Users, a5 as TriangleAlert, a8 as UserRole, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, w as DialogFooter, p as ue } from "./index-CnBkd1vF.js";
import { u as useMutation, T as TopNav, d as Skeleton, a as Textarea } from "./TopNav-D92LzMme.js";
import { C as ChainOfTrustPanel } from "./ChainOfTrustPanel-CiEF_9j1.js";
import { I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, L as Label, p as parseDisplayName, R as RankSelector, f as formatDisplayName } from "./displayName-B5NkxsrN.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-DKCCDcWa.js";
import { T as Table, d as TableHeader, b as TableRow, e as TableHead, a as TableBody, c as TableCell } from "./table-CGHcNlzb.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BAv1gao8.js";
import { C as CLEARANCE_LABELS, B as BRANCH_RANK_CATEGORIES } from "./constants-O6cGduIW.js";
import { p as usePendingUsers, q as useDeniedUsers, r as useRoleApprovalRequests } from "./useQueries-D_eZX6qU.js";
import { C as CircleCheck } from "./circle-check-Cu-sw5JM.js";
import { C as CircleX } from "./circle-x-a2HMQNJ7.js";
import { S as ShieldCheck } from "./shield-check-D4WrqZ7-.js";
import "./check-C4XqBZ-7.js";
import "./shield-off-Bb7Fec01.js";
import "./copy-DkMHxMDD.js";
import "./chevron-right-B23VjFYD.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
function inferBranchCategory(rank) {
  if (!rank) return { branch: "", category: "" };
  for (const [b, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [cat, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) return { branch: b, category: cat };
    }
  }
  return { branch: "", category: "" };
}
function DenyDialog({
  open,
  profile,
  onConfirm,
  onCancel,
  isPending
}) {
  const [reason, setReason] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!open) setReason("");
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        if (!v) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          "data-ocid": "admin.deny.dialog",
          style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
          className: "border font-mono",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Deny Access Request" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-slate-400", children: [
                "Denying access for:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: (profile == null ? void 0 : profile.name) || "Unknown" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Reason (required)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    "data-ocid": "admin.deny.reason.textarea",
                    value: reason,
                    onChange: (e) => setReason(e.target.value),
                    placeholder: "Enter reason for denial...",
                    className: "border font-mono text-xs text-white",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    rows: 3
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "admin.deny.cancel_button",
                  className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  onClick: onCancel,
                  disabled: isPending,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  "data-ocid": "admin.deny.confirm_button",
                  className: "font-mono text-xs uppercase tracking-wider",
                  style: { backgroundColor: "#ef4444", color: "#fff" },
                  onClick: () => onConfirm(reason),
                  disabled: isPending || !reason.trim(),
                  children: isPending ? "Denying…" : "Confirm Deny"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function EditProfileDialog({
  open,
  profile,
  onSave,
  onCancel,
  isPending
}) {
  const [lastName, setLastName] = reactExports.useState("");
  const [firstName, setFirstName] = reactExports.useState("");
  const [mi, setMi] = reactExports.useState("");
  const [branch, setBranch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [rankVal, setRankVal] = reactExports.useState("");
  const [orgRole, setOrgRole] = reactExports.useState("");
  const [clearanceLevel, setClearanceLevel] = reactExports.useState("0");
  const [isVerified, setIsVerified] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
    const effectiveRank = rankVal.trim() || ((profile == null ? void 0 : profile.rank) ?? "");
    const name = formatDisplayName(effectiveRank, lastName, firstName, mi);
    onSave({
      name,
      rank: effectiveRank,
      orgRole: orgRole.trim(),
      clearanceLevel: BigInt(Number(clearanceLevel)),
      isValidatedByCommander: isVerified
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        if (!v) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          "data-ocid": "admin.edit_profile.dialog",
          style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
          className: "max-h-[90vh] overflow-y-auto border font-mono",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Edit Profile" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Last" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: lastName,
                      onChange: (e) => setLastName(e.target.value),
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "First" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: firstName,
                      onChange: (e) => setFirstName(e.target.value),
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "MI" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: mi,
                      onChange: (e) => setMi(e.target.value.slice(0, 1)),
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                      maxLength: 1
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RankSelector,
                {
                  branch,
                  category,
                  rank: rankVal,
                  onBranchChange: setBranch,
                  onCategoryChange: setCategory,
                  onRankChange: setRankVal,
                  variant: "modal"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Organizational Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: orgRole,
                    onChange: (e) => setOrgRole(e.target.value),
                    className: "border font-mono text-xs text-white",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Clearance Level" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: clearanceLevel, onValueChange: setClearanceLevel, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectContent,
                    {
                      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                      children: Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        SelectItem,
                        {
                          value: lvl,
                          className: "font-mono text-xs",
                          children: [
                            "Level ",
                            lvl,
                            " — ",
                            label
                          ]
                        },
                        lvl
                      ))
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "S2 Verified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "admin.edit_profile.verified.toggle",
                    onClick: () => setIsVerified((v) => !v),
                    className: "flex h-5 w-9 items-center rounded-full transition-colors",
                    style: {
                      backgroundColor: isVerified ? "#f59e0b" : "#1a2235",
                      border: "1px solid #2a3347"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "h-4 w-4 rounded-full bg-white shadow transition-transform",
                        style: {
                          transform: isVerified ? "translateX(18px)" : "translateX(2px)"
                        }
                      }
                    )
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "admin.edit_profile.cancel_button",
                  className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  onClick: onCancel,
                  disabled: isPending,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  "data-ocid": "admin.edit_profile.save_button",
                  className: "font-mono text-xs uppercase tracking-wider",
                  style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                  onClick: handleSave,
                  disabled: isPending,
                  children: isPending ? "Saving…" : "Save"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function AdminPage() {
  var _a, _b;
  const { isS2Admin, isLoading: permLoading } = usePermissions();
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  reactExports.useEffect(() => {
    if (!permLoading && !isS2Admin) {
      void navigate({ to: "/" });
    }
  }, [isS2Admin, permLoading, navigate]);
  const [searchRaw, setSearchRaw] = reactExports.useState("");
  const searchQuery = reactExports.useDeferredValue(searchRaw);
  const [denyTarget, setDenyTarget] = reactExports.useState(null);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [promoteTarget, setPromoteTarget] = reactExports.useState(
    null
  );
  const [showPromoteDialog, setShowPromoteDialog] = reactExports.useState(false);
  const [handoffTarget, setHandoffTarget] = reactExports.useState(
    null
  );
  const [showHandoffDialog, setShowHandoffDialog] = reactExports.useState(false);
  const [showHandoffStubDialog, setShowHandoffStubDialog] = reactExports.useState(false);
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    refetch: refetchProfiles
  } = useQuery({
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
    staleTime: 0
  });
  const { data: pendingProfiles = [], refetch: refetchPending } = usePendingUsers();
  const { data: _deniedProfiles = [] } = useDeniedUsers();
  const { data: roleRequests = [], refetch: refetchRoleRequests } = useRoleApprovalRequests();
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.orgRole.toLowerCase().includes(q);
  });
  const approveMutation = useMutation({
    mutationFn: async (profile) => {
      if (!actor) return;
      await actor.updateRegistrationStatus(profile.principalId, "Approved", "");
    },
    onSuccess: () => {
      ue.success("User approved");
      void refetchProfiles();
      void refetchPending();
    },
    onError: () => ue.error("Failed to approve user")
  });
  const denyMutation = useMutation({
    mutationFn: async ({
      profile,
      reason
    }) => {
      if (!actor) return;
      await actor.updateRegistrationStatus(
        profile.principalId,
        "Denied",
        reason
      );
    },
    onSuccess: () => {
      ue.success("Access denied");
      setDenyTarget(null);
      void refetchProfiles();
      void refetchPending();
    },
    onError: () => ue.error("Failed to deny access")
  });
  const editMutation = useMutation({
    mutationFn: async ({
      profile,
      updates
    }) => {
      if (!actor) return;
      await actor.updateUserProfile({ ...profile, ...updates });
    },
    onSuccess: () => {
      ue.success("Profile updated");
      setEditTarget(null);
      void refetchProfiles();
    },
    onError: () => ue.error("Failed to update profile")
  });
  const roleMutation = useMutation({
    mutationFn: async ({
      profile,
      role
    }) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, role);
    },
    onSuccess: () => {
      ue.success("Role updated");
      void refetchProfiles();
    },
    onError: () => ue.error("Failed to update role")
  });
  const promoteMutation = useMutation({
    mutationFn: async (profile) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, UserRole.admin);
      await actor.updateUserProfile({
        ...profile,
        isS2Admin: true,
        clearanceLevel: 4n
      });
    },
    onSuccess: () => {
      ue.success("S2 Admin role granted");
      setShowPromoteDialog(false);
      setPromoteTarget(null);
      void refetchProfiles();
    },
    onError: () => ue.error("Failed to grant S2 Admin role")
  });
  const handoffMutation = useMutation({
    mutationFn: async (profile) => {
      if (!actor || !identity) return;
      await actor.createAnomalyEvent({
        id: crypto.randomUUID(),
        resolved: false,
        detectedAt: BigInt(Date.now()),
        description: `Commander handoff initiated to ${profile.name}. Requires co-sign from current S2. (Frontend-initiated — full enforcement pending backend update.)`,
        isSystemGenerated: false,
        severity: "medium",
        eventType: "role_transition",
        affectedUserId: profile.principalId,
        affectedFolderId: void 0,
        resolvedBy: void 0
      });
    },
    onSuccess: () => {
      ue.success("Commander handoff logged", {
        description: "Requires S2 co-sign. Full enforcement in future update."
      });
      setShowHandoffStubDialog(false);
      setHandoffTarget(null);
    },
    onError: () => ue.error("Failed to log handoff request")
  });
  const approveRoleRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveRoleRequest(requestId);
    },
    onSuccess: () => {
      ue.success("Role request approved");
      void refetchRoleRequests();
    },
    onError: () => ue.error("Failed to approve role request")
  });
  const denyRoleRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      notes
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.denyRoleRequest(requestId, notes);
    },
    onSuccess: () => {
      ue.success("Role request denied");
      void refetchRoleRequests();
    },
    onError: () => ue.error("Failed to deny role request")
  });
  if (permLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex min-h-screen flex-col",
        style: { backgroundColor: "#0a0e1a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground", children: "Loading..." }) })
        ]
      }
    );
  }
  if (!isS2Admin) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "admin.page",
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Admin Panel" }) })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Admin Panel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "S2 Security Administration — Restricted Access" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "pending", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsList,
              {
                className: "mb-6 border",
                style: { backgroundColor: "#0d1525", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      "data-ocid": "admin.pending.tab",
                      value: "pending",
                      className: "relative font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: [
                        "Pending Queue",
                        pendingProfiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            children: pendingProfiles.length
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsTrigger,
                    {
                      "data-ocid": "admin.users.tab",
                      value: "users",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: "User Management"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsTrigger,
                    {
                      "data-ocid": "admin.roles.tab",
                      value: "roles",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: "Role Assignments"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsTrigger,
                    {
                      "data-ocid": "admin.trust.tab",
                      value: "trust",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: "Chain of Trust"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      "data-ocid": "admin.role_requests.tab",
                      value: "role-requests",
                      className: "relative font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: [
                        "Role Requests",
                        roleRequests.filter((r) => r.status === "pending").length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            children: roleRequests.filter((r) => r.status === "pending").length
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pending", children: profilesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                "data-ocid": "admin.pending.loading_state",
                className: "space-y-2",
                children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Skeleton,
                  {
                    className: "h-14 w-full rounded",
                    style: { backgroundColor: "#1a2235" }
                  },
                  i
                ))
              }
            ) : pendingProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "admin.pending.empty_state",
                className: "flex flex-col items-center gap-3 py-16",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-8 w-8 text-slate-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No pending users" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "overflow-hidden rounded border",
                style: { borderColor: "#1a2235" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      style: {
                        borderColor: "#1a2235",
                        backgroundColor: "#0d1525"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Name" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Rank" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Email" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Actions" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: pendingProfiles.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      "data-ocid": `admin.pending.item.${idx + 1}`,
                      style: { borderColor: "#1a2235" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-white", children: p.name || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-slate-400", children: p.rank || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-slate-400", children: p.email || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Button,
                            {
                              size: "sm",
                              "data-ocid": `admin.approve_button.${idx + 1}`,
                              className: "h-7 gap-1 font-mono text-[10px] uppercase tracking-wider",
                              style: {
                                backgroundColor: "#16a34a",
                                color: "#fff"
                              },
                              onClick: () => void approveMutation.mutate(p),
                              disabled: approveMutation.isPending,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                                "Approve"
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Button,
                            {
                              size: "sm",
                              variant: "outline",
                              "data-ocid": `admin.deny_button.${idx + 1}`,
                              className: "h-7 gap-1 border font-mono text-[10px] uppercase tracking-wider text-red-400",
                              style: {
                                backgroundColor: "transparent",
                                borderColor: "rgba(239,68,68,0.3)"
                              },
                              onClick: () => setDenyTarget(p),
                              disabled: denyMutation.isPending,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                                "Deny"
                              ]
                            }
                          )
                        ] }) })
                      ]
                    },
                    p.principalId.toString()
                  )) })
                ] })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "users", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "mb-4 flex items-center gap-2 rounded border px-3 py-2",
                  style: { borderColor: "#1a2235", backgroundColor: "#0d1525" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 shrink-0 text-slate-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.search.input",
                        value: searchRaw,
                        onChange: (e) => setSearchRaw(e.target.value),
                        placeholder: "Search by name, rank, email...",
                        className: "border-0 bg-transparent font-mono text-xs text-white placeholder:text-slate-600 focus-visible:ring-0"
                      }
                    )
                  ]
                }
              ),
              profilesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-ocid": "admin.users.loading_state",
                  className: "space-y-2",
                  children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Skeleton,
                    {
                      className: "h-14 w-full rounded",
                      style: { backgroundColor: "#1a2235" }
                    },
                    i
                  ))
                }
              ) : filteredProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "admin.users.empty_state",
                  className: "flex flex-col items-center gap-3 py-16",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-slate-700" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No users found" })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "overflow-hidden rounded border",
                  style: { borderColor: "#1a2235" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      TableRow,
                      {
                        style: {
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Name" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Rank" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Clearance" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Status" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Actions" })
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredProfiles.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      TableRow,
                      {
                        "data-ocid": `admin.users.item.${idx + 1}`,
                        style: { borderColor: "#1a2235" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-white", children: p.name || "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-slate-400", children: p.rank || "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs text-amber-500", children: [
                            "L",
                            Number(p.clearanceLevel),
                            " ",
                            CLEARANCE_LABELS[Number(p.clearanceLevel)] ? `— ${CLEARANCE_LABELS[Number(p.clearanceLevel)]}` : ""
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.isValidatedByCommander ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-green-400", children: "Verified" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-600", children: "Pending" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "sm",
                              variant: "outline",
                              "data-ocid": `admin.users.edit_button.${idx + 1}`,
                              className: "h-7 border font-mono text-[10px] uppercase tracking-wider text-slate-400",
                              style: {
                                backgroundColor: "transparent",
                                borderColor: "#2a3347"
                              },
                              onClick: () => setEditTarget(p),
                              children: "Edit"
                            }
                          ) })
                        ]
                      },
                      p.principalId.toString()
                    )) })
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "trust", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChainOfTrustPanel, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-px w-full",
                  style: { backgroundColor: "#1a2235" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ShieldCheck,
                    {
                      className: "h-4 w-4",
                      style: { color: "#f59e0b" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-xs font-bold uppercase tracking-widest text-white", children: "Role Transitions" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded border p-4 space-y-3",
                      style: {
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            UserPlus,
                            {
                              className: "h-4 w-4",
                              style: { color: "#f59e0b" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400", children: "Promote to S2 Admin" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-500", children: "Grant S2 Admin rights to a verified user. Requires commander approval (frontend-enforced)." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Select,
                          {
                            value: ((_a = promoteTarget == null ? void 0 : promoteTarget.principalId) == null ? void 0 : _a.toString()) ?? "",
                            onValueChange: (val) => {
                              const p = profiles.find(
                                (x) => x.principalId.toString() === val
                              );
                              setPromoteTarget(p ?? null);
                            },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectTrigger,
                                {
                                  "data-ocid": "admin.trust.promote.select",
                                  className: "border font-mono text-xs text-white",
                                  style: {
                                    backgroundColor: "#1a2235",
                                    borderColor: "#2a3347"
                                  },
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select user…" })
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectContent,
                                {
                                  style: {
                                    backgroundColor: "#0f1626",
                                    borderColor: "#1a2235"
                                  },
                                  children: profiles.filter(
                                    (p) => p.isValidatedByCommander && !p.isS2Admin
                                  ).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    SelectItem,
                                    {
                                      value: p.principalId.toString(),
                                      className: "font-mono text-xs",
                                      children: p.name || p.rank || "Unknown"
                                    },
                                    p.principalId.toString()
                                  ))
                                }
                              )
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "button",
                            size: "sm",
                            "data-ocid": "admin.trust.promote.primary_button",
                            disabled: !promoteTarget || promoteMutation.isPending,
                            onClick: () => setShowPromoteDialog(true),
                            className: "w-full font-mono text-[10px] uppercase tracking-wider",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            children: "Promote to S2 Admin"
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded border p-4 space-y-3",
                      style: {
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Shield,
                            {
                              className: "h-4 w-4",
                              style: { color: "#60a5fa" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-mono text-[10px] font-bold uppercase tracking-widest text-blue-400", children: "Commander Handoff" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-500", children: "Initiate transfer of the Commander role to a designated successor. Requires S2 co-sign." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Select,
                          {
                            value: ((_b = handoffTarget == null ? void 0 : handoffTarget.principalId) == null ? void 0 : _b.toString()) ?? "",
                            onValueChange: (val) => {
                              const p = profiles.find(
                                (x) => x.principalId.toString() === val
                              );
                              setHandoffTarget(p ?? null);
                            },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectTrigger,
                                {
                                  "data-ocid": "admin.trust.handoff.select",
                                  className: "border font-mono text-xs text-white",
                                  style: {
                                    backgroundColor: "#1a2235",
                                    borderColor: "#2a3347"
                                  },
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select successor…" })
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectContent,
                                {
                                  style: {
                                    backgroundColor: "#0f1626",
                                    borderColor: "#1a2235"
                                  },
                                  children: profiles.filter((p) => p.isValidatedByCommander).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    SelectItem,
                                    {
                                      value: p.principalId.toString(),
                                      className: "font-mono text-xs",
                                      children: p.name || p.rank || "Unknown"
                                    },
                                    p.principalId.toString()
                                  ))
                                }
                              )
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "button",
                            size: "sm",
                            "data-ocid": "admin.trust.handoff.secondary_button",
                            disabled: !handoffTarget,
                            onClick: () => setShowHandoffDialog(true),
                            className: "w-full border font-mono text-[10px] uppercase tracking-wider text-blue-400",
                            style: {
                              backgroundColor: "transparent",
                              borderColor: "rgba(96,165,250,0.3)"
                            },
                            children: "Initiate Handoff"
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "roles", children: profilesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                "data-ocid": "admin.roles.loading_state",
                className: "space-y-2",
                children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Skeleton,
                  {
                    className: "h-14 w-full rounded",
                    style: { backgroundColor: "#1a2235" }
                  },
                  i
                ))
              }
            ) : profiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "admin.roles.empty_state",
                className: "flex flex-col items-center gap-3 py-16",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-slate-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No profiles found" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "overflow-hidden rounded border",
                style: { borderColor: "#1a2235" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      style: {
                        borderColor: "#1a2235",
                        backgroundColor: "#0d1525"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Name" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Rank" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Role" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: profiles.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      "data-ocid": `admin.roles.item.${idx + 1}`,
                      style: { borderColor: "#1a2235" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-white", children: p.name || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-slate-400", children: p.rank || "—" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Select,
                          {
                            defaultValue: p.isS2Admin ? UserRole.admin : UserRole.user,
                            onValueChange: (val) => void roleMutation.mutate({
                              profile: p,
                              role: val
                            }),
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectTrigger,
                                {
                                  "data-ocid": `admin.roles.item.${idx + 1}.select`,
                                  className: "h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-white",
                                  style: {
                                    backgroundColor: "#1a2235",
                                    borderColor: "#2a3347"
                                  },
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectContent,
                                {
                                  style: {
                                    backgroundColor: "#0f1626",
                                    borderColor: "#1a2235"
                                  },
                                  children: Object.values(UserRole).map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    SelectItem,
                                    {
                                      value: role,
                                      className: "font-mono text-xs uppercase",
                                      children: role
                                    },
                                    role
                                  ))
                                }
                              )
                            ]
                          }
                        ) })
                      ]
                    },
                    p.principalId.toString()
                  )) })
                ] })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "role-requests", children: roleRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "admin.role_requests.empty_state",
                className: "flex flex-col items-center gap-3 py-16",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 text-slate-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No pending role requests" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: roleRequests.map((req, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `admin.role_requests.item.${idx + 1}`,
                className: "flex items-center justify-between gap-4 rounded border px-4 py-3",
                style: {
                  backgroundColor: "#0f1626",
                  borderColor: "#1a2235"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-semibold text-white", children: req.requestId }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: [
                      "Role: ",
                      req.requestedRole,
                      " · Status:",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          style: {
                            color: req.status === "pending" ? "#f59e0b" : req.status === "approved" ? "#22c55e" : "#ef4444"
                          },
                          children: req.status
                        }
                      )
                    ] })
                  ] }),
                  req.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        "data-ocid": `admin.role_requests.approve_button.${idx + 1}`,
                        className: "h-7 font-mono text-[10px] uppercase tracking-wider",
                        style: {
                          backgroundColor: "#22c55e",
                          color: "#0a0e1a"
                        },
                        onClick: () => void approveRoleRequestMutation.mutate(
                          req.requestId
                        ),
                        disabled: approveRoleRequestMutation.isPending,
                        children: "Approve"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        "data-ocid": `admin.role_requests.deny_button.${idx + 1}`,
                        className: "h-7 border font-mono text-[10px] uppercase tracking-wider text-red-400",
                        style: {
                          borderColor: "#2a3347",
                          backgroundColor: "transparent"
                        },
                        onClick: () => void denyRoleRequestMutation.mutate({
                          requestId: req.requestId,
                          notes: "Denied by S2 admin"
                        }),
                        disabled: denyRoleRequestMutation.isPending,
                        children: "Deny"
                      }
                    )
                  ] })
                ]
              },
              req.requestId
            )) }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DenyDialog,
          {
            open: !!denyTarget,
            profile: denyTarget,
            onConfirm: (reason) => {
              if (denyTarget)
                void denyMutation.mutate({ profile: denyTarget, reason });
            },
            onCancel: () => setDenyTarget(null),
            isPending: denyMutation.isPending
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dialog,
          {
            open: showPromoteDialog,
            onOpenChange: (v) => {
              if (!v) setShowPromoteDialog(false);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DialogContent,
              {
                "data-ocid": "admin.trust.promote.dialog",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                className: "border font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Grant S2 Admin Rights" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
                    "Are you sure you want to grant S2 Admin rights to",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: (promoteTarget == null ? void 0 : promoteTarget.name) ?? "this user" }),
                    "? This requires commander approval. All actions will be logged."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        "data-ocid": "admin.trust.promote.cancel_button",
                        className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                        onClick: () => setShowPromoteDialog(false),
                        disabled: promoteMutation.isPending,
                        children: "Cancel"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        "data-ocid": "admin.trust.promote.confirm_button",
                        className: "font-mono text-xs uppercase tracking-wider",
                        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                        onClick: () => {
                          if (promoteTarget) void promoteMutation.mutate(promoteTarget);
                        },
                        disabled: promoteMutation.isPending || !promoteTarget,
                        children: promoteMutation.isPending ? "Granting…" : "Confirm Grant"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dialog,
          {
            open: showHandoffDialog,
            onOpenChange: (v) => {
              if (!v) setShowHandoffDialog(false);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DialogContent,
              {
                "data-ocid": "admin.trust.handoff.dialog",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                className: "border font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Initiate Commander Handoff" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "rounded border px-3 py-2",
                        style: {
                          backgroundColor: "rgba(96,165,250,0.06)",
                          borderColor: "rgba(96,165,250,0.2)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-blue-300/80", children: "Commander handoff requires co-sign from the current S2. This feature will be fully enforced in a future backend update. The handoff request will be logged as an audit event." })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-slate-400", children: [
                      "Initiating handoff to:",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: (handoffTarget == null ? void 0 : handoffTarget.name) ?? "selected user" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        "data-ocid": "admin.trust.handoff.cancel_button",
                        className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                        onClick: () => setShowHandoffDialog(false),
                        children: "Cancel"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        "data-ocid": "admin.trust.handoff.confirm_button",
                        className: "font-mono text-xs uppercase tracking-wider",
                        style: {
                          backgroundColor: "rgba(96,165,250,0.15)",
                          color: "#93c5fd",
                          border: "1px solid rgba(96,165,250,0.3)"
                        },
                        onClick: () => {
                          setShowHandoffDialog(false);
                          setShowHandoffStubDialog(true);
                        },
                        children: "Proceed"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dialog,
          {
            open: showHandoffStubDialog,
            onOpenChange: (v) => {
              if (!v) setShowHandoffStubDialog(false);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DialogContent,
              {
                "data-ocid": "admin.trust.handoff_stub.dialog",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                className: "border font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Confirm Handoff Request" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
                    "This will log a Commander Handoff Request to the audit trail for",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: (handoffTarget == null ? void 0 : handoffTarget.name) ?? "this user" }),
                    ". Full transfer requires backend enforcement (future update)."
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        "data-ocid": "admin.trust.handoff_stub.cancel_button",
                        className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                        onClick: () => setShowHandoffStubDialog(false),
                        children: "Cancel"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        "data-ocid": "admin.trust.handoff_stub.confirm_button",
                        className: "font-mono text-xs uppercase tracking-wider",
                        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                        onClick: () => {
                          if (handoffTarget) void handoffMutation.mutate(handoffTarget);
                        },
                        disabled: handoffMutation.isPending,
                        children: handoffMutation.isPending ? "Logging…" : "Log Handoff Request"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditProfileDialog,
          {
            open: !!editTarget,
            profile: editTarget,
            onSave: (updates) => {
              if (editTarget)
                void editMutation.mutate({ profile: editTarget, updates });
            },
            onCancel: () => setEditTarget(null),
            isPending: editMutation.isPending
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "border-t px-6 py-4 text-center",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-700", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              ". Built with love using",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-slate-600 hover:text-slate-500",
                  children: "caffeine.ai"
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
  AdminPage as default
};
