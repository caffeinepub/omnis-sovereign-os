import { f as createLucideIcon, h as usePermissions, r as reactExports, j as jsxRuntimeExports, L as Link, B as Button, o as ue } from "./index-3JmW1yt2.js";
import { T as TopNav, c as Skeleton, B as Badge, e as formatDateTime } from "./TopNav-DiCFNdIt.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-B9EiF7kq.js";
import { T as Table, d as TableHeader, b as TableRow, e as TableHead, a as TableBody, c as TableCell } from "./table-yCZlK-ha.js";
import { k as useGovernanceLog, l as useWasmHash, m as useCommanderAuthCodeStatus, n as useGenerateCommanderAuthCode, o as useRotateCommanderAuthCode } from "./useQueries-lcz0Dcra.js";
import { S as ShieldCheck } from "./shield-check-DrbpLa19.js";
import { C as Copy } from "./copy-kCFr8L5f.js";
import { K as Key } from "./key-Bz_DPHlL.js";
import { L as LoaderCircle } from "./loader-circle-Cnu8h2Il.js";
import { R as RefreshCw } from "./refresh-cw-CpmKAHdP.js";
import "./displayName-C1ThBuVF.js";
import "./chevron-down-DIFMpEfn.js";
import "./check-BjjR4Zqv.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-CDFR456G.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
];
const Hash = createLucideIcon("hash", __iconNode);
function truncateHash(h) {
  if (!h) return "—";
  if (h.length <= 20) return h;
  return `${h.slice(0, 10)}…${h.slice(-8)}`;
}
function GovernancePage() {
  const { isS2Admin } = usePermissions();
  const { data: govLog = [], isLoading: logLoading } = useGovernanceLog();
  const { data: wasmHash = "", isLoading: hashLoading } = useWasmHash();
  const { data: codeActive } = useCommanderAuthCodeStatus();
  const generateCode = useGenerateCommanderAuthCode();
  const rotateCode = useRotateCommanderAuthCode();
  const [generatedCode, setGeneratedCode] = reactExports.useState("");
  const [showCode, setShowCode] = reactExports.useState(false);
  async function handleGenerate() {
    try {
      const code = await generateCode.mutateAsync();
      setGeneratedCode(code);
      setShowCode(true);
    } catch {
    }
  }
  async function handleRotate() {
    try {
      const code = await rotateCode.mutateAsync();
      setGeneratedCode(code);
      setShowCode(true);
    } catch {
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "governance.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Governance" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Governance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: "System trust, audit trail, and authorization" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded border p-5",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-4 w-4 text-slate-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-bold uppercase tracking-widest text-slate-400", children: "Canister Wasm Hash" })
                  ] }),
                  hashLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Skeleton,
                    {
                      className: "h-6 w-full",
                      style: { backgroundColor: "#1a2235" }
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "code",
                      {
                        className: "flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-2 py-1.5 font-mono text-[10px] text-slate-300",
                        style: {
                          backgroundColor: "#0a0e1a",
                          borderColor: "#2a3347"
                        },
                        children: wasmHash || "Not published"
                      }
                    ),
                    wasmHash && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        className: "h-7 w-7 border p-0",
                        style: {
                          borderColor: "#2a3347",
                          backgroundColor: "transparent"
                        },
                        onClick: () => {
                          void navigator.clipboard.writeText(wasmHash);
                          ue.success("Hash copied");
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3 text-slate-400" })
                      }
                    )
                  ] })
                ]
              }
            ),
            isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded border p-5",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "h-4 w-4 text-slate-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-bold uppercase tracking-widest text-slate-400", children: "Commander Auth Code" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: "ml-auto font-mono text-[9px] uppercase tracking-wider",
                        style: {
                          backgroundColor: codeActive ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)",
                          color: codeActive ? "#22c55e" : "#64748b",
                          border: "none"
                        },
                        children: codeActive ? "Active" : "No code"
                      }
                    )
                  ] }),
                  showCode && generatedCode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "mb-3 rounded border px-3 py-2",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.05)",
                        borderColor: "rgba(245,158,11,0.3)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-wider text-slate-500", children: "Current code — share securely with designated S2" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 font-mono text-sm font-bold tracking-[0.15em] text-amber-400", children: generatedCode }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "sm",
                              variant: "outline",
                              className: "h-6 w-6 border p-0",
                              style: {
                                borderColor: "rgba(245,158,11,0.4)",
                                backgroundColor: "transparent"
                              },
                              onClick: () => {
                                void navigator.clipboard.writeText(generatedCode);
                                ue.success("Code copied");
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3 text-amber-400" })
                            }
                          )
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        "data-ocid": "governance.generate_code.primary_button",
                        className: "h-7 flex-1 font-mono text-[10px] uppercase tracking-wider",
                        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                        onClick: () => void handleGenerate(),
                        disabled: generateCode.isPending,
                        children: generateCode.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : "Generate"
                      }
                    ),
                    codeActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        "data-ocid": "governance.rotate_code.secondary_button",
                        className: "h-7 flex-1 border font-mono text-[10px] uppercase tracking-wider text-slate-400",
                        style: {
                          borderColor: "#2a3347",
                          backgroundColor: "transparent"
                        },
                        onClick: () => void handleRotate(),
                        disabled: rotateCode.isPending,
                        children: rotateCode.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-3 w-3" }),
                          "Rotate"
                        ] })
                      }
                    )
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-sm font-bold uppercase tracking-widest text-white", children: "Governance Event Log" }),
              logLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-slate-500" })
            ] }),
            logLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                "data-ocid": "governance.log.loading_state",
                className: "space-y-2",
                children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Skeleton,
                  {
                    className: "h-10 w-full rounded",
                    style: { backgroundColor: "#1a2235" }
                  },
                  i
                ))
              }
            ) : govLog.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "governance.log.empty_state",
                className: "flex flex-col items-center gap-3 rounded border py-12",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8 text-slate-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No governance events logged" })
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
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Event" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Description" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Timestamp" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Wasm" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: [...govLog].sort((a, b) => Number(b.timestamp - a.timestamp)).map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TableRow,
                    {
                      "data-ocid": `governance.log.item.${idx + 1}`,
                      style: { borderColor: "#1a2235" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400", children: r.eventType }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs font-mono text-xs text-slate-300", children: r.description }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[10px] text-slate-500", children: formatDateTime(r.timestamp) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[10px] text-slate-600", children: truncateHash(r.wasmHash) })
                      ]
                    },
                    r.recordId
                  )) })
                ] })
              }
            )
          ] })
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
  GovernancePage as default
};
