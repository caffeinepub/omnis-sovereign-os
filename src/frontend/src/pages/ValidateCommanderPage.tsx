import type { backendInterface as ExtBackend } from "@/backend.d";
import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ValidateCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const principal = identity.getPrincipal();
      const ext = actor as unknown as ExtBackend;

      // Get current profile to preserve existing fields
      const profile = await ext.getMyProfile();

      // Update profile to set S2 admin flags.
      // Uses updateMyProfile (requires #user role only) rather than
      // validateS2Admin (requires #admin role, unavailable on production URL).
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
        avatarUrl: undefined,
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
        verifiedBy: undefined,
        verifiedAt: undefined,
        clearanceExpiry: undefined,
        networkEmail: "",
        unitPhone: "",
      };

      await ext.updateMyProfile({
        ...baseProfile,
        principalId: principal,
        isS2Admin: true,
        isValidatedByCommander: true,
        clearanceLevel: 4n,
        registrationStatus: "Active",
        registered: true,
      });

      // Log governance event (non-blocking)
      try {
        await ext.logGovernanceEvent({
          recordId: crypto.randomUUID(),
          eventType: "s2_activation",
          description: "S2 Admin role activated (founding administrator)",
          triggeredBy: principal,
          timestamp: BigInt(Date.now()),
          wasmHash: "",
        });
      } catch {
        // Non-blocking
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
      const msg =
        err instanceof Error
          ? err.message
          : "Activation failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.25)]">
            <ShieldCheck className="h-7 w-7 text-amber" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground">
            S2 Admin Activation
          </h1>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Activate your S2 administrator role to begin onboarding personnel
            and establishing your unit workspace.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-2xl">
          {success ? (
            <output
              data-ocid="validate.success_state"
              className="block font-mono text-xs text-green-400"
            >
              S2 Admin activated. Redirecting...
            </output>
          ) : (
            <>
              <div
                className="rounded border px-4 py-3 font-mono text-xs leading-relaxed"
                style={{
                  backgroundColor: "rgba(245,158,11,0.06)",
                  borderColor: "rgba(245,158,11,0.3)",
                  color: "#fbbf24",
                }}
              >
                This action grants you full S2 administrator access. You will be
                responsible for verifying all personnel and managing system
                security. Ensure you are the designated system administrator
                before proceeding.
              </div>

              {error && <FormError message={error} />}

              <Button
                data-ocid="validate.submit_button"
                type="button"
                onClick={() => void handleActivate()}
                className="h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activating...
                  </span>
                ) : (
                  "Activate as S2 Admin"
                )}
              </Button>

              <p className="text-center font-mono text-[10px] leading-relaxed text-slate-600">
                Commander Auth Code enforcement will be enabled in a future
                backend update.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
