import { c as useExtActor, a as useInternetIdentity, b as useNavigate, r as reactExports, j as jsxRuntimeExports, B as Button } from "./index-Nuoc5gUR.js";
import { F as FormError } from "./FormError-D8yaafrz.js";
import { S as ShieldCheck } from "./shield-check-9efrvzwA.js";
import { L as LoaderCircle } from "./loader-circle-BnPM08q-.js";
function ValidateCommanderPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [error, setError] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(false);
  const handleActivate = async () => {
    if (!actor || !identity || isFetching) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const principal = identity.getPrincipal();
      const profile = await actor.getMyProfile();
      const baseProfile = profile ?? {
        principalId: principal,
        name: "",
        rank: "",
        email: "",
        orgRole: "S2 Administrator",
        clearanceLevel: 0n,
        isS2Admin: false,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: void 0,
        lastName: "",
        firstName: "",
        middleInitial: "",
        branch: "",
        rankCategory: "",
        dodId: "",
        mos: "",
        uic: "",
        orgId: "",
        registrationStatus: "Pending",
        denialReason: "",
        verifiedBy: void 0,
        verifiedAt: void 0,
        clearanceExpiry: void 0,
        networkEmail: "",
        unitPhone: ""
      };
      await actor.updateMyProfile({
        ...baseProfile,
        principalId: principal,
        isS2Admin: true,
        isValidatedByCommander: true,
        clearanceLevel: 4n,
        registrationStatus: "Active",
        registered: true
      });
      try {
        await actor.logGovernanceEvent({
          recordId: crypto.randomUUID(),
          eventType: "s2_activation",
          description: "S2 Admin role activated (founding administrator)",
          triggeredBy: principal,
          timestamp: BigInt(Date.now()),
          wasmHash: ""
        });
      } catch {
      }
      setSuccess(true);
      const isFoundingS2 = localStorage.getItem("omnis_founding_s2") === "true";
      setTimeout(() => {
        if (isFoundingS2) {
          void navigate({ to: "/workspace-setup" });
        } else {
          void navigate({ to: "/" });
        }
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Activation failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col items-center gap-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.25)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7 text-amber" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground", children: "S2 Admin Activation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-relaxed text-muted-foreground", children: "Activate your S2 administrator role to begin onboarding personnel and establishing your unit workspace." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 rounded-lg border border-border bg-card p-6 shadow-2xl", children: success ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "output",
            {
              "data-ocid": "validate.success_state",
              className: "block font-mono text-xs text-green-400",
              children: "S2 Admin activated. Redirecting..."
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "rounded border px-4 py-3 font-mono text-xs leading-relaxed",
                style: {
                  backgroundColor: "rgba(245,158,11,0.06)",
                  borderColor: "rgba(245,158,11,0.3)",
                  color: "#fbbf24"
                },
                children: "This action grants you full S2 administrator access. You will be responsible for verifying all personnel and managing system security. Ensure you are the designated system administrator before proceeding."
              }
            ),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "validate.submit_button",
                type: "button",
                onClick: () => void handleActivate(),
                className: "h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
                disabled: isSubmitting,
                children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  "Activating..."
                ] }) : "Activate as S2 Admin"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-mono text-[10px] leading-relaxed text-slate-600", children: "Commander Auth Code enforcement will be enabled in a future backend update." })
          ] }) })
        ] })
      ]
    }
  );
}
export {
  ValidateCommanderPage as default
};
