import { b as useNavigate, r as reactExports, j as jsxRuntimeExports, p as ue } from "./index-Dm1hd-rR.js";
import { C as CircleCheck } from "./circle-check-BlMesRQu.js";
import { S as ShieldCheck } from "./shield-check-BmGSdE3s.js";
import { C as Copy } from "./copy-DCSBkbgG.js";
import { L as LoaderCircle } from "./loader-circle-BzIe35gm.js";
import { R as RefreshCw } from "./refresh-cw-BR-tpAUa.js";
import { C as Check } from "./check-UB5_kp0G.js";
const STEP_LABELS = [
  "Unit Details",
  "S2 Confirmed",
  "Await Commander",
  "Trust Established"
];
function StepIndicator({ currentStep }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-0", children: STEP_LABELS.map((label, idx) => {
    const stepNum = idx + 1;
    const isActive = stepNum === currentStep;
    const isDone = stepNum < currentStep;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300",
            style: {
              backgroundColor: isDone ? "rgba(34,197,94,0.15)" : isActive ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
              borderColor: isDone ? "rgba(34,197,94,0.5)" : isActive ? "rgba(245,158,11,0.6)" : "#2a3347",
              color: isDone ? "#22c55e" : isActive ? "#f59e0b" : "#4b5563"
            },
            children: isDone ? "✓" : stepNum
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "hidden font-mono text-[9px] uppercase tracking-wider sm:block",
            style: {
              color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563"
            },
            children: label
          }
        )
      ] }),
      idx < STEP_LABELS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "mx-2 mb-5 h-px w-8 transition-all duration-300 sm:mx-3 sm:w-10",
          style: {
            backgroundColor: stepNum < currentStep ? "rgba(34,197,94,0.4)" : "#2a3347"
          }
        }
      )
    ] }, label);
  }) });
}
function ReadOnlyField({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "font-mono text-xs font-semibold text-white",
        style: { letterSpacing: "0.05em" },
        children: value || "—"
      }
    )
  ] });
}
function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(1);
  const [workspace, setWorkspace] = reactExports.useState(null);
  const [_commanderClaimed, setCommanderClaimed] = reactExports.useState(false);
  const pollingRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw));
      } catch {
        setWorkspace(null);
      }
    }
  }, []);
  const checkCommanderClaim = reactExports.useCallback(() => {
    const claimed = localStorage.getItem("omnis_commander_claimed") === "true";
    setCommanderClaimed(claimed);
    if (claimed) {
      setStep(4);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, []);
  reactExports.useEffect(() => {
    if (step === 3) {
      checkCommanderClaim();
      pollingRef.current = setInterval(checkCommanderClaim, 3e3);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, checkCommanderClaim]);
  const claimUrl = typeof window !== "undefined" ? `${window.location.origin}/claim-commander` : "/claim-commander";
  const handleCopyClaimUrl = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      ue.success("Claim link copied to clipboard");
    } catch {
      ue.error("Could not copy to clipboard");
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex w-full max-w-lg flex-col gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { currentStep: step }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border p-6 shadow-2xl",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                step === 1 && workspace && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Confirm Unit Details" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[11px] text-slate-500", children: "Review the workspace configuration before proceeding." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "grid grid-cols-2 gap-4 rounded border p-4",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.03)",
                        borderColor: "rgba(245,158,11,0.2)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ReadOnlyField, { label: "Unit Name", value: workspace.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ReadOnlyField,
                          {
                            label: "Unit Identification Code (UIC)",
                            value: workspace.uic || "N/A"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ReadOnlyField, { label: "Unit Type", value: workspace.type }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ReadOnlyField, { label: "Mode", value: workspace.mode })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "workspace_setup.confirm.primary_button",
                      onClick: () => setStep(2),
                      className: "h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: "Confirm & Continue"
                    }
                  )
                ] }),
                step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 py-4 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-16 w-16 items-center justify-center rounded-full border",
                      style: {
                        backgroundColor: "rgba(34,197,94,0.1)",
                        borderColor: "rgba(34,197,94,0.4)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8 text-green-500" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-lg font-bold uppercase tracking-widest text-white", children: "Provisional S2 Established" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-400", children: [
                      "You have been assigned as Provisional S2 Administrator for",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color: "#f59e0b" }, children: (workspace == null ? void 0 : workspace.name) ?? "your workspace" }),
                      ". You can now approve incoming personnel. Your status will be upgraded to Official S2 once the Commander establishes their role."
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-full rounded border px-4 py-3 text-left",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.05)",
                        borderColor: "rgba(245,158,11,0.2)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-amber-400/80", children: "Your workspace is secured by frontend enforcement. Full cryptographic isolation will be enforced in a future backend update." })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "workspace_setup.s2_confirmed.primary_button",
                      onClick: () => setStep(3),
                      className: "h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: "Continue to Commander Setup"
                    }
                  )
                ] }),
                step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "flex h-14 w-14 items-center justify-center rounded-full border",
                        style: {
                          backgroundColor: "rgba(245,158,11,0.08)",
                          borderColor: "rgba(245,158,11,0.35)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ShieldCheck,
                          {
                            className: "h-7 w-7",
                            style: { color: "#f59e0b" }
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-base font-bold uppercase tracking-widest text-white", children: "Establish Chain of Trust" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 font-mono text-xs leading-relaxed text-slate-400", children: "A second authorized person must claim the Commander role to complete the two-person chain of trust. Until then, your S2 role is provisional." })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: "Commander Claim Link" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "code",
                        {
                          className: "flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-2 font-mono text-[10px] text-slate-300",
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
                          "data-ocid": "workspace_setup.copy_claim_link.button",
                          onClick: () => void handleCopyClaimUrl(),
                          className: "flex items-center gap-1.5 rounded border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10",
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
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-600", children: "Share this link with your Commander or designated officer. They must log in with their Internet Identity and claim the Commander role." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-slate-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider", children: "Waiting for Commander to claim role..." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "workspace_setup.skip.secondary_button",
                        onClick: () => void navigate({ to: "/" }),
                        className: "h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300",
                        style: { borderColor: "#2a3347" },
                        children: "Skip for Now — Go to Hub"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "workspace_setup.poll.primary_button",
                        onClick: checkCommanderClaim,
                        className: "flex h-10 flex-1 items-center justify-center gap-2 rounded border font-mono text-xs uppercase tracking-wider transition-colors hover:bg-amber-500/5",
                        style: {
                          borderColor: "rgba(245,158,11,0.4)",
                          color: "#f59e0b"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                          "Check Now"
                        ]
                      }
                    )
                  ] })
                ] }),
                step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 py-4 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-16 w-16 items-center justify-center rounded-full border",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.1)",
                        borderColor: "rgba(245,158,11,0.4)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8", style: { color: "#f59e0b" } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-lg font-bold uppercase tracking-widest text-white", children: "Chain of Trust Established" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-xs leading-relaxed text-slate-400", children: "The Commander role has been claimed. Both seats are now filled. Omnis is ready for full operation." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex flex-1 items-center gap-2 rounded border px-3 py-2",
                        style: {
                          backgroundColor: "rgba(34,197,94,0.06)",
                          borderColor: "rgba(34,197,94,0.2)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-green-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-green-400", children: "S2 Official" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex flex-1 items-center gap-2 rounded border px-3 py-2",
                        style: {
                          backgroundColor: "rgba(34,197,94,0.06)",
                          borderColor: "rgba(34,197,94,0.2)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-green-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-wider text-green-400", children: "Commander" })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "workspace_setup.enter.primary_button",
                      onClick: () => void navigate({ to: "/" }),
                      className: "h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: "Enter Omnis"
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-mono text-[10px] text-slate-700", children: step < 4 ? "Both seats must be filled before the chain of trust is complete." : "Workspace is operational. All access is monitored." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" })
      ]
    }
  );
}
export {
  WorkspaceSetupPage as default
};
