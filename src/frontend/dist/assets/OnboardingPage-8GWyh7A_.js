import { c as useExtActor, a as useInternetIdentity, b as useNavigate, r as reactExports, j as jsxRuntimeExports, a9 as Search, a4 as TriangleAlert } from "./index-Dm1hd-rR.js";
import { C as CircleCheck } from "./circle-check-BlMesRQu.js";
import { L as LoaderCircle } from "./loader-circle-BzIe35gm.js";
import { P as Plus } from "./plus-ByWXVOi5.js";
import { C as ChevronDown } from "./chevron-down-C4YFpDW9.js";
const UNIT_TYPES = [
  "Battalion",
  "Brigade",
  "Company/Platoon",
  "Division HQ",
  "Corporate",
  "Other"
];
const MODES = ["Military", "Corporate"];
const WORKSPACES = [
  {
    id: "w1",
    name: "1-501st PIR",
    uic: "WA1AA0",
    type: "Army Infantry BN",
    category: "Military"
  },
  {
    id: "w2",
    name: "2-504th PIR",
    uic: "WA2BB0",
    type: "Army Infantry BN",
    category: "Military"
  },
  {
    id: "w3",
    name: "HHC 82nd ABN DIV",
    uic: "WA3CC0",
    type: "Army Division HQ",
    category: "Military"
  },
  {
    id: "w4",
    name: "1st BDE, 82nd ABN DIV",
    uic: "WA4DD0",
    type: "Army Brigade",
    category: "Military"
  },
  {
    id: "w5",
    name: "Corporate Workspace · Standard",
    uic: "",
    type: "Business",
    category: "Corporate"
  },
  {
    id: "w6",
    name: "Corporate Workspace · Secure",
    uic: "",
    type: "Enterprise",
    category: "Corporate"
  }
];
const STEP_LABELS = ["Identity Verified", "Request Access", "Submitted"];
function StepIndicator({ currentStep }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-0", children: STEP_LABELS.map((label, idx) => {
    const stepNum = idx + 1;
    const isActive = stepNum === currentStep;
    const isDone = stepNum < currentStep;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300",
            style: {
              backgroundColor: isDone ? "rgba(34,197,94,0.15)" : isActive ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
              borderColor: isDone ? "rgba(34,197,94,0.5)" : isActive ? "rgba(245,158,11,0.6)" : "#2a3347",
              color: isDone ? "#22c55e" : isActive ? "#f59e0b" : "#4b5563"
            },
            children: isDone ? "✓" : stepNum
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "font-mono text-[9px] uppercase tracking-wider",
            style: {
              color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563"
            },
            children: label
          }
        )
      ] }),
      idx < STEP_LABELS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "mx-3 mb-5 h-px w-10 transition-all duration-300",
          style: {
            backgroundColor: stepNum < currentStep ? "rgba(34,197,94,0.4)" : "#2a3347"
          }
        }
      )
    ] }, label);
  }) });
}
function WorkspaceCard({
  workspace,
  index,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-ocid": `onboarding.workspace.item.${index}`,
      onClick: onSelect,
      className: "w-full rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
      style: {
        backgroundColor: selected ? "rgba(245,158,11,0.06)" : "#0f1626",
        borderColor: selected ? "rgba(245,158,11,0.5)" : "#1a2235",
        boxShadow: selected ? "0 0 0 1px rgba(245,158,11,0.25)" : "none"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "truncate font-mono text-xs font-semibold uppercase tracking-wider",
                style: { color: selected ? "#f59e0b" : "#e2e8f0" },
                children: workspace.name
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: [
              workspace.uic ? `UIC: ${workspace.uic} · ` : "",
              workspace.type
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              style: {
                backgroundColor: workspace.category === "Military" ? "rgba(59,130,246,0.08)" : "rgba(139,92,246,0.08)",
                borderColor: workspace.category === "Military" ? "rgba(59,130,246,0.3)" : "rgba(139,92,246,0.3)",
                color: workspace.category === "Military" ? "#60a5fa" : "#a78bfa"
              },
              children: workspace.category
            }
          )
        ] }),
        selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3", style: { color: "#f59e0b" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "font-mono text-[9px] uppercase tracking-wider",
              style: { color: "#f59e0b" },
              children: "Selected"
            }
          )
        ] })
      ]
    }
  );
}
function OnboardingPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    actor.getMyProfile().then((profile) => {
      if (!profile || !profile.registered) return;
      if (profile.isValidatedByCommander || profile.isS2Admin) {
        void navigate({ to: "/" });
      } else {
        void navigate({ to: "/pending" });
      }
    }).catch(() => {
    });
  }, [actor, isFetching, navigate]);
  const [step, setStep] = reactExports.useState(1);
  const [subStep, setSubStep] = reactExports.useState("select");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedWorkspace, setSelectedWorkspace] = reactExports.useState(
    null
  );
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [submittedWorkspace, setSubmittedWorkspace] = reactExports.useState(null);
  const [showCustomUnit, setShowCustomUnit] = reactExports.useState(false);
  const [customUnitName, setCustomUnitName] = reactExports.useState("");
  const autoAdvanced = reactExports.useRef(false);
  const [createName, setCreateName] = reactExports.useState("");
  const [createUic, setCreateUic] = reactExports.useState("");
  const [createType, setCreateType] = reactExports.useState("");
  const [createMode, setCreateMode] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (step === 1 && !autoAdvanced.current) {
      autoAdvanced.current = true;
      const t = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);
  const filteredWorkspaces = WORKSPACES.filter(
    (w) => !searchQuery || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.uic.toLowerCase().includes(searchQuery.toLowerCase()) || w.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const showCreateWorkspace = searchQuery.trim().length > 0 && filteredWorkspaces.length === 0;
  const canCreateWorkspace = createName.trim() && createUic.trim() && createType && createMode;
  const handleEstablishWorkspace = async () => {
    if (!canCreateWorkspace) return;
    const uic = createUic.trim().toUpperCase();
    const orgId = crypto.randomUUID();
    const ws = {
      name: createName.trim(),
      uic,
      type: createType,
      mode: createMode,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (actor) {
      try {
        const existing = await actor.getOrganizationByUIC(uic);
        if (existing) {
          localStorage.setItem(
            "omnis_workspace",
            JSON.stringify({ ...ws, orgId: existing.orgId })
          );
          localStorage.setItem("omnis_founding_s2", "true");
          void navigate({ to: "/validate-commander" });
          return;
        }
        await actor.createOrganization({
          orgId,
          name: createName.trim(),
          uic,
          orgType: createType,
          networkMode: createMode === "Military" ? "military-nipr" : "corporate-standard",
          adminPrincipal: identity.getPrincipal(),
          createdAt: BigInt(Date.now())
        });
        localStorage.setItem("omnis_org_id", orgId);
      } catch {
      }
    }
    localStorage.setItem("omnis_workspace", JSON.stringify(ws));
    localStorage.setItem("omnis_founding_s2", "true");
    void navigate({ to: "/validate-commander" });
  };
  const handleContinue = () => {
    if (selectedWorkspace || showCustomUnit && customUnitName.trim())
      setSubStep("confirm");
  };
  const effectiveWorkspace = showCustomUnit && customUnitName.trim() ? {
    id: "custom",
    name: customUnitName.trim(),
    uic: "",
    type: "Custom",
    category: "Other"
  } : selectedWorkspace;
  const handleSubmitRequest = async () => {
    if (!effectiveWorkspace || !identity) return;
    setSubmitting(true);
    const principalId = identity.getPrincipal();
    const principalStr = principalId.toString();
    localStorage.setItem(
      `omnis_org_request_${principalStr}`,
      JSON.stringify({
        workspace: effectiveWorkspace.name,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      })
    );
    if (actor) {
      try {
        const allProfiles = await actor.getAllProfiles();
        const s2Admins = allProfiles.filter((p) => p.isS2Admin);
        const currentProfile = allProfiles.find(
          (p) => p.principalId.toString() === principalStr
        );
        const userName = (currentProfile == null ? void 0 : currentProfile.name) || `User (${principalStr.slice(0, 8)}...)`;
        await Promise.all(
          s2Admins.map(
            (admin) => actor.createSystemNotification({
              id: crypto.randomUUID(),
              title: "New Access Request",
              body: `${userName} has requested access to ${effectiveWorkspace.name}`,
              userId: admin.principalId,
              notificationType: "access_request",
              createdAt: BigInt(Date.now()),
              read: false,
              metadata: void 0
            })
          )
        );
      } catch {
      }
    }
    setSubmittedWorkspace(effectiveWorkspace);
    setStep(3);
    setSubmitting(false);
  };
  const displayName = (submittedWorkspace == null ? void 0 : submittedWorkspace.name) ?? (effectiveWorkspace == null ? void 0 : effectiveWorkspace.name) ?? "your organization";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 opacity-10",
            style: {
              backgroundImage: "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex w-full max-w-lg flex-col gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { currentStep: step }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border p-6 shadow-2xl",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 py-6 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-16 w-16 items-center justify-center rounded-full border",
                      style: {
                        backgroundColor: "rgba(34,197,94,0.1)",
                        borderColor: "rgba(34,197,94,0.4)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8 text-green-500" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-lg font-bold uppercase tracking-widest text-white", children: "Identity Verified" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs text-slate-500", children: "Your Internet Identity has been authenticated." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-slate-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider", children: "Continuing…" })
                  ] })
                ] }),
                step === 2 && subStep === "select" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Select Your Organization" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[11px] text-slate-500", children: "Find and request access to your unit or organization workspace." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        "data-ocid": "onboarding.search.input",
                        type: "text",
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value),
                        placeholder: "Search by name, UIC, or type...",
                        className: "w-full rounded border py-2 pl-8 pr-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1",
                        style: {
                          backgroundColor: "#1a2235",
                          borderColor: "#2a3347"
                        }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-72 space-y-2 overflow-y-auto pr-0.5", children: [
                    filteredWorkspaces.map((ws) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      WorkspaceCard,
                      {
                        workspace: ws,
                        index: WORKSPACES.indexOf(ws) + 1,
                        selected: (selectedWorkspace == null ? void 0 : selectedWorkspace.id) === ws.id,
                        onSelect: () => {
                          setSelectedWorkspace(ws);
                          setShowCustomUnit(false);
                          setCustomUnitName("");
                        }
                      },
                      ws.id
                    )),
                    showCreateWorkspace && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "rounded border p-4 space-y-4",
                        style: {
                          borderColor: "rgba(245,158,11,0.4)",
                          borderStyle: "dashed",
                          backgroundColor: "rgba(245,158,11,0.03)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Plus,
                              {
                                className: "mt-0.5 h-3.5 w-3.5 shrink-0",
                                style: { color: "#f59e0b" }
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "p",
                                {
                                  className: "font-mono text-[10px] font-bold uppercase tracking-wider",
                                  style: { color: "#f59e0b" },
                                  children: "Establish New Workspace"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[9px] leading-relaxed text-slate-500", children: [
                                "No workspace found for “",
                                searchQuery,
                                "”. You can establish a new isolated workspace below."
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            {
                              className: "flex items-start gap-2 rounded border px-3 py-2",
                              style: {
                                backgroundColor: "rgba(245,158,11,0.05)",
                                borderColor: "rgba(245,158,11,0.15)"
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  TriangleAlert,
                                  {
                                    className: "mt-0.5 h-3 w-3 shrink-0",
                                    style: { color: "#f59e0b" }
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] leading-relaxed text-amber-400/70", children: "This will create a new isolated workspace. You will be assigned as Provisional S2 Administrator." })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "label",
                                {
                                  htmlFor: "create-unit-name",
                                  className: "font-mono text-[9px] uppercase tracking-wider text-slate-500",
                                  children: "Unit Name"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  id: "create-unit-name",
                                  "data-ocid": "onboarding.create.name.input",
                                  type: "text",
                                  value: createName,
                                  onChange: (e) => setCreateName(e.target.value),
                                  placeholder: "1-501st PIR",
                                  className: "w-full rounded border px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1",
                                  style: {
                                    backgroundColor: "#0a0e1a",
                                    borderColor: "#2a3347"
                                  }
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "label",
                                {
                                  htmlFor: "create-unit-uic",
                                  className: "font-mono text-[9px] uppercase tracking-wider text-slate-500",
                                  children: "Unit Identification Code (UIC)"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  id: "create-unit-uic",
                                  "data-ocid": "onboarding.create.uic.input",
                                  type: "text",
                                  value: createUic,
                                  onChange: (e) => setCreateUic(e.target.value.toUpperCase()),
                                  placeholder: "WH9RT0",
                                  maxLength: 8,
                                  className: "w-full rounded border px-3 py-1.5 font-mono text-xs uppercase text-white placeholder:text-slate-600 focus:outline-none focus:ring-1",
                                  style: {
                                    backgroundColor: "#0a0e1a",
                                    borderColor: "#2a3347"
                                  }
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "label",
                                  {
                                    htmlFor: "create-unit-type",
                                    className: "font-mono text-[9px] uppercase tracking-wider text-slate-500",
                                    children: "Unit Type"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "select",
                                  {
                                    id: "create-unit-type",
                                    "data-ocid": "onboarding.create.type.select",
                                    value: createType,
                                    onChange: (e) => setCreateType(e.target.value),
                                    className: "w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1",
                                    style: {
                                      backgroundColor: "#0a0e1a",
                                      borderColor: "#2a3347"
                                    },
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select type…" }),
                                      UNIT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
                                    ]
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "label",
                                  {
                                    htmlFor: "create-unit-mode",
                                    className: "font-mono text-[9px] uppercase tracking-wider text-slate-500",
                                    children: "Mode"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "select",
                                  {
                                    id: "create-unit-mode",
                                    "data-ocid": "onboarding.create.mode.select",
                                    value: createMode,
                                    onChange: (e) => setCreateMode(e.target.value),
                                    className: "w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1",
                                    style: {
                                      backgroundColor: "#0a0e1a",
                                      borderColor: "#2a3347"
                                    },
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select mode…" }),
                                      MODES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
                                    ]
                                  }
                                )
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                "data-ocid": "onboarding.create.establish.primary_button",
                                disabled: !canCreateWorkspace,
                                onClick: handleEstablishWorkspace,
                                className: "h-9 w-full rounded font-mono text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                                style: {
                                  backgroundColor: canCreateWorkspace ? "#f59e0b" : "#1a2235",
                                  color: canCreateWorkspace ? "#0a0e1a" : "#4b5563"
                                },
                                children: "Establish Workspace"
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    !showCreateWorkspace && filteredWorkspaces.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-center font-mono text-[10px] text-slate-600", children: "No workspaces found. Type a UIC or unit name to search." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "onboarding.custom_unit.toggle",
                        onClick: () => {
                          setShowCustomUnit((v) => !v);
                          setSelectedWorkspace(null);
                        },
                        className: "flex w-full items-center gap-2 rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
                        style: {
                          backgroundColor: showCustomUnit ? "rgba(245,158,11,0.06)" : "transparent",
                          borderColor: showCustomUnit ? "rgba(245,158,11,0.4)" : "#2a3347",
                          borderStyle: "dashed"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ChevronDown,
                            {
                              className: "h-3 w-3 transition-transform shrink-0",
                              style: {
                                color: "#64748b",
                                transform: showCustomUnit ? "rotate(180deg)" : "rotate(0deg)"
                              }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: "Request Custom Access" })
                        ]
                      }
                    ),
                    showCustomUnit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "space-y-2 rounded border px-4 py-3",
                        style: {
                          backgroundColor: "#0a111f",
                          borderColor: "#1e2d45"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              "data-ocid": "onboarding.custom_unit.input",
                              type: "text",
                              value: customUnitName,
                              onChange: (e) => setCustomUnitName(e.target.value),
                              placeholder: "Enter your unit or organization name...",
                              className: "w-full rounded border bg-transparent py-2 px-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1",
                              style: { borderColor: "#2a3347" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] leading-relaxed text-slate-600", children: "Submit a custom access request. Your S2 admin will review your request." })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "onboarding.continue_button",
                      disabled: !selectedWorkspace && !(showCustomUnit && customUnitName.trim()),
                      onClick: handleContinue,
                      className: "mt-2 h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                      style: {
                        backgroundColor: selectedWorkspace || showCustomUnit && customUnitName.trim() ? "#f59e0b" : "#1a2235",
                        color: selectedWorkspace || showCustomUnit && customUnitName.trim() ? "#0a0e1a" : "#4b5563"
                      },
                      children: "Continue"
                    }
                  )
                ] }),
                step === 2 && subStep === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Confirm Organization" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[11px] text-slate-500", children: "Please verify this is correct before submitting your request." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded border px-4 py-4",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.04)",
                        borderColor: "rgba(245,158,11,0.2)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: "Requesting access to" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          {
                            className: "mt-1 font-mono text-sm font-bold uppercase tracking-wider",
                            style: { color: "#f59e0b" },
                            children: effectiveWorkspace == null ? void 0 : effectiveWorkspace.name
                          }
                        ),
                        (effectiveWorkspace == null ? void 0 : effectiveWorkspace.uic) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: [
                          "UIC: ",
                          effectiveWorkspace.uic,
                          " · ",
                          effectiveWorkspace.type
                        ] }),
                        showCustomUnit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[9px] text-slate-600", children: "Custom workspace — will be created when your S2 admin activates the system." })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-slate-500", children: "Is this correct?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "onboarding.cancel_button",
                        onClick: () => setSubStep("select"),
                        disabled: submitting,
                        className: "h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40",
                        style: { borderColor: "#2a3347" },
                        children: "Go Back"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "onboarding.confirm_button",
                        onClick: handleSubmitRequest,
                        disabled: submitting,
                        className: "h-10 flex-1 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40",
                        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                        children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                          "Submitting…"
                        ] }) : "Submit Request"
                      }
                    )
                  ] })
                ] }),
                step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 py-4 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-16 w-16 items-center justify-center rounded-full border",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.08)",
                        borderColor: "rgba(245,158,11,0.35)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CircleCheck,
                        {
                          className: "h-8 w-8",
                          style: { color: "#f59e0b" }
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-lg font-bold uppercase tracking-widest text-white", children: "Request Submitted" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-500", children: [
                      "Your request to join",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color: "#f59e0b" }, children: displayName }),
                      " ",
                      "is pending approval by your S2 or security officer."
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs text-slate-600", children: "You will be notified once your access is confirmed." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "onboarding.finish_button",
                      onClick: () => void navigate({ to: "/pending" }),
                      className: "h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: "Continue to Omnis"
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-mono text-[10px] text-slate-700", children: "Access is strictly monitored. Unauthorized requests are logged." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" })
      ]
    }
  );
}
export {
  OnboardingPage as default
};
