import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function RegistrationGatePage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { refreshProfile } = usePermissions();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    rank: "",
    email: "",
    orgRole: "",
    bootstrapCode: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) {
      setError("Authentication required. Please refresh and try again.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.rank.trim() ||
      !form.email.trim() ||
      !form.orgRole.trim()
    ) {
      setError("All fields except Bootstrap Code are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await actor.registerProfile({
        principalId: identity.getPrincipal(),
        name: form.name.trim(),
        rank: form.rank.trim(),
        email: form.email.trim(),
        orgRole: form.orgRole.trim(),
        clearanceLevel: 0n,
        isS2Admin: false,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: undefined,
      });

      await refreshProfile();
      void navigate({ to: "/" });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
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

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]">
            <ShieldCheck className="h-7 w-7 text-amber" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground">
            Personnel Registration
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Complete your profile to access the system
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
                htmlFor="reg-name"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Full Name
              </Label>
              <Input
                id="reg-name"
                data-ocid="register.name_input"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Smith"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-rank"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Rank / Title
              </Label>
              <Input
                id="reg-rank"
                data-ocid="register.rank_input"
                type="text"
                value={form.rank}
                onChange={(e) => handleChange("rank", e.target.value)}
                placeholder="Colonel"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="reg-email"
                data-ocid="register.email_input"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="j.smith@secure.mil"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-orgRole"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Organizational Role
              </Label>
              <Input
                id="reg-orgRole"
                data-ocid="register.org_role_input"
                type="text"
                value={form.orgRole}
                onChange={(e) => handleChange("orgRole", e.target.value)}
                placeholder="Intelligence Analyst"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Admin Bootstrap Code — always shown */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <Label
                htmlFor="reg-bootstrap"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Admin Bootstrap Code{" "}
                <span className="text-muted-foreground/50">(optional)</span>
              </Label>
              <Input
                id="reg-bootstrap"
                data-ocid="register.bootstrap_code_input"
                type="text"
                value={form.bootstrapCode}
                onChange={(e) => handleChange("bootstrapCode", e.target.value)}
                placeholder="For first-user system access"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
              <p className="font-mono text-xs text-muted-foreground/50">
                Only required for initial system bootstrap
              </p>
            </div>

            {error && <FormError message={error} />}

            <Button
              data-ocid="register.submit_button"
              type="submit"
              className="mt-2 h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register Personnel"
              )}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center font-mono text-xs text-muted-foreground/40">
          Registration is monitored. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
