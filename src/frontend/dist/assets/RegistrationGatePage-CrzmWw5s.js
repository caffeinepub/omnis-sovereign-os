import { c as useExtActor, a as useInternetIdentity, d as useNetworkMode, b as useNavigate, r as reactExports, j as jsxRuntimeExports, e as cn, U as User, B as Button, S as Search } from "./index-CnBkd1vF.js";
import { f as formatDisplayName, L as Label, I as Input, R as RankSelector, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Building2, e as Badge } from "./displayName-B5NkxsrN.js";
import { C as Checkbox } from "./checkbox-DVFKkDXq.js";
import { S as ShieldCheck } from "./shield-check-D4WrqZ7-.js";
import { C as ChevronRight } from "./chevron-right-B23VjFYD.js";
import { L as LoaderCircle } from "./loader-circle-CXCl3Roj.js";
import { C as CircleCheck } from "./circle-check-Cu-sw5JM.js";
import { C as CircleAlert } from "./circle-alert-w37BnAqB.js";
import { S as ShieldAlert } from "./shield-alert-jcEDpY6b.js";
import "./check-C4XqBZ-7.js";
import "./constants-O6cGduIW.js";
const MILITARY_ROLES = ["Soldier", "NCO", "Officer", "Civilian", "Contractor"];
const CORPORATE_ROLES = ["Employee", "Manager", "Director", "Contractor"];
const ORG_TYPES = [
  "Battalion",
  "Brigade",
  "Company/Platoon",
  "Division HQ",
  "Corporate",
  "Other"
];
function RegistrationGatePage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const { mode: networkMode } = useNetworkMode();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(1);
  const [basicInfo, setBasicInfo] = reactExports.useState({
    lastName: "",
    firstName: "",
    mi: "",
    branch: "",
    category: "",
    rank: "",
    email: "",
    orgRole: ""
  });
  const [orgInfo, setOrgInfo] = reactExports.useState({
    mode: "Military",
    uic: "",
    orgName: "",
    businessId: "",
    orgType: "",
    isNew: false,
    skipCommander: false,
    foundWorkspace: null
  });
  const [uicSearching, setUicSearching] = reactExports.useState(false);
  const [searchDone, setSearchDone] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const hasRedirected = reactExports.useRef(false);
  const searchTimer = reactExports.useRef(null);
  const searchRetryCount = reactExports.useRef(0);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    if (hasRedirected.current) return;
    actor.getMyProfile().then((profile) => {
      if (!profile || !profile.registered) return;
      if (hasRedirected.current) return;
      hasRedirected.current = true;
      if (!profile.isValidatedByCommander && !profile.isS2Admin) {
        void navigate({ to: "/pending" });
      } else {
        void navigate({ to: "/" });
      }
    }).catch(() => {
    });
  }, [actor, isFetching, navigate]);
  const doSearch = reactExports.useCallback(
    async (query) => {
      if (!query.trim()) {
        setOrgInfo((prev) => ({ ...prev, isNew: false, foundWorkspace: null }));
        setSearchDone(false);
        setUicSearching(false);
        searchRetryCount.current = 0;
        return;
      }
      if (!actor) {
        setUicSearching(false);
        setSearchDone(false);
        if (searchRetryCount.current < 1) {
          searchRetryCount.current += 1;
          setTimeout(() => void doSearch(query), 1e3);
        }
        return;
      }
      searchRetryCount.current = 0;
      setUicSearching(true);
      try {
        let found = null;
        if (orgInfo.mode === "Military") {
          found = await actor.getOrganizationByUIC(query.toUpperCase());
        } else {
          found = await actor.getOrganizationByUIC(query.toUpperCase());
        }
        if (found) {
          setOrgInfo((prev) => ({
            ...prev,
            isNew: false,
            foundWorkspace: {
              name: found.name,
              uic: found.uic,
              type: found.orgType,
              orgId: found.orgId
            }
          }));
        } else {
          setOrgInfo((prev) => ({
            ...prev,
            isNew: false,
            foundWorkspace: null
          }));
        }
      } catch {
        setOrgInfo((prev) => ({ ...prev, isNew: false, foundWorkspace: null }));
      } finally {
        setUicSearching(false);
        setSearchDone(true);
      }
    },
    [actor, orgInfo.mode]
  );
  const handleUicChange = (val) => {
    setOrgInfo((prev) => ({
      ...prev,
      uic: val,
      foundWorkspace: null,
      isNew: false
    }));
    setSearchDone(false);
    searchRetryCount.current = 0;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) return;
    searchTimer.current = setTimeout(() => doSearch(val), 500);
  };
  const handleOrgNameChange = (val) => {
    setOrgInfo((prev) => ({
      ...prev,
      orgName: val,
      foundWorkspace: null,
      isNew: false
    }));
    setSearchDone(false);
    searchRetryCount.current = 0;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) return;
    searchTimer.current = setTimeout(() => doSearch(val), 500);
  };
  const step1Valid = basicInfo.lastName.trim() && basicInfo.firstName.trim() && basicInfo.rank && basicInfo.orgRole;
  const step2Valid = orgInfo.foundWorkspace !== null || orgInfo.isNew && (orgInfo.mode === "Military" && orgInfo.uic.trim() && orgInfo.orgName.trim() || orgInfo.mode === "Corporate" && orgInfo.orgName.trim()) && orgInfo.orgType;
  const handleRequestAccess = async () => {
    if (!actor) {
      setError("Session not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const profile = buildProfile();
      await actor.registerProfile(profile);
      void navigate({ to: "/pending" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleActivate = async () => {
    if (!actor) {
      setError("Session not ready. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const principal = identity.getPrincipal();
      const org = {
        orgId: "",
        name: orgInfo.mode === "Military" ? orgInfo.orgName : `${orgInfo.orgName}${orgInfo.businessId ? ` (${orgInfo.businessId})` : ""}`,
        uic: orgInfo.mode === "Military" ? orgInfo.uic.toUpperCase() : orgInfo.orgName.toUpperCase().replace(/\s+/g, "-"),
        orgType: orgInfo.orgType,
        networkMode: orgInfo.mode === "Military" ? "NIPR" : "Standard",
        adminPrincipal: principal,
        createdAt: BigInt(0)
      };
      const newOrgId = await actor.createOrganization(org);
      localStorage.setItem(
        "omnis_workspace_data",
        JSON.stringify({
          orgId: newOrgId,
          orgName: org.name,
          uic: org.uic,
          orgType: org.orgType,
          mode: orgInfo.mode,
          skipCommander: orgInfo.skipCommander
        })
      );
      localStorage.setItem("omnis_selected_uic", org.uic);
      const profile = buildProfile(newOrgId, org.uic);
      profile.isS2Admin = true;
      await actor.registerProfile(profile);
      void navigate({ to: "/workspace-setup" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Workspace creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const buildProfile = (newOrgId, newUic) => {
    const fw = orgInfo.foundWorkspace;
    const principal = identity.getPrincipal();
    const displayName = formatDisplayName(
      basicInfo.rank,
      basicInfo.lastName,
      basicInfo.firstName,
      basicInfo.mi
    );
    return {
      principalId: principal,
      name: displayName,
      lastName: basicInfo.lastName,
      firstName: basicInfo.firstName,
      middleInitial: basicInfo.mi,
      branch: basicInfo.branch,
      rankCategory: basicInfo.category,
      rank: basicInfo.rank,
      email: basicInfo.email,
      orgRole: basicInfo.orgRole,
      uic: newUic ?? (fw == null ? void 0 : fw.uic) ?? orgInfo.uic.toUpperCase(),
      orgId: newOrgId ?? (fw == null ? void 0 : fw.orgId) ?? "",
      registered: true,
      isS2Admin: false,
      isValidatedByCommander: false,
      clearanceLevel: BigInt(1),
      dodId: "",
      mos: "",
      registrationStatus: "pending",
      denialReason: "",
      networkEmail: basicInfo.email,
      unitPhone: "",
      avatarUrl: void 0,
      verifiedBy: void 0,
      verifiedAt: void 0,
      clearanceExpiry: void 0
    };
  };
  const searchQuery = orgInfo.mode === "Military" ? orgInfo.uic : orgInfo.orgName;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex min-h-screen flex-col items-center justify-center px-4 py-8",
      style: {
        backgroundColor: "#060b14",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.25 0.05 250 / 0.3), transparent)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-lg font-bold tracking-[0.2em] text-white uppercase", children: "OMNIS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70", children: "Sovereign OS — Personnel Registration" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden",
            style: { backgroundColor: "#0a0e1a", borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressBar, { step }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
                step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Step1,
                  {
                    isCorporateMode: networkMode === "corporate-standard" || networkMode === "corporate-secure",
                    basicInfo,
                    setBasicInfo,
                    onNext: () => setStep(2),
                    isValid: !!step1Valid
                  }
                ),
                step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Step2,
                  {
                    orgInfo,
                    setOrgInfo,
                    searchQuery,
                    onUicChange: handleUicChange,
                    onOrgNameChange: handleOrgNameChange,
                    uicSearching,
                    searchDone,
                    actorReady: !!actor && !isFetching,
                    onBack: () => setStep(1),
                    onNext: () => setStep(3),
                    onRequestAccess: handleRequestAccess,
                    isSubmitting,
                    isValid: !!step2Valid
                  }
                ),
                step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Step3,
                  {
                    basicInfo,
                    orgInfo,
                    onBack: () => setStep(2),
                    onSubmit: handleActivate,
                    isSubmitting,
                    error
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 font-mono text-[9px] uppercase tracking-wider text-slate-600", children: "Secured by Internet Computer Protocol" })
      ]
    }
  );
}
function ProgressBar({ step }) {
  const labels = ["Personal Info", "Workspace", "Confirm"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 pt-6 pb-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mb-3", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-1 rounded-full transition-all duration-500",
        style: {
          backgroundColor: s <= step ? "oklch(0.75 0.15 70)" : "#1a2235"
        }
      }
    ) }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between", children: labels.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn(
          "font-mono text-[9px] uppercase tracking-wider transition-colors",
          i + 1 <= step ? "text-amber-400" : "text-slate-600"
        ),
        children: label
      },
      label
    )) })
  ] });
}
function Step1({
  basicInfo,
  setBasicInfo,
  onNext,
  isValid,
  isCorporateMode = false
}) {
  const isMilitary = !isCorporateMode && basicInfo.branch !== "Corporate" && basicInfo.branch !== "Civilian";
  const roles = isMilitary ? MILITARY_ROLES : CORPORATE_ROLES;
  const set = (field) => (v) => setBasicInfo((prev) => ({ ...prev, [field]: v }));
  const namePreview = basicInfo.rank && basicInfo.lastName ? formatDisplayName(
    basicInfo.rank,
    basicInfo.lastName,
    basicInfo.firstName,
    basicInfo.mi
  ) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "registration.step1.panel", className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-sm font-bold uppercase tracking-[0.2em] text-white", children: "Step 1 of 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-slate-400", children: "Personal Information" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Last Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "registration.step1.input",
            value: basicInfo.lastName,
            onChange: (e) => set("lastName")(e.target.value),
            placeholder: "SMITH",
            className: "border bg-[#0f1626] font-mono text-sm",
            style: { borderColor: "#1a2235" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "MI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: basicInfo.mi,
            onChange: (e) => set("mi")(e.target.value.slice(0, 1).toUpperCase()),
            placeholder: "J",
            maxLength: 1,
            className: "border bg-[#0f1626] font-mono text-sm",
            style: { borderColor: "#1a2235" }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "First Name *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: basicInfo.firstName,
          onChange: (e) => set("firstName")(e.target.value),
          placeholder: "John",
          className: "border bg-[#0f1626] font-mono text-sm",
          style: { borderColor: "#1a2235" }
        }
      )
    ] }),
    isCorporateMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Job Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "registration.step1.jobtitle.input",
            value: basicInfo.rank,
            onChange: (e) => setBasicInfo((prev) => ({ ...prev, rank: e.target.value })),
            placeholder: "e.g. Senior Engineer",
            className: "border bg-[#0f1626] font-mono text-sm",
            style: { borderColor: "#1a2235" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: basicInfo.branch,
            onChange: (e) => setBasicInfo((prev) => ({ ...prev, branch: e.target.value })),
            placeholder: "e.g. Engineering",
            className: "border bg-[#0f1626] font-mono text-sm",
            style: { borderColor: "#1a2235" }
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      RankSelector,
      {
        branch: basicInfo.branch,
        category: basicInfo.category,
        rank: basicInfo.rank,
        onBranchChange: (v) => setBasicInfo((prev) => ({
          ...prev,
          branch: v,
          category: "",
          rank: "",
          orgRole: ""
        })),
        onCategoryChange: (v) => setBasicInfo((prev) => ({ ...prev, category: v, rank: "" })),
        onRankChange: set("rank")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "email",
          value: basicInfo.email,
          onChange: (e) => set("email")(e.target.value),
          placeholder: "j.smith@army.mil",
          className: "border bg-[#0f1626] font-mono text-sm",
          style: { borderColor: "#1a2235" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Organizational Role *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: basicInfo.orgRole, onValueChange: set("orgRole"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectTrigger,
          {
            className: "border bg-[#0f1626] font-mono text-sm",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select role…" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectContent,
          {
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "font-mono text-sm", children: r }, r))
          }
        )
      ] })
    ] }),
    namePreview && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-lg border px-4 py-2.5 flex items-center gap-2",
        style: { borderColor: "#1a2235", backgroundColor: "#060b14" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-amber-500/60 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-amber-400", children: namePreview })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        "data-ocid": "registration.next.button",
        onClick: onNext,
        disabled: !isValid,
        className: "w-full gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40",
        children: [
          "Continue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
        ]
      }
    )
  ] });
}
function Step2({
  orgInfo,
  setOrgInfo,
  searchQuery,
  onUicChange,
  onOrgNameChange,
  uicSearching,
  searchDone,
  actorReady,
  onBack,
  onNext,
  onRequestAccess,
  isSubmitting,
  isValid
}) {
  const isMilitary = orgInfo.mode === "Military";
  const notFound = searchDone && !uicSearching && !orgInfo.foundWorkspace && searchQuery.trim().length > 0;
  const [showSessionBanner, setShowSessionBanner] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setShowSessionBanner(false), 8e3);
    return () => clearTimeout(t);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "registration.step2.panel", className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-sm font-bold uppercase tracking-[0.2em] text-white", children: "Step 2 of 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-slate-400", children: "Workspace Selection" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["Military", "Corporate"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setOrgInfo((prev) => ({
          ...prev,
          mode: m,
          uic: "",
          orgName: "",
          foundWorkspace: null,
          isNew: false
        })),
        className: cn(
          "flex-1 rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
          orgInfo.mode === m ? "border-amber-500/60 bg-amber-500/10 text-amber-400" : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
        ),
        children: m
      },
      m
    )) }),
    !actorReady && showSessionBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 rounded-lg border px-3 py-2 max-w-sm",
        style: { borderColor: "#1a2235", backgroundColor: "#060b14" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin text-amber-500 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-500", children: "Establishing secure session…" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: isMilitary ? "Unit Identification Code (UIC)" : "Organization Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "registration.uic_search.input",
            value: isMilitary ? orgInfo.uic : orgInfo.orgName,
            onChange: (e) => isMilitary ? onUicChange(e.target.value) : onOrgNameChange(e.target.value),
            placeholder: isMilitary ? "e.g. WH9RT0" : "e.g. Acme Corporation",
            className: "border bg-[#0f1626] pl-9 font-mono text-sm uppercase",
            style: { borderColor: "#1a2235" }
          }
        ),
        uicSearching && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-amber-500" })
      ] }),
      isMilitary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-slate-600", children: "6-character alphanumeric code (e.g. WH9RT0, 1A2B3C)" })
    ] }),
    !isMilitary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: [
        "Business ID",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-slate-600", children: "(optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: orgInfo.businessId,
          onChange: (e) => setOrgInfo((prev) => ({ ...prev, businessId: e.target.value })),
          placeholder: "EIN, tax ID, or internal identifier",
          className: "border bg-[#0f1626] font-mono text-sm",
          style: { borderColor: "#1a2235" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-slate-600", children: "EIN, tax ID, or internal identifier — helps disambiguate similarly named organizations" })
    ] }),
    orgInfo.foundWorkspace && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl border overflow-hidden",
        style: { borderColor: "#1a3a1a", backgroundColor: "#0a1a0a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-2 px-4 py-3 border-b",
              style: { borderColor: "#1a3a1a" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold uppercase tracking-wider text-green-400", children: "Workspace Found" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-bold text-white", children: orgInfo.foundWorkspace.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-slate-400", children: [
              orgInfo.foundWorkspace.uic,
              " · ",
              orgInfo.foundWorkspace.type
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: onRequestAccess,
                disabled: isSubmitting,
                className: "w-full gap-2 bg-green-700 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-green-600",
                children: [
                  isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
                  "Request Access to ",
                  orgInfo.foundWorkspace.name
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-[9px] text-slate-600 text-center", children: "You will be placed in a pending verification queue and notified when approved by the Security Administrator." })
          ] })
        ]
      }
    ),
    notFound && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-lg border px-4 py-3 flex items-start gap-2",
          style: { borderColor: "#2a1a0a", backgroundColor: "#150f05" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-400 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-amber-300", children: [
              "No workspace found for",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: searchQuery.toUpperCase() }),
              "."
            ] })
          ]
        }
      ),
      !orgInfo.isNew ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setOrgInfo((prev) => ({ ...prev, isNew: true })),
          className: "w-full rounded-lg border border-dashed border-amber-500/30 px-4 py-3 text-left hover:border-amber-500/60 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-amber-400", children: "+ Establish New Workspace" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: "Create a new Omnis workspace for this UIC or organization" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(NewWorkspaceForm, { orgInfo, setOrgInfo })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "registration.back.button",
          variant: "outline",
          onClick: onBack,
          className: "flex-1 border-white/10 font-mono text-xs uppercase tracking-wider text-slate-400 hover:border-white/20 hover:text-white",
          children: "Back"
        }
      ),
      orgInfo.isNew && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "registration.next.button",
          onClick: onNext,
          disabled: !isValid,
          className: "flex-1 gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40",
          children: [
            "Review ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          ]
        }
      )
    ] })
  ] });
}
function NewWorkspaceForm({
  orgInfo,
  setOrgInfo
}) {
  const isMilitary = orgInfo.mode === "Military";
  const set = (field) => (v) => setOrgInfo((prev) => ({ ...prev, [field]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border space-y-4 p-4",
      style: { borderColor: "#1a2235", backgroundColor: "#060b14" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold uppercase tracking-wider text-amber-400", children: "New Workspace Details" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: isMilitary ? "Unit Name *" : "Organization Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: orgInfo.orgName,
              onChange: (e) => set("orgName")(e.target.value),
              placeholder: isMilitary ? "e.g. 1-501st PIR" : "e.g. Acme Corporation",
              className: "border bg-[#0a0e1a] font-mono text-sm",
              style: { borderColor: "#1a2235" }
            }
          )
        ] }),
        isMilitary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "UIC *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: orgInfo.uic,
              onChange: (e) => set("uic")(e.target.value.toUpperCase().slice(0, 6)),
              placeholder: "WH9RT0",
              maxLength: 6,
              className: "border bg-[#0a0e1a] font-mono text-sm uppercase",
              style: { borderColor: "#1a2235" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Workspace Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: orgInfo.orgType,
              onValueChange: (v) => set("orgType")(v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectTrigger,
                  {
                    className: "border bg-[#0a0e1a] font-mono text-sm",
                    style: { borderColor: "#1a2235" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectContent,
                  {
                    style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                    children: ORG_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, className: "font-mono text-sm", children: t }, t))
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-lg border px-4 py-3 space-y-1",
            style: { borderColor: "#3a2a0a", backgroundColor: "#1a1205" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-amber-400 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-bold text-amber-300", children: "Provisional Security Administrator" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[10px] leading-relaxed text-amber-200/70", children: "By establishing this workspace you will assume the Provisional S2 Admin role. A Commander (or equivalent) must confirm their role before the workspace is fully operational." })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "skip-commander",
              checked: orgInfo.skipCommander,
              onCheckedChange: (v) => set("skipCommander")(!!v),
              className: "border-white/20"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "skip-commander",
              className: "font-mono text-[10px] text-slate-500 cursor-pointer",
              children: "Testing only — skip Commander confirmation requirement"
            }
          )
        ] })
      ]
    }
  );
}
function Step3({
  basicInfo,
  orgInfo,
  onBack,
  onSubmit,
  isSubmitting,
  error
}) {
  const fw = orgInfo.foundWorkspace;
  const displayName = formatDisplayName(
    basicInfo.rank,
    basicInfo.lastName,
    basicInfo.firstName,
    basicInfo.mi
  );
  const workspaceName = (fw == null ? void 0 : fw.name) ?? orgInfo.orgName;
  const workspaceUic = (fw == null ? void 0 : fw.uic) ?? (orgInfo.mode === "Military" ? orgInfo.uic.toUpperCase() : orgInfo.orgName.toUpperCase().replace(/\s+/g, "-"));
  const workspaceType = (fw == null ? void 0 : fw.type) ?? orgInfo.orgType;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "registration.step3.panel", className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-sm font-bold uppercase tracking-[0.2em] text-white", children: "Step 3 of 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-slate-400", children: "Confirm & Activate" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl border divide-y",
        style: { borderColor: "#1a2235", backgroundColor: "#060b14" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SummaryRow,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5" }),
              label: "Identity",
              value: displayName
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SummaryRow,
            {
              label: "Branch / Rank",
              value: `${basicInfo.branch} — ${basicInfo.rank}`
            }
          ),
          basicInfo.email && /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Email", value: basicInfo.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Role", value: basicInfo.orgRole }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SummaryRow,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
              label: "Workspace",
              value: `${workspaceName} (${workspaceUic}) · ${workspaceType} · ${orgInfo.mode}`
            }
          ),
          orgInfo.isNew && !fw && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-500/20 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30", children: "Provisional S2 Admin" }) })
        ]
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-2 rounded-lg border px-4 py-3",
        style: { borderColor: "#2a1a1a", backgroundColor: "#150a0a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-red-400 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-red-300", children: error })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "registration.back.button",
          variant: "outline",
          onClick: onBack,
          disabled: isSubmitting,
          className: "flex-1 border-white/10 font-mono text-xs uppercase tracking-wider text-slate-400 hover:border-white/20 hover:text-white",
          children: "Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "registration.submit.button",
          onClick: onSubmit,
          disabled: isSubmitting,
          className: "flex-1 gap-2 bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40",
          children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Activating…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
            " Activate Account"
          ] })
        }
      )
    ] })
  ] });
}
function SummaryRow({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-4 py-3", children: [
    icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-amber-500/60", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-wider text-slate-600", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-white truncate", children: value })
    ] })
  ] });
}
export {
  RegistrationGatePage as default
};
