import type { backendInterface as ExtBackend } from "@/backend.d";
import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ValidateCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }

    if (!code.trim()) {
      setError("Commander authorization code is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // First validate the auth code against the backend
      const codeValid = await (
        actor as unknown as ExtBackend
      ).validateCommanderAuthCode(code.trim());
      if (!codeValid) {
        setError(
          "Invalid authorization code. Contact the Commander for the correct code.",
        );
        setIsSubmitting(false);
        return;
      }

      // Code valid — activate S2 admin role
      await (actor as unknown as ExtBackend).validateS2Admin(
        identity.getPrincipal(),
      );

      // Log governance event for S2 activation
      try {
        await (actor as unknown as ExtBackend).logGovernanceEvent({
          recordId: crypto.randomUUID(),
          eventType: "s2_activation",
          description:
            "S2 Admin role activated via Commander Authorization Code",
          triggeredBy: identity.getPrincipal(),
          timestamp: BigInt(Date.now()),
          wasmHash: "",
        });
      } catch {
        // Non-blocking — activation still succeeded
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
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back button */}
        <button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="mb-6 flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Return to Hub
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.25)]">
            <ShieldCheck className="h-7 w-7 text-amber" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground">
            S2 Admin Activation
          </h1>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Enter the Commander authorization code to activate your S2
            administrator role.
          </p>
        </div>

        {/* Card */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-2xl">
          {success ? (
            <output
              data-ocid="validate.success_state"
              className="block font-mono text-xs text-green-400"
            >
              ✓ S2 Admin activated. Redirecting...
            </output>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Commander Authorization Code
                </Label>
                <Input
                  data-ocid="validate.code.input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleActivate();
                  }}
                  placeholder="Enter code..."
                  className="border font-mono text-sm tracking-[0.15em] text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>

              {error && <FormError message={error} />}

              <Button
                data-ocid="validate.submit_button"
                type="button"
                onClick={() => void handleActivate()}
                className="h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isSubmitting || !code.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating...
                  </span>
                ) : (
                  "Activate S2 Admin"
                )}
              </Button>

              <p className="text-center font-mono text-[10px] leading-relaxed text-slate-600">
                Contact your Commander for the authorization code. Each code is
                single-use and time-limited.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
