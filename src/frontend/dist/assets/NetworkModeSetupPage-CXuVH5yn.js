import { f as createLucideIcon, d as useNetworkMode, b as useNavigate, r as reactExports, j as jsxRuntimeExports, a5 as TriangleAlert } from "./index-Nuoc5gUR.js";
import { N as NETWORK_MODE_CONFIGS } from "./constants-O6cGduIW.js";
import { m as motion } from "./proxy-OyPDS7Hl.js";
import { S as ShieldCheck } from "./shield-check-9efrvzwA.js";
import { C as CircleCheck } from "./circle-check-DmqPsjUD.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode);
const SENSITIVITY_LABELS = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" }
};
const MILITARY_MODES = ["military-nipr", "military-sipr"];
const CORPORATE_MODES = [
  "corporate-standard",
  "corporate-secure"
];
function ModeCard({
  mode,
  selected,
  onSelect
}) {
  const config = NETWORK_MODE_CONFIGS[mode];
  const isMilitary = config.group === "military";
  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
  const accentBg = isMilitary ? "rgba(59,130,246,0.08)" : "rgba(139,92,246,0.08)";
  const accentBorder = isMilitary ? "rgba(59,130,246,0.3)" : "rgba(139,92,246,0.3)";
  const sensitivity = SENSITIVITY_LABELS[config.monitoringSensitivity];
  const ocidMap = {
    "military-nipr": "network_mode_setup.military_nipr.card",
    "military-sipr": "network_mode_setup.military_sipr.card",
    "corporate-standard": "network_mode_setup.corporate_standard.card",
    "corporate-secure": "network_mode_setup.corporate_secure.card"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      type: "button",
      "data-ocid": ocidMap[mode],
      onClick: onSelect,
      whileHover: { scale: 1.015 },
      whileTap: { scale: 0.985 },
      className: "relative w-full rounded border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500/40",
      style: {
        backgroundColor: selected ? "rgba(245,158,11,0.07)" : "#0f1626",
        borderColor: selected ? "#f59e0b" : accentBorder,
        boxShadow: selected ? "0 0 0 1px rgba(245,158,11,0.15), 0 0 16px rgba(245,158,11,0.06)" : "none"
      },
      children: [
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
          CircleCheck,
          {
            className: "absolute right-3 top-3 h-4 w-4",
            style: { color: "#f59e0b" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
            style: {
              backgroundColor: accentBg,
              color: accentColor,
              border: `1px solid ${accentBorder}`
            },
            children: config.shortCode
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-bold uppercase tracking-[0.15em] text-white", children: config.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-[11px] leading-relaxed text-slate-400", children: config.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Monitoring:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "font-mono text-[9px] uppercase tracking-widest font-semibold",
              style: { color: sensitivity.color },
              children: sensitivity.label
            }
          )
        ] })
      ]
    }
  );
}
function NetworkModeSetupPage() {
  const { setMode } = useNetworkMode();
  const navigate = useNavigate();
  const [selected, setSelected] = reactExports.useState(null);
  function handleConfirm() {
    if (!selected) return;
    setMode(selected);
    void navigate({ to: "/settings" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "network_mode_setup.page",
      className: "flex min-h-screen flex-col items-center justify-center px-4 py-12",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none fixed inset-0 z-0",
            style: {
              background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(245,158,11,0.06) 0%, transparent 70%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: -16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
              className: "mb-8 flex flex-col items-center text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                    style: {
                      backgroundColor: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7", style: { color: "#f59e0b" } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-2xl font-bold uppercase tracking-[0.25em] text-white", children: "Network Mode Setup" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Select your deployment network type" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: {
                duration: 0.4,
                delay: 0.08,
                ease: [0.25, 0.1, 0.25, 1]
              },
              className: "mb-5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-px flex-1",
                      style: { backgroundColor: "rgba(59,130,246,0.2)" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/70", children: "Military" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-px flex-1",
                      style: { backgroundColor: "rgba(59,130,246,0.2)" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: MILITARY_MODES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModeCard,
                  {
                    mode: m,
                    selected: selected === m,
                    onSelect: () => setSelected(m)
                  },
                  m
                )) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: {
                duration: 0.4,
                delay: 0.14,
                ease: [0.25, 0.1, 0.25, 1]
              },
              className: "mb-6",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-px flex-1",
                      style: { backgroundColor: "rgba(139,92,246,0.2)" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70", children: "Corporate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-px flex-1",
                      style: { backgroundColor: "rgba(139,92,246,0.2)" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: CORPORATE_MODES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModeCard,
                  {
                    mode: m,
                    selected: selected === m,
                    onSelect: () => setSelected(m)
                  },
                  m
                )) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] },
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "network_mode_setup.confirm_button",
                    onClick: handleConfirm,
                    disabled: !selected,
                    className: "w-full rounded border px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                    style: {
                      backgroundColor: selected ? "#f59e0b" : "#1a2235",
                      color: selected ? "#0a0e1a" : "#64748b",
                      borderColor: selected ? "#f59e0b" : "#1a2235"
                    },
                    children: selected ? `Confirm — ${NETWORK_MODE_CONFIGS[selected].shortCode}` : "Select a Mode to Continue"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-start gap-2.5 rounded border px-4 py-3",
                    style: {
                      backgroundColor: "rgba(100,116,139,0.05)",
                      borderColor: "#1a2235"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-600", children: "This can be changed later in Settings (S2 admin only). This setting is currently stored locally until a future backend update." })
                    ]
                  }
                ),
                selected === "military-sipr" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    className: "flex items-start gap-2.5 rounded border px-4 py-3",
                    style: {
                      backgroundColor: "rgba(239,68,68,0.05)",
                      borderColor: "rgba(239,68,68,0.25)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-red-400/80", children: "SIPR mode enables maximum monitoring sensitivity. All document access, messaging, and user activity will be subject to heightened anomaly detection." })
                    ]
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
}
export {
  NetworkModeSetupPage as default
};
