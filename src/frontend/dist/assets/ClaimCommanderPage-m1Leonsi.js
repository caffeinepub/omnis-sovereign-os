import { f as createLucideIcon, c as useExtActor, a as useInternetIdentity, b as useNavigate, r as reactExports, j as jsxRuntimeExports, a3 as TriangleAlert } from "./index-3JmW1yt2.js";
import { S as ShieldCheck } from "./shield-check-DrbpLa19.js";
import { C as CircleCheck } from "./circle-check-hFnLiwoJ.js";
import { L as LoaderCircle } from "./loader-circle-Cnu8h2Il.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode);
function ClaimCommanderPage() {
  const { actor } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = reactExports.useState(null);
  const [alreadyClaimed, setAlreadyClaimed] = reactExports.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = reactExports.useState(false);
  const [isClaiming, setIsClaiming] = reactExports.useState(false);
  const [claimed, setClaimed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const occupied = localStorage.getItem("omnis_commander_claimed") === "true";
    setAlreadyClaimed(occupied);
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw));
      } catch {
        setWorkspace(null);
      }
    }
  }, []);
  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    try {
      localStorage.setItem("omnis_commander_claimed", "true");
      if (actor && identity) {
        try {
          const allProfiles = await actor.getAllProfiles();
          const s2Admins = allProfiles.filter((p) => p.isS2Admin);
          const unitName = (workspace == null ? void 0 : workspace.name) ?? "this workspace";
          await Promise.all(
            s2Admins.map(
              (admin) => actor.createSystemNotification({
                id: crypto.randomUUID(),
                title: "Commander Role Claimed",
                body: `Commander role has been claimed for ${unitName}. Chain of Trust is now established.`,
                userId: admin.principalId,
                notificationType: "system",
                createdAt: BigInt(Date.now()),
                read: false,
                metadata: void 0
              })
            )
          );
        } catch {
        }
      }
      setClaimed(true);
      setShowConfirmDialog(false);
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2e3);
    } catch {
      setClaimed(true);
      setShowConfirmDialog(false);
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2e3);
    } finally {
      setIsClaiming(false);
    }
  };
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "claim_commander.back.button",
              onClick: () => void navigate({ to: "/" }),
              className: "mb-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-400",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5" }),
                "Return to Hub"
              ]
            }
          ),
          alreadyClaimed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border p-8 text-center shadow-2xl",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border",
                    style: {
                      backgroundColor: "rgba(245,158,11,0.1)",
                      borderColor: "rgba(245,158,11,0.4)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7", style: { color: "#f59e0b" } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Commander Seat Occupied" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-400", children: "The Commander role for this workspace has already been claimed." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "claim_commander.return.button",
                    onClick: () => void navigate({ to: "/" }),
                    className: "mt-5 h-10 w-full rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300",
                    style: { borderColor: "#2a3347" },
                    children: "Return to Hub"
                  }
                )
              ]
            }
          ),
          !alreadyClaimed && claimed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border p-8 text-center shadow-2xl",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border",
                    style: {
                      backgroundColor: "rgba(34,197,94,0.1)",
                      borderColor: "rgba(34,197,94,0.4)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-7 w-7 text-green-500" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Commander Role Claimed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-400", children: "The Chain of Trust is now established. Redirecting to the hub…" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-slate-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider", children: "Redirecting…" })
                ] })
              ]
            }
          ),
          !alreadyClaimed && !claimed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border p-6 shadow-2xl",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col items-center gap-3 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-14 w-14 items-center justify-center rounded-full border",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.1)",
                        borderColor: "rgba(245,158,11,0.4)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7", style: { color: "#f59e0b" } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-lg font-bold uppercase tracking-widest text-white", children: "Claim Commander Role" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "mb-4 rounded border px-4 py-3",
                    style: {
                      backgroundColor: "rgba(245,158,11,0.06)",
                      borderColor: "rgba(245,158,11,0.25)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TriangleAlert,
                        {
                          className: "mt-0.5 h-3.5 w-3.5 shrink-0",
                          style: { color: "#f59e0b" }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-amber-400/80", children: "This role can only be claimed once. Ensure you are the designated commander or authorized officer before proceeding." })
                    ] })
                  }
                ),
                workspace && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mb-4 rounded border px-4 py-3",
                    style: { backgroundColor: "#0a0e1a", borderColor: "#1e2d40" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: "Workspace" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-sm font-bold uppercase tracking-wider text-white", children: workspace.name }),
                      workspace.uic && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[10px] text-slate-500", children: [
                        "UIC: ",
                        workspace.uic,
                        " · ",
                        workspace.type
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "claim_commander.claim.primary_button",
                    onClick: () => setShowConfirmDialog(true),
                    className: "h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    children: "Claim Commander Role"
                  }
                )
              ]
            }
          )
        ] }),
        showConfirmDialog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "claim_commander.confirm.dialog",
            className: "mx-4 w-full max-w-sm rounded-lg border p-6 shadow-2xl",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TriangleAlert,
                  {
                    className: "mt-0.5 h-5 w-5 shrink-0",
                    style: { color: "#f59e0b" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-sm font-bold uppercase tracking-widest text-white", children: "Confirm Commander Claim" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-400", children: [
                    "Are you sure? This action cannot be undone. You are claiming the Commander role for",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color: "#f59e0b" }, children: (workspace == null ? void 0 : workspace.name) ?? "this workspace" }),
                    "."
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "claim_commander.confirm.cancel_button",
                    onClick: () => setShowConfirmDialog(false),
                    disabled: isClaiming,
                    className: "h-9 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40",
                    style: { borderColor: "#2a3347" },
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "claim_commander.confirm.confirm_button",
                    onClick: () => void handleConfirmClaim(),
                    disabled: isClaiming,
                    className: "flex h-9 flex-1 items-center justify-center gap-2 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    children: isClaiming ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                      "Claiming…"
                    ] }) : "Confirm"
                  }
                )
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" })
      ]
    }
  );
}
export {
  ClaimCommanderPage as default
};
