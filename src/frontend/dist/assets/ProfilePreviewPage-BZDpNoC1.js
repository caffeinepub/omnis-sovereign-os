import { f as createLucideIcon, b as useNavigate, j as jsxRuntimeExports, a7 as User, l as Mail, a6 as Calendar, B as Button } from "./index-Dm1hd-rR.js";
import { T as TopNav, L as Lock } from "./TopNav-DdQyQomH.js";
import { V as VerifiedBadge, C as ClearanceBadge } from "./VerifiedBadge-D2Awu9B0.js";
import { S as ShieldCheck } from "./shield-check-BmGSdE3s.js";
import { B as Building2 } from "./building-2-CrvU43gB.js";
import "./displayName-CSKLG_nZ.js";
import "./chevron-down-C4YFpDW9.js";
import "./check-UB5_kp0G.js";
import "./constants-O6cGduIW.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", key: "7n84p3" }]
];
const AtSign = createLucideIcon("at-sign", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
const DEMO = {
  name: "1SG GRACIE, Nicholas J",
  firstName: "Nicholas",
  lastName: "GRACIE",
  mi: "J",
  rank: "First Sergeant (1SG)",
  branch: "Army",
  category: "Enlisted",
  payGrade: "E-8",
  email: "nicholas.j.gracie.mil@army.mil",
  unit: "HHC, 1-501ST PIR",
  orgRole: "First Sergeant",
  clearanceLevel: 4,
  clearanceLabel: "TS/SCI",
  verifiedNote: "Verified by S2 — fields locked",
  joined: "Omnis Sovereign OS"
};
function FieldRow({
  icon: Icon,
  label,
  value,
  locked
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 rounded border px-4 py-3",
      style: { backgroundColor: "#1a2235", borderColor: "#243048" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate font-mono text-xs text-white", children: value })
        ] }),
        locked && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mt-0.5 h-3 w-3 shrink-0 text-slate-600" })
      ]
    }
  );
}
function ProfilePreviewPage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "profile_preview.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "profile_preview.back_button",
              onClick: () => void navigate({ to: "/personnel" }),
              className: "mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-amber-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
                "Back to Personnel"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mb-6 flex items-center gap-3 rounded border px-4 py-2.5",
              style: {
                backgroundColor: "rgba(245,158,11,0.06)",
                borderColor: "#f59e0b"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 shrink-0 text-amber-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-amber-400", children: "Profile Preview — Demo data only. This profile is not stored in the backend." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-col items-center gap-4 border-b px-6 py-8 sm:flex-row sm:items-start",
                    style: { borderColor: "#1a2235" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 font-mono text-2xl font-bold tracking-wider",
                          style: {
                            backgroundColor: "rgba(245,158,11,0.1)",
                            borderColor: "rgba(245,158,11,0.4)",
                            color: "#f59e0b"
                          },
                          children: "NJG"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 sm:justify-start", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.15em] text-white", children: DEMO.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, {})
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-sm uppercase tracking-wider text-slate-400", children: DEMO.rank }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-xs text-slate-500", children: [
                          DEMO.branch,
                          " · ",
                          DEMO.category,
                          " · Pay Grade ",
                          DEMO.payGrade
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ClearanceBadge, { level: DEMO.clearanceLevel }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-amber-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-amber-500/80", children: "S2 Verified" })
                          ] })
                        ] })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 p-6 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FieldRow,
                    {
                      icon: User,
                      label: "Full Name (DoD Standard)",
                      value: `${DEMO.lastName}, ${DEMO.firstName} ${DEMO.mi}`,
                      locked: true
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FieldRow,
                    {
                      icon: Star,
                      label: "Rank / Pay Grade",
                      value: `${DEMO.rank} · ${DEMO.payGrade}`,
                      locked: true
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { icon: Building2, label: "Unit", value: DEMO.unit }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FieldRow,
                    {
                      icon: User,
                      label: "Organizational Role",
                      value: DEMO.orgRole
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { icon: Mail, label: "Email", value: DEMO.email }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FieldRow,
                    {
                      icon: AtSign,
                      label: "Branch",
                      value: `${DEMO.branch} — ${DEMO.category}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-start gap-3 rounded border px-4 py-3 sm:col-span-2",
                      style: { backgroundColor: "#1a2235", borderColor: "#243048" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/60" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Clearance Level" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-amber-500", children: DEMO.clearanceLabel })
                        ] })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mx-6 mb-6 flex items-center gap-2 rounded border px-4 py-2.5",
                    style: {
                      backgroundColor: "rgba(245,158,11,0.04)",
                      borderColor: "#2a3347"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3 shrink-0 text-slate-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: [
                        DEMO.verifiedNote,
                        ". Name and rank are read-only for this user. S2 admin can edit."
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4",
                    style: { borderColor: "#1a2235" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 text-slate-600" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: [
                          "Account registered in ",
                          DEMO.joined
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "button",
                            variant: "outline",
                            "data-ocid": "profile_preview.back_button_footer",
                            className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                            style: { borderColor: "#2a3347" },
                            onClick: () => void navigate({ to: "/personnel" }),
                            children: "Back"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "button",
                            "data-ocid": "profile_preview.send_message.button",
                            className: "font-mono text-xs uppercase tracking-wider",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            onClick: () => void navigate({ to: "/messages" }),
                            children: "Send Message"
                          }
                        )
                      ] })
                    ]
                  }
                )
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "border-t px-4 py-4 text-center",
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
export {
  ProfilePreviewPage as default
};
