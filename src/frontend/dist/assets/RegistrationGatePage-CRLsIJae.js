import { c as useExtActor, a as useInternetIdentity, b as useNavigate, r as reactExports, j as jsxRuntimeExports, d as cn, B as Button, U as UserRole } from "./index-Dm1hd-rR.js";
import { F as FormError } from "./FormError-Co_UptkN.js";
import { f as formatDisplayName, L as Label, I as Input, R as RankSelector } from "./displayName-CSKLG_nZ.js";
import { S as ShieldAlert } from "./shield-alert-dV4zSy0h.js";
import { R as RefreshCw } from "./refresh-cw-BR-tpAUa.js";
import { S as ShieldCheck } from "./shield-check-BmGSdE3s.js";
import { L as LoaderCircle } from "./loader-circle-BzIe35gm.js";
import { C as CircleAlert } from "./circle-alert-CvJP1k3z.js";
import { C as ChevronDown } from "./chevron-down-C4YFpDW9.js";
import "./check-UB5_kp0G.js";
import "./constants-O6cGduIW.js";
function RegistrationGatePage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [branch, setBranch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
    lastName: "",
    firstName: "",
    mi: "",
    rank: "",
    email: "",
    orgRole: "",
    bootstrapCode: ""
  });
  const [error, setError] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [showBootstrapCode, setShowBootstrapCode] = reactExports.useState(false);
  const [sessionTimedOut, setSessionTimedOut] = reactExports.useState(false);
  const [isFirstUser, setIsFirstUser] = reactExports.useState(false);
  const timeoutStarted = reactExports.useRef(false);
  const hasRedirected = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const hasRealIdentity2 = !!identity && !identity.getPrincipal().isAnonymous();
    if (!hasRealIdentity2) return;
    if (actor && !isFetching) return;
    if (timeoutStarted.current) return;
    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      setSessionTimedOut(true);
    }, 25e3);
    return () => clearTimeout(timer);
  }, [identity]);
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
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    actor.getAllProfiles().then((profiles) => {
      const hasS2 = profiles.some((p) => p.isS2Admin);
      setIsFirstUser(!hasS2);
    }).catch(() => setIsFirstUser(false));
  }, [actor, isFetching]);
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };
  const namePreview = formatDisplayName(
    form.rank,
    form.lastName,
    form.firstName,
    form.mi
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFetching) {
      setError(
        "System is still initializing. Please wait a moment and try again."
      );
      return;
    }
    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }
    if (!form.lastName.trim() || !form.firstName.trim() || !form.rank.trim() || !form.email.trim() || !form.orgRole.trim()) {
      setError(
        "Last name, first name, rank, email, and organizational role are required."
      );
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const principal = identity.getPrincipal();
      const formattedName = formatDisplayName(
        form.rank,
        form.lastName,
        form.firstName,
        form.mi
      );
      await actor.registerProfile({
        principalId: principal,
        name: formattedName,
        rank: form.rank.trim(),
        email: form.email.trim(),
        orgRole: form.orgRole.trim(),
        clearanceLevel: 0n,
        isS2Admin: false,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: void 0,
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        middleInitial: form.mi.trim(),
        branch,
        rankCategory: category,
        dodId: "",
        mos: "",
        uic: "",
        orgId: "",
        registrationStatus: "Pending",
        denialReason: "",
        networkEmail: "",
        unitPhone: ""
      });
      if (form.bootstrapCode.trim()) {
        try {
          await actor.assignCallerUserRole(principal, UserRole.admin);
          await actor.updateUserProfile({
            principalId: principal,
            name: formattedName,
            rank: form.rank.trim(),
            email: form.email.trim(),
            orgRole: form.orgRole.trim(),
            clearanceLevel: 4n,
            isS2Admin: true,
            isValidatedByCommander: false,
            registered: true,
            avatarUrl: void 0,
            lastName: form.lastName.trim(),
            firstName: form.firstName.trim(),
            middleInitial: form.mi.trim(),
            branch,
            rankCategory: category,
            dodId: "",
            mos: "",
            uic: "",
            orgId: "",
            registrationStatus: "Active",
            denialReason: "",
            networkEmail: "",
            unitPhone: ""
          });
          await actor.validateS2Admin(principal);
        } catch {
        }
      }
      void navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  const hasRealIdentity = !!identity && !identity.getPrincipal().isAnonymous();
  const isActorLoading = hasRealIdentity && isFetching;
  if (isActorLoading) {
    if (sessionTimedOut) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex min-h-screen flex-col items-center justify-center gap-5",
          style: { backgroundColor: "#0a0e1a" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-14 w-14 items-center justify-center rounded-full border",
                style: { borderColor: "#ef4444", backgroundColor: "#1a0a0a" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-7 w-7", style: { color: "#ef4444" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "font-mono text-sm font-semibold uppercase tracking-widest",
                  style: { color: "#fca5a5" },
                  children: "Session timed out"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-muted-foreground", children: "Session initialization timed out. This may be a network issue." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": "registration.retry_button",
                onClick: () => window.location.reload(),
                className: "flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-red-900/30",
                style: { borderColor: "#ef4444", color: "#fca5a5" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                  "Retry"
                ]
              }
            )
          ]
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex min-h-screen flex-col items-center justify-center gap-4",
        style: { backgroundColor: "#0a0e1a" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7 text-amber" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-amber" }),
            "Establishing secure session..."
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex min-h-screen flex-col items-center justify-center px-4",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 opacity-5",
            style: {
              backgroundImage: "linear-gradient(oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "font-mono text-[10px] uppercase tracking-wider",
              style: { color: "#f59e0b" },
              children: "Step 1 of 3: Complete Profile"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col items-center gap-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7 text-amber" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground", children: "Personnel Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-muted-foreground", children: "Complete your profile to access the system" })
          ] }),
          isFirstUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mb-5 flex items-start gap-3 rounded border px-4 py-3",
              style: {
                backgroundColor: "rgba(245,158,11,0.06)",
                borderColor: "rgba(245,158,11,0.3)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CircleAlert,
                  {
                    className: "mt-0.5 h-4 w-4 shrink-0",
                    style: { color: "#f59e0b" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] leading-relaxed text-amber-400/80", children: [
                  "You appear to be the first person to register on this workspace. If you are the designated system administrator, complete registration then click",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-400", children: "‘Establish Your Workspace’" }),
                  " ",
                  "to set up the S2 role and unit."
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "form",
            {
              onSubmit: (e) => void handleSubmit(e),
              className: "rounded-lg border border-border bg-card p-6 shadow-2xl",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-xs uppercase tracking-wider text-muted-foreground", children: "Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_64px] gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70", children: "Last" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "registration.last_name.input",
                          value: form.lastName,
                          onChange: (e) => handleChange("lastName", e.target.value),
                          placeholder: "SMITH",
                          className: "border-input bg-secondary font-mono text-sm uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary",
                          autoComplete: "family-name"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70", children: "First" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "registration.first_name.input",
                          value: form.firstName,
                          onChange: (e) => handleChange("firstName", e.target.value),
                          placeholder: "John",
                          className: "border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary",
                          autoComplete: "given-name"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70", children: "MI" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "registration.mi.input",
                          value: form.mi,
                          onChange: (e) => handleChange("mi", e.target.value.slice(0, 1)),
                          placeholder: "A",
                          maxLength: 1,
                          className: "border-input bg-secondary font-mono text-sm text-center uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary",
                          autoComplete: "additional-name"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] text-slate-500", children: [
                    "Will display as:",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-300", children: namePreview || `${form.rank || "RANK"} ${form.lastName.toUpperCase() || "LAST"}, ${form.firstName || "First"}${form.mi ? ` ${form.mi.toUpperCase()}` : ""}` })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  RankSelector,
                  {
                    branch,
                    category,
                    rank: form.rank,
                    onBranchChange: (v) => {
                      setBranch(v);
                      setCategory("");
                      handleChange("rank", "");
                    },
                    onCategoryChange: (v) => {
                      setCategory(v);
                      handleChange("rank", "");
                    },
                    onRankChange: (v) => handleChange("rank", v),
                    variant: "registration"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: "reg-email",
                      className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
                      children: "Email Address"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "reg-email",
                      "data-ocid": "registration.email.input",
                      type: "email",
                      value: form.email,
                      onChange: (e) => handleChange("email", e.target.value),
                      placeholder: "j.smith@secure.mil",
                      className: "border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary",
                      autoComplete: "email"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: "reg-orgRole",
                      className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
                      children: "Organizational Role"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "reg-orgRole",
                      "data-ocid": "registration.org_role.input",
                      type: "text",
                      value: form.orgRole,
                      onChange: (e) => handleChange("orgRole", e.target.value),
                      placeholder: "Intelligence Analyst",
                      className: "border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "registration.bootstrap_code.toggle",
                      className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors",
                      onClick: () => setShowBootstrapCode((v) => !v),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ChevronDown,
                          {
                            className: cn(
                              "h-3 w-3 transition-transform",
                              showBootstrapCode && "rotate-180"
                            )
                          }
                        ),
                        "I am the designated S2 administrator"
                      ]
                    }
                  ),
                  showBootstrapCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Label,
                      {
                        htmlFor: "reg-bootstrap",
                        className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
                        children: [
                          "Commander Authorization Code",
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "(optional)" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "reg-bootstrap",
                        "data-ocid": "registration.bootstrap_code.input",
                        type: "text",
                        value: form.bootstrapCode,
                        onChange: (e) => handleChange("bootstrapCode", e.target.value),
                        placeholder: "Provided by your commander or S2",
                        className: "border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-muted-foreground/50", children: "Only required for initial system activation" })
                  ] })
                ] }),
                error && /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: error }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "registration.submit_button",
                    type: "submit",
                    className: "mt-2 h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
                    disabled: isSubmitting,
                    children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                      "Registering..."
                    ] }) : "Register Personnel"
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center font-mono text-xs text-muted-foreground/40", children: "Registration is monitored. Unauthorized access is prohibited." })
        ] })
      ]
    }
  );
}
export {
  RegistrationGatePage as default
};
