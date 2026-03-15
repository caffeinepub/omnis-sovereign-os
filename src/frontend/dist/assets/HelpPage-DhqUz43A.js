import { j as jsxRuntimeExports, L as Link, C as CircleHelp, p as FileText, M as MessageSquare, U as Users, k as Mail, S as Shield, F as FolderOpen } from "./index-3JmW1yt2.js";
import { T as TopNav } from "./TopNav-DiCFNdIt.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-B9EiF7kq.js";
import { S as ShieldCheck } from "./shield-check-DrbpLa19.js";
import { H as HardDrive } from "./hard-drive-B6boi_HR.js";
import { K as Key } from "./key-Bz_DPHlL.js";
import "./displayName-C1ThBuVF.js";
import "./chevron-down-DIFMpEfn.js";
import "./check-BjjR4Zqv.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-CDFR456G.js";
function Section({
  icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded border",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 border-b px-5 py-3.5",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-500", children: icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-white", children: title })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-4", children })
      ]
    }
  );
}
function ModuleCard({
  icon,
  name,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 rounded border px-4 py-3",
      style: { backgroundColor: "#0a111f", borderColor: "#1e2d45" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-amber-500 shrink-0", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] font-semibold uppercase tracking-wider text-white", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500", children: description })
        ] })
      ]
    }
  );
}
function ShortcutRow({
  keys,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between gap-4 py-2.5 border-b last:border-b-0",
      style: { borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-400", children: action }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 shrink-0", children: keys.map((k, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static shortcut key list, order never changes
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 font-mono text-[9px] text-slate-600", children: "then" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "kbd",
              {
                className: "rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-300",
                style: {
                  backgroundColor: "#1a2235",
                  border: "1px solid #2a3347"
                },
                children: k
              }
            )
          ] }, i)
        )) })
      ]
    }
  );
}
function HelpPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "help.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", "data-ocid": "help.hub.link", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Help" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { className: "h-6 w-6", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Help & Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: "In-app documentation and guidance" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Section,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
              title: "Platform Overview",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: "Omnis Sovereign OS" }),
                  " ",
                  "is an enterprise sovereign cloud platform for military and corporate organizations — a replacement for Microsoft 365 tools running on the",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: "Internet Computer (ICP)" }),
                  "."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 font-mono text-xs leading-relaxed text-slate-400", children: [
                  "Each deployment is",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-semibold", children: "fully sovereign" }),
                  " ",
                  "— tamperproof, unstoppable, and under the control of the deploying unit. No third-party cloud provider can access, modify, or take down your data. The canister runs on-chain and is owned by your organization."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-3 gap-2", children: [
                  { label: "Tamperproof", desc: "On-chain Motoko backend" },
                  { label: "Unstoppable", desc: "No central point of failure" },
                  { label: "Sovereign", desc: "Your keys, your data" }
                ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "rounded border px-3 py-2 text-center",
                    style: { backgroundColor: "#0a111f", borderColor: "#1e2d45" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500", children: item.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[9px] text-slate-600", children: item.desc })
                    ]
                  },
                  item.label
                )) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Section,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-4 w-4" }),
              title: "Module Guide",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                    name: "Documents",
                    description: "Classified document management with two-gate access control: clearance level + need-to-know. S2 admins manage folder permissions."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                    name: "Messaging",
                    description: "Secure internal direct messaging. Inbox and sent views, threaded replies, and read receipts. All messages stay on-chain."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-3.5 w-3.5" }),
                    name: "File Storage",
                    description: "Drag-and-drop secure file vault. Files are stored in blob storage and linked to your profile. Persistent across sessions."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
                    name: "Personnel Directory",
                    description: "Browse all registered personnel with rank, clearance level, and org role. S2 admins can edit sensitive profile fields."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
                    name: "Email Directory",
                    description: "Searchable contact directory for all personnel with email addresses and organizational roles."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ModuleCard,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
                    name: "Access Monitoring",
                    description: "S2-only. Real-time anomaly event feed, audit trail, folder activity log, and AI Smart System threat intelligence demo."
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Section,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "h-4 w-4" }),
              title: "Keyboard Shortcuts",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShortcutRow, { keys: ["G", "H"], action: "Go to Hub" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShortcutRow, { keys: ["G", "D"], action: "Go to Documents" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShortcutRow, { keys: ["G", "M"], action: "Go to Messaging" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShortcutRow, { keys: ["G", "N"], action: "Go to Notifications" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShortcutRow, { keys: ["Ctrl+K"], action: "Open command palette" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mt-4 flex items-start gap-2 rounded border px-3 py-2.5",
                    style: {
                      backgroundColor: "rgba(100,116,139,0.06)",
                      borderColor: "#1a2235"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-600", children: "Additional shortcuts and a full command palette are planned for a future session." })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }), title: "Security Model", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5", children: "Two-Gate Access Control" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-400", children: "Document access requires passing two independent checks:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "mt-2 space-y-1 pl-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "font-mono text-[10px] text-slate-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 font-bold", children: "Gate 1 — Clearance Level:" }),
                  " ",
                  "Your clearance must meet or exceed the folder's required level."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "font-mono text-[10px] text-slate-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 font-bold", children: "Gate 2 — Need-to-Know:" }),
                  " ",
                  "You must be explicitly granted access to the folder by an S2 admin."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5", children: "S2 Admin Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-400", children: "S2 administrators have full system access. They manage clearance levels, folder permissions, need-to-know grants, and anomaly event oversight. S2 admin role requires explicit commander validation." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5", children: "Commander Validation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-400", children: "Critical roles (S2 admin, commander-level access) require a validation code issued by the commander. This two-person integrity model prevents unilateral privilege escalation." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Section,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
              title: "Deployment & Sovereignty",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] leading-relaxed text-slate-400", children: [
                  "Omnis runs on the",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: "Internet Computer Protocol (ICP)" }),
                  ", a decentralized blockchain network operated by the DFINITY Foundation. Your data lives in a canister smart contract — a self-contained execution environment that cannot be modified or taken offline by any single entity."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded border px-3 py-2.5",
                      style: { backgroundColor: "#0a111f", borderColor: "#1e2d45" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-white mb-1", children: "Current: Single-Tenant" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-slate-500", children: "One deployment per unit/organization. Full data isolation by default. Recommended for initial deployments." })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded border px-3 py-2.5",
                      style: {
                        backgroundColor: "rgba(139,92,246,0.06)",
                        borderColor: "rgba(139,92,246,0.25)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300", children: "Roadmap: Multi-Tenant" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-slate-500", children: "One deployment hosting multiple org spaces. Brigade-level management with battalion sub-orgs. Requires future backend update." })
                      ]
                    }
                  )
                ] })
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
  HelpPage as default
};
