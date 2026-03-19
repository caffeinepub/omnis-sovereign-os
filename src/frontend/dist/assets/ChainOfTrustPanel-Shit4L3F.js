import { r as reactExports, j as jsxRuntimeExports, p as ue } from "./index-Nuoc5gUR.js";
import { S as ShieldCheck } from "./shield-check-9efrvzwA.js";
import { C as Check } from "./check-cDSKCr7b.js";
import { S as ShieldOff } from "./shield-off-Dc42FnjN.js";
import { C as Copy } from "./copy-Dj03Wjws.js";
function ChainOfTrustPanel({ compact = false }) {
  const [workspace, setWorkspace] = reactExports.useState(null);
  const [hasFoundingS2, setHasFoundingS2] = reactExports.useState(false);
  const [commanderClaimed, setCommanderClaimed] = reactExports.useState(false);
  const loadState = reactExports.useCallback(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw));
      } catch {
        setWorkspace(null);
      }
    }
    setHasFoundingS2(localStorage.getItem("omnis_founding_s2") === "true");
    setCommanderClaimed(
      localStorage.getItem("omnis_commander_claimed") === "true"
    );
  }, []);
  reactExports.useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 5e3);
    return () => clearInterval(interval);
  }, [loadState]);
  const bothSeated = hasFoundingS2 && commanderClaimed;
  const claimUrl = typeof window !== "undefined" ? `${window.location.origin}/claim-commander` : "/claim-commander";
  const handleCopyClaimLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      ue.success("Claim link copied to clipboard");
    } catch {
      ue.error("Failed to copy link");
    }
  };
  if (!workspace && !hasFoundingS2) return null;
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SeatRow,
        {
          label: "S2 Administrator",
          status: hasFoundingS2 ? bothSeated ? "official" : "provisional" : "vacant",
          compact: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SeatRow,
        {
          label: "Commander",
          status: commanderClaimed ? "claimed" : "vacant-awaiting",
          compact: true
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "admin.trust.panel",
      className: "rounded border",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2.5 border-b px-5 py-3.5",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4", style: { color: "#f59e0b" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-xs font-bold uppercase tracking-widest text-white", children: "Chain of Trust" }),
              workspace && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-mono text-[10px] text-slate-500", children: [
                workspace.name,
                " ",
                workspace.uic ? `· UIC ${workspace.uic}` : ""
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "divide-y p-4 space-y-0",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                SeatRow,
                {
                  label: "S2 Administrator",
                  status: hasFoundingS2 ? bothSeated ? "official" : "provisional" : "vacant"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                SeatRow,
                {
                  label: "Commander",
                  status: commanderClaimed ? "claimed" : "vacant-awaiting"
                }
              ) })
            ]
          }
        ),
        !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4", children: bothSeated ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2.5 rounded px-4 py-3",
            style: {
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Check,
                {
                  className: "h-4 w-4 shrink-0",
                  style: { color: "#22c55e" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-green-400", children: "Chain of Trust Established — Both seats are filled" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col gap-3 rounded px-4 py-3",
            style: {
              backgroundColor: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ShieldOff,
                  {
                    className: "h-4 w-4 shrink-0",
                    style: { color: "#f59e0b" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-amber-400", children: "Awaiting Commander — Share claim link to complete setup" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "code",
                  {
                    className: "flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-1.5 font-mono text-[10px] text-slate-300",
                    style: {
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347"
                    },
                    children: claimUrl
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "admin.trust.copy_claim_link.button",
                    onClick: () => void handleCopyClaimLink(),
                    className: "flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10",
                    style: {
                      borderColor: "rgba(245,158,11,0.4)",
                      color: "#f59e0b"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" }),
                      "Copy"
                    ]
                  }
                )
              ] })
            ]
          }
        ) })
      ]
    }
  );
}
function SeatRow({
  label,
  status,
  compact = false
}) {
  const badgeConfig = {
    provisional: {
      label: "Provisional",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)"
    },
    official: {
      label: "Official",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)"
    },
    claimed: {
      label: "Claimed",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)"
    },
    vacant: {
      label: "Vacant",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)"
    },
    "vacant-awaiting": {
      label: "Vacant — Awaiting",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
      pulse: true
    }
  };
  const cfg = badgeConfig[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-center justify-between gap-3 ${compact ? "" : "py-1"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-400", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider${cfg.pulse ? " animate-pulse" : ""}`,
            style: {
              color: cfg.color,
              backgroundColor: cfg.bg,
              borderColor: cfg.border
            },
            children: cfg.label
          }
        )
      ]
    }
  );
}
export {
  ChainOfTrustPanel as C
};
