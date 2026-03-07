import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
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
      await actor.validateS2Admin(identity.getPrincipal());
      setSuccess(true);

      // If this is the founding S2 (came from workspace creation), route to wizard
      const isFoundingS2 = localStorage.getItem("omnis_founding_s2") === "true";
      setTimeout(() => {
        if (isFoundingS2) {
          void navigate({ to: "/workspace-setup" });
        } else {
          void navigate({ to: "/" });
        }
      }, 1000);
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
            Activate your S2 administrator role to gain full system access and
            provisioning rights.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-2xl space-y-4">
          <div className="rounded border border-amber/20 bg-amber/5 p-3">
            <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
              Commander authorization code enforcement will be enabled in a
              future backend update. Until then, activation is one click.
            </p>
          </div>

          {success && (
            <output
              data-ocid="validate.success_state"
              className="block font-mono text-xs text-green-400"
            >
              ✓ S2 Admin activated. Redirecting...
            </output>
          )}
          {error && <FormError message={error} />}

          <Button
            data-ocid="validate.submit_button"
            type="button"
            onClick={() => void handleActivate()}
            className="h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating...
              </span>
            ) : (
              "Activate S2 Admin"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
