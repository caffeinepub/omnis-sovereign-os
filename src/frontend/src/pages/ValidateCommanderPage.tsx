import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ValidateCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { refreshProfile } = usePermissions();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) {
      setError("Authentication required.");
      return;
    }
    if (!code.trim()) {
      setError("Validation code is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await actor.validateS2Admin(identity.getPrincipal());
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Validation failed. Please try again.";
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
            Commander Validation
          </h1>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Enter the S2 Admin validation code issued by your Commander to
            complete authorization
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-card p-6 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="validate-code"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Commander Validation Code
              </Label>
              <Input
                id="validate-code"
                data-ocid="validate.code_input"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Enter validation code"
                className="border-input bg-secondary font-mono text-sm tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                autoComplete="off"
              />
            </div>

            {success && (
              <output
                data-ocid="validate.success_state"
                className="block font-mono text-xs text-green-400"
              >
                ✓ Validation successful. Redirecting...
              </output>
            )}
            {error && <FormError message={error} />}

            <Button
              data-ocid="validate.submit_button"
              type="submit"
              className="h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </span>
              ) : (
                "Submit Validation Code"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
