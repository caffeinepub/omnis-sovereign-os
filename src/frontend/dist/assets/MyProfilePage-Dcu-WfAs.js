import { h as usePermissions, c as useExtActor, a as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, a6 as User, B as Button, q as Dialog, s as DialogContent, t as DialogHeader, v as DialogTitle, a4 as DialogDescription, w as DialogFooter, o as ue } from "./index-3JmW1yt2.js";
import { b as useStorageClient, g as getInitials, T as TopNav, S as ScrollArea, A as Avatar, h as AvatarImage, i as AvatarFallback, U as Upload, B as Badge, L as Lock } from "./TopNav-DiCFNdIt.js";
import { p as parseDisplayName, L as Label, I as Input, R as RankSelector, f as formatDisplayName } from "./displayName-C1ThBuVF.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-B9EiF7kq.js";
import { C as CLEARANCE_LABELS, B as BRANCH_RANK_CATEGORIES } from "./constants-O6cGduIW.js";
import { C as CircleCheck } from "./circle-check-hFnLiwoJ.js";
import "./chevron-down-DIFMpEfn.js";
import "./check-BjjR4Zqv.js";
import "./chevron-right-CDFR456G.js";
function inferBranchCategory(rank) {
  if (!rank) return { branch: "", category: "" };
  for (const [b, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [cat, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) return { branch: b, category: cat };
    }
  }
  return { branch: "", category: "" };
}
function MyProfilePage() {
  var _a;
  const {
    profile,
    isS2Admin,
    isValidatedByCommander,
    refreshProfile,
    isLoading
  } = usePermissions();
  const { actor } = useExtActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null
  );
  const fileInputRef = reactExports.useRef(null);
  const [lastName, setLastName] = reactExports.useState("");
  const [firstName, setFirstName] = reactExports.useState("");
  const [mi, setMi] = reactExports.useState("");
  const [branch, setBranch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [rankVal, setRankVal] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [orgRole, setOrgRole] = reactExports.useState("");
  const [clearanceLevel, setClearanceLevel] = reactExports.useState(0);
  const [avatarUrl, setAvatarUrl] = reactExports.useState("");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = reactExports.useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
  async function handleAvatarUpload(e) {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file || !storageClient || !storageReady) {
      ue.error("Storage not ready. Please try again.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      ue.success("Photo uploaded");
    } catch {
      ue.error("Avatar upload failed");
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
      const formattedName2 = formatDisplayName(
        effectiveRank,
        lastName,
        firstName,
        mi
      );
      const updates = {
        ...profile,
        name: formattedName2,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: isS2Admin ? orgRole.trim() : profile.orgRole,
        clearanceLevel: isS2Admin ? BigInt(clearanceLevel) : profile.clearanceLevel,
        avatarUrl: avatarUrl || void 0
      };
      await actor.updateMyProfile(updates);
      await refreshProfile();
      ue.success("Profile updated");
    } catch {
      ue.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }
  const initials = (profile == null ? void 0 : profile.name) ? getInitials(profile.name) : "OP";
  const formattedName = ((_a = profile == null ? void 0 : profile.name) == null ? void 0 : _a.trim()) || "OPERATOR";
  const clearanceLabelMap = CLEARANCE_LABELS ?? {};
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "my_profile.loading_state",
        className: "flex min-h-screen flex-col",
        style: { backgroundColor: "#0a0e1a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground", children: "Loading profile..." }) })
        ]
      }
    );
  }
  if (!profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "my_profile.error_state",
        className: "flex min-h-screen flex-col",
        style: { backgroundColor: "#0a0e1a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-red-400", children: "Profile not found. Please complete registration." }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "my_profile.page",
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "My Profile" }) })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-8 sm:px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mb-8 flex flex-col items-center gap-4 rounded border p-8 sm:flex-row sm:items-start sm:gap-6",
              style: { borderColor: "#1a2235", backgroundColor: "#0d1525" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Avatar,
                    {
                      className: "h-24 w-24 border-2",
                      style: { borderColor: "rgba(245,158,11,0.3)" },
                      children: [
                        avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: avatarUrl, alt: formattedName }) : null,
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          AvatarFallback,
                          {
                            className: "font-mono text-2xl font-bold",
                            style: {
                              backgroundColor: "rgba(245,158,11,0.1)",
                              color: "#f59e0b"
                            },
                            children: initials
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      ref: fileInputRef,
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: (e) => void handleAvatarUpload(e)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "my_profile.avatar.upload_button",
                      className: "absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2",
                      style: {
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                        color: "#f59e0b"
                      },
                      onClick: () => {
                        var _a2;
                        return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                      },
                      disabled: isUploadingAvatar || !storageReady,
                      title: isUploadingAvatar ? "Uploading..." : "Upload photo",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center gap-2 sm:items-start", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.15em] text-white", children: formattedName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                    profile.rank && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                        style: {
                          backgroundColor: "rgba(245,158,11,0.1)",
                          borderColor: "rgba(245,158,11,0.3)",
                          color: "#f59e0b"
                        },
                        children: profile.rank
                      }
                    ),
                    isValidatedByCommander && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Badge,
                      {
                        className: "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                        style: {
                          backgroundColor: "rgba(34,197,94,0.08)",
                          borderColor: "rgba(34,197,94,0.25)",
                          color: "#4ade80"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-2.5 w-2.5" }),
                          "S2 Verified"
                        ]
                      }
                    ),
                    isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                        style: {
                          backgroundColor: "rgba(245,158,11,0.1)",
                          borderColor: "rgba(245,158,11,0.3)",
                          color: "#f59e0b"
                        },
                        children: "S2 Admin"
                      }
                    )
                  ] }),
                  profile.orgRole && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-slate-500", children: profile.orgRole })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "section",
              {
                className: "rounded border p-5",
                style: { borderColor: "#1a2235", backgroundColor: "#0d1525" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 text-slate-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Sensitive Fields" }),
                    !isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-700", children: "— managed by S2" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Clearance Level" }),
                        !isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-2.5 w-2.5 text-slate-700" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "rounded border px-3 py-2",
                          style: {
                            borderColor: "#1a2235",
                            backgroundColor: "#0a0e1a"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-amber-500", children: [
                            "Level ",
                            Number(profile.clearanceLevel),
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600", children: [
                              "—",
                              " ",
                              clearanceLabelMap[Number(profile.clearanceLevel)] ?? "Unknown"
                            ] })
                          ] })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Organizational Role" }),
                        !isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-2.5 w-2.5 text-slate-700" })
                      ] }),
                      isS2Admin ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          value: orgRole,
                          onChange: (e) => setOrgRole(e.target.value),
                          className: "border font-mono text-xs text-white",
                          style: {
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347"
                          }
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "rounded border px-3 py-2",
                          style: {
                            borderColor: "#1a2235",
                            backgroundColor: "#0a0e1a"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-slate-400", children: profile.orgRole || "—" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Verification Status" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex items-center gap-2 rounded border px-3 py-2",
                          style: {
                            borderColor: "#1a2235",
                            backgroundColor: "#0a0e1a"
                          },
                          children: isValidatedByCommander ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-green-400" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-green-400", children: "Verified by S2" })
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-slate-600" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-slate-600", children: "Pending S2 verification" })
                          ] })
                        }
                      )
                    ] })
                  ] }),
                  !isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      "data-ocid": "my_profile.request_correction.button",
                      className: "mt-4 w-full border font-mono text-[10px] uppercase tracking-wider text-slate-500",
                      style: {
                        backgroundColor: "transparent",
                        borderColor: "#1a2235"
                      },
                      onClick: () => setCorrectionDialogOpen(true),
                      children: "Request Correction"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "section",
              {
                className: "rounded border p-5",
                style: { borderColor: "#1a2235", backgroundColor: "#0d1525" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "My Information" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Last" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": "my_profile.name.last.input",
                              value: lastName,
                              onChange: (e) => setLastName(e.target.value),
                              className: "border font-mono text-xs text-white",
                              style: {
                                backgroundColor: "#1a2235",
                                borderColor: "#2a3347"
                              },
                              placeholder: "SMITH"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "First" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": "my_profile.name.first.input",
                              value: firstName,
                              onChange: (e) => setFirstName(e.target.value),
                              className: "border font-mono text-xs text-white",
                              style: {
                                backgroundColor: "#1a2235",
                                borderColor: "#2a3347"
                              },
                              placeholder: "John"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "MI" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              "data-ocid": "my_profile.name.mi.input",
                              value: mi,
                              onChange: (e) => setMi(e.target.value.slice(0, 1)),
                              className: "border font-mono text-xs text-white",
                              style: {
                                backgroundColor: "#1a2235",
                                borderColor: "#2a3347"
                              },
                              placeholder: "A",
                              maxLength: 1
                            }
                          )
                        ] })
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
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Email" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "email",
                          value: email,
                          onChange: (e) => setEmail(e.target.value),
                          className: "border font-mono text-xs text-white",
                          style: {
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347"
                          }
                        }
                      )
                    ] }),
                    (lastName || firstName) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "rounded border px-3 py-2",
                        style: {
                          borderColor: "#1a2235",
                          backgroundColor: "#0a0e1a"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Preview" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-amber-400", children: formatDisplayName(
                            rankVal || profile.rank,
                            lastName,
                            firstName,
                            mi
                          ) })
                        ]
                      }
                    )
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                "data-ocid": "my_profile.cancel_button",
                className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                onClick: () => {
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
                },
                disabled: isSaving,
                children: "Reset"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "my_profile.save_button",
                className: "font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                onClick: () => void handleSave(),
                disabled: isSaving,
                children: isSaving ? "Saving…" : "Save Changes"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dialog,
          {
            open: correctionDialogOpen,
            onOpenChange: setCorrectionDialogOpen,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DialogContent,
              {
                "data-ocid": "my_profile.correction.dialog",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                className: "border font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Request Correction" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "font-mono text-xs text-slate-500", children: "Sensitive fields are managed by your S2 administrator." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "rounded border px-4 py-3",
                      style: { borderColor: "#1a2235", backgroundColor: "#0a0e1a" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-relaxed text-slate-400", children: "To correct your rank, name, clearance level, or organizational role, contact your S2 administrator directly. They can update and re-verify your profile through the Admin Panel." })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      "data-ocid": "my_profile.correction.close_button",
                      className: "font-mono text-xs uppercase tracking-wider",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      onClick: () => setCorrectionDialogOpen(false),
                      children: "Understood"
                    }
                  ) })
                ]
              }
            )
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
  MyProfilePage as default
};
