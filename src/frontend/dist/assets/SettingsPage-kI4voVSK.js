import { b as useNavigate, h as usePermissions, d as useNetworkMode, a as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, L as Link, o as Settings, U as User, l as Shield, a7 as Globe, m as Bell } from "./index-BlEGMROs.js";
import { T as TopNav, L as Lock } from "./TopNav-D8UQSmDX.js";
import { B as Building2, e as Badge } from "./displayName-Dizd79pw.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-CXZKGbs0.js";
import { S as Switch } from "./switch-CXr_kaVY.js";
import { C as CLEARANCE_LABELS, N as NETWORK_MODE_CONFIGS } from "./constants-O6cGduIW.js";
import { C as Clock } from "./clock-zwQHNEHU.js";
import { C as CircleAlert } from "./circle-alert-BVMyLZ_7.js";
import "./check-BXhHek9h.js";
import "./chevron-right-D4lTJ-EH.js";
function SectionCard({
  icon,
  title,
  children,
  badge,
  "data-ocid": dataOcid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded border",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      "data-ocid": dataOcid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 border-b px-5 py-3.5",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-500", children: icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white", children: title }),
              badge && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                  style: {
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)"
                  },
                  children: badge
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-4", children })
      ]
    }
  );
}
function FieldRow({
  label,
  value,
  locked
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between py-2.5 border-b last:border-b-0",
      style: { borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-300", children: value }),
          locked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-2.5 w-2.5 text-slate-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "S2 Managed" })
          ] })
        ] })
      ]
    }
  );
}
const SENSITIVITY_LABELS = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" }
};
const NOTIFICATION_PREFS = [
  {
    key: "security_alerts",
    label: "Security Alerts",
    description: "Anomaly detections and access warnings"
  },
  {
    key: "announcements",
    label: "Announcements",
    description: "Broadcasts from S2 and command"
  },
  {
    key: "direct_messages",
    label: "Direct Messages",
    description: "Private and group messages"
  },
  {
    key: "task_assignments",
    label: "Task Assignments",
    description: "New tasks assigned to you"
  },
  {
    key: "system_events",
    label: "System Events",
    description: "Platform and canister updates"
  },
  {
    key: "access_requests",
    label: "Access Requests",
    description: "Cross-UIC access requests"
  }
];
function getDefaultNotifPrefs() {
  return {
    security_alerts: true,
    announcements: true,
    direct_messages: true,
    task_assignments: true,
    system_events: true,
    access_requests: true
  };
}
function SettingsPage() {
  var _a;
  const navigate = useNavigate();
  const { profile, clearanceLevel, isS2Admin } = usePermissions();
  const { mode: networkMode, isSet: networkModeIsSet } = useNetworkMode();
  const { identity } = useInternetIdentity();
  const principalId = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "unknown";
  const notifStorageKey = `omnis_notification_prefs_${principalId}`;
  const [notifPrefs, setNotifPrefs] = reactExports.useState(
    () => {
      try {
        const stored = localStorage.getItem(notifStorageKey);
        if (stored) return { ...getDefaultNotifPrefs(), ...JSON.parse(stored) };
      } catch {
      }
      return getDefaultNotifPrefs();
    }
  );
  function toggleNotifPref(key, value) {
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    localStorage.setItem(notifStorageKey, JSON.stringify(next));
  }
  const clearanceLabel = CLEARANCE_LABELS[clearanceLevel] ?? `Level ${clearanceLevel}`;
  const displayName = ((_a = profile == null ? void 0 : profile.name) == null ? void 0 : _a.trim()) || "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "settings.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", "data-ocid": "settings.hub.link", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Settings" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Settings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Platform configuration" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }), title: "Account", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Display Name", value: displayName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  label: "Clearance Level",
                  value: `${clearanceLevel} — ${clearanceLabel}`,
                  locked: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  label: "Role",
                  value: isS2Admin ? "S2 Administrator" : (profile == null ? void 0 : profile.orgRole) || "—",
                  locked: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Email", value: (profile == null ? void 0 : profile.email) || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "mt-4 flex items-start gap-2 rounded border px-3 py-2.5",
                style: {
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.25)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 shrink-0 text-amber-500/70 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-amber-400/70", children: "Sensitive fields (clearance level, rank, S2 admin role) are managed by your S2 administrator. Contact your S2 to update these values." })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }), title: "Security", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  label: "Identity Provider",
                  value: "Internet Identity (ICP)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  label: "Session",
                  value: "Delegated identity — auto-expires"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  label: "Authentication",
                  value: "Hardware key / biometric"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "mt-4 flex items-start gap-2 rounded border px-3 py-2.5",
                style: {
                  backgroundColor: "rgba(100,116,139,0.06)",
                  borderColor: "#1a2235"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-500", children: "Advanced security settings (session timeout configuration, MFA policy, CAC integration) require a future backend update." })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionCard,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" }),
              title: "Network Mode",
              "data-ocid": "settings.network_mode.card",
              children: networkModeIsSet && networkMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                (() => {
                  const config = NETWORK_MODE_CONFIGS[networkMode];
                  const isMilitary = config.group === "military";
                  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
                  const accentBg = isMilitary ? "rgba(59,130,246,0.08)" : "rgba(139,92,246,0.08)";
                  const accentBorder = isMilitary ? "rgba(59,130,246,0.3)" : "rgba(139,92,246,0.3)";
                  const sensitivity = SENSITIVITY_LABELS[config.monitoringSensitivity];
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                          style: {
                            backgroundColor: accentBg,
                            color: accentColor,
                            border: `1px solid ${accentBorder}`
                          },
                          children: config.shortCode
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-semibold uppercase tracking-widest text-white", children: config.label })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 font-mono text-[11px] leading-relaxed text-slate-400", children: config.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Monitoring Sensitivity:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "font-mono text-[9px] uppercase tracking-widest font-semibold",
                          style: { color: sensitivity.color },
                          children: sensitivity.label
                        }
                      )
                    ] })
                  ] });
                })(),
                isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "settings.network_mode.change_button",
                    onClick: () => void navigate({ to: "/network-mode-setup" }),
                    className: "mt-4 flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                    style: { borderColor: "rgba(245,158,11,0.3)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5" }),
                      "Change Mode"
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-start gap-2.5 rounded border px-3 py-2.5",
                  style: {
                    backgroundColor: "rgba(245,158,11,0.05)",
                    borderColor: "rgba(245,158,11,0.25)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-amber-400/80", children: "Network mode not configured. Contact your S2 admin." }),
                      isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          "data-ocid": "settings.network_mode.change_button",
                          onClick: () => void navigate({ to: "/network-mode-setup" }),
                          className: "mt-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 underline underline-offset-2 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2",
                          children: "Configure Now →"
                        }
                      )
                    ] })
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            SectionCard,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
              title: "Organization",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Deployment Model", value: "Single-Tenant" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { label: "Data Isolation", value: "Per-deployment (full)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FieldRow,
                    {
                      label: "Multi-Unit Support",
                      value: "One deployment per unit"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-4 rounded border px-4 py-3 space-y-2",
                    style: {
                      backgroundColor: "#0a111f",
                      borderColor: "#1e2d45"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5 text-slate-500 shrink-0" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Multi-Tenant Org Namespacing" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            className: "ml-auto font-mono text-[9px] uppercase tracking-widest",
                            style: {
                              backgroundColor: "rgba(139,92,246,0.12)",
                              color: "#a78bfa",
                              border: "1px solid rgba(139,92,246,0.3)"
                            },
                            children: "Roadmap"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-500", children: "Option B: one deployment serving multiple units/organizations with hard data isolation. Each unit would have its own org namespace, scoped users, and S2 admin. Cross-org access requires explicit multi-org grant." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-slate-600", children: "Requires a future Motoko backend update (Organization entity, orgId scoping on all queries)." })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionCard,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
              title: "Notifications",
              "data-ocid": "settings.notifications.section",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-500", children: "Choose which notification types you receive. Changes are saved immediately and stored locally." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: NOTIFICATION_PREFS.map((pref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center justify-between gap-4 rounded border px-4 py-3",
                    style: {
                      borderColor: "#1a2235",
                      backgroundColor: "#0a111f"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-medium uppercase tracking-wider text-white", children: pref.label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: pref.description })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Switch,
                        {
                          "data-ocid": `settings.notifications.${pref.key}.switch`,
                          checked: notifPrefs[pref.key],
                          onCheckedChange: (v) => toggleNotifPref(pref.key, v),
                          className: "shrink-0"
                        }
                      )
                    ]
                  },
                  pref.key
                )) })
              ] })
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
  SettingsPage as default
};
