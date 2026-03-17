import { f as createLucideIcon, a as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, p as ue } from "./index-CnBkd1vF.js";
import { S as ShieldAlert } from "./shield-alert-jcEDpY6b.js";
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
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m14.5 9.5-5 5", key: "17q4r4" }],
  ["path", { d: "m9.5 9.5 5 5", key: "18nt4w" }]
];
const ShieldX = createLucideIcon("shield-x", __iconNode);
function PendingVerificationPage() {
  const { clear, identity } = useInternetIdentity();
  const principalStr = identity == null ? void 0 : identity.getPrincipal().toString();
  const [denialRecord, setDenialRecord] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!principalStr) return;
    const raw = localStorage.getItem(`omnis_denial_${principalStr}`);
    if (raw) {
      try {
        setDenialRecord(JSON.parse(raw));
      } catch {
      }
    }
  }, [principalStr]);
  const handleSignOut = () => {
    clear();
    window.location.href = "/login";
  };
  const handleRequestReview = () => {
    ue.info("Contact your S2 or security officer to appeal this decision.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center",
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex max-w-md flex-col items-center gap-8", children: denialRecord ? (
          /* ── Denied state ─────────────────────────────────────── */
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_40px_rgba(239,68,68,0.2)]",
                style: {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderColor: "rgba(239, 68, 68, 0.35)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldX, { className: "h-10 w-10 text-red-400" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-2xl font-bold uppercase tracking-widest text-red-400", children: "ACCESS DENIED" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm text-slate-400", children: "Your access request was denied." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-64 items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-px flex-1",
                  style: { backgroundColor: "#1a2235" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "DENIED" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-px flex-1",
                  style: { backgroundColor: "#1a2235" }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "w-full rounded border px-4 py-4 text-left",
                style: {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderColor: "rgba(239, 68, 68, 0.3)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 font-mono text-[9px] uppercase tracking-widest text-red-400/70", children: "Reason" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-relaxed text-slate-300", children: denialRecord.reason })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm font-mono text-xs leading-relaxed text-slate-500", children: "Contact your S2 or security officer to appeal this decision." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "pending.request_review_button",
                onClick: handleRequestReview,
                className: "rounded border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all hover:bg-amber-500/10",
                style: {
                  borderColor: "rgba(245,158,11,0.4)",
                  color: "#f59e0b"
                },
                children: "Request Review"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "pending.sign_out_button",
                onClick: handleSignOut,
                className: "font-mono text-xs uppercase tracking-widest text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline",
                children: "Sign Out"
              }
            )
          ] })
        ) : (
          /* ── Pending state ────────────────────────────────────── */
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_40px_oklch(0.72_0.175_70_/_0.25)]",
                style: {
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  borderColor: "rgba(245, 158, 11, 0.35)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-10 w-10", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  className: "font-mono text-2xl font-bold uppercase tracking-widest",
                  style: { color: "#f0f4ff" },
                  children: "PENDING VERIFICATION"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm text-slate-400", children: "Your access is pending S2 verification." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-64 items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-px flex-1",
                  style: { backgroundColor: "#1a2235" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "HOLD" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-px flex-1",
                  style: { backgroundColor: "#1a2235" }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm font-mono text-xs leading-relaxed text-slate-500", children: "You will be notified when your account is activated. If you believe this is an error, contact your S2 or security officer." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex w-full items-center gap-3 rounded border px-4 py-3",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-2 w-2 animate-pulse rounded-full",
                      style: { backgroundColor: "#f59e0b" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Awaiting S2 approval" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "pending.sign_out_button",
                onClick: handleSignOut,
                className: "font-mono text-xs uppercase tracking-widest text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline",
                children: "Sign Out"
              }
            )
          ] })
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-6 font-mono text-xs text-slate-700", children: "OMNIS-OS · ACCESS RESTRICTED" })
      ]
    }
  );
}
export {
  PendingVerificationPage as default
};
