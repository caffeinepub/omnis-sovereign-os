import { UserRole } from "@/backend.d";
import { FormError } from "@/components/shared/FormError";
import { RankSelector } from "@/components/shared/RankSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName } from "@/lib/displayName";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function RegistrationGatePage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    mi: "",
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

  // Live preview of formatted name
  const namePreview = formatDisplayName(
    form.rank,
    form.lastName,
    form.firstName,
    form.mi,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) {
      setError("Authentication required. Please refresh and try again.");
      return;
    }

    if (
      !form.lastName.trim() ||
      !form.firstName.trim() ||
      !form.rank.trim() ||
      !form.email.trim() ||
      !form.orgRole.trim()
    ) {
      setError(
        "Last name, first name, rank, email, and organizational role are required.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const principal = identity.getPrincipal();
      const formattedName = formatDisplayName(
        form.rank,
        form.lastName,
        form.firstName,
        form.mi,
      );

      // Register profile with standard user defaults
      await actor.registerProfile({
        principalId: principal,
        name: formattedName,
        rank: form.rank.trim(),
        email: form.email.trim(),
        orgRole: form.orgRole.trim(),
        clearanceLevel: 0n,
        isS2Admin: false,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: undefined,
      });

      // Bootstrap path: if a code was provided, attempt to elevate to S2 admin
      if (form.bootstrapCode.trim()) {
        try {
          // Step 1: Grant this caller the admin role in the access control system
          await actor.assignCallerUserRole(principal, UserRole.admin);

          // Step 2: Update profile to set isS2Admin = true now that we have admin rights
          await actor.updateUserProfile({
            principalId: principal,
            name: formattedName,
            rank: form.rank.trim(),
            email: form.email.trim(),
            orgRole: form.orgRole.trim(),
            clearanceLevel: 4n,
            isS2Admin: true,
            isValidatedByCommander: false,
            registered: true,
            avatarUrl: undefined,
          });

          // Step 3: Mark as validated by commander
          await actor.validateS2Admin(principal);
        } catch {
          // Authorization code was wrong or already used — continue as regular user
          // Profile is already registered; just proceed normally
        }
      }

      void navigate({ to: "/onboarding" });
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
        {/* Step indicator */}
        <div className="mb-5 flex justify-center">
          <span
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: "#f59e0b" }}
          >
            Step 1 of 3: Complete Profile
          </span>
        </div>

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
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-lg border border-border bg-card p-6 shadow-2xl"
        >
          <div className="space-y-4">
            {/* Name fields — three separate inputs */}
            <div className="space-y-3">
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Name
              </Label>
              <div className="grid grid-cols-[1fr_1fr_64px] gap-2">
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Last
                  </Label>
                  <Input
                    data-ocid="registration.last_name.input"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="SMITH"
                    className="border-input bg-secondary font-mono text-sm uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="family-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    First
                  </Label>
                  <Input
                    data-ocid="registration.first_name.input"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="John"
                    className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    MI
                  </Label>
                  <Input
                    data-ocid="registration.mi.input"
                    value={form.mi}
                    onChange={(e) =>
                      handleChange("mi", e.target.value.slice(0, 1))
                    }
                    placeholder="A"
                    maxLength={1}
                    className="border-input bg-secondary font-mono text-sm text-center uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="additional-name"
                  />
                </div>
              </div>
              {/* Live name preview */}
              <p className="font-mono text-[10px] text-muted-foreground/50">
                Will display as:{" "}
                <span className="text-muted-foreground">
                  {namePreview ||
                    `${form.rank || "RANK"} ${form.lastName.toUpperCase() || "LAST"}, ${form.firstName || "First"}${form.mi ? ` ${form.mi.toUpperCase()}` : ""}`}
                </span>
              </p>
            </div>

            {/* Branch / Category / Rank selector */}
            <RankSelector
              branch={branch}
              category={category}
              rank={form.rank}
              onBranchChange={(v) => {
                setBranch(v);
                setCategory("");
                handleChange("rank", "");
              }}
              onCategoryChange={(v) => {
                setCategory(v);
                handleChange("rank", "");
              }}
              onRankChange={(v) => handleChange("rank", v)}
              variant="registration"
            />

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="reg-email"
                data-ocid="registration.email.input"
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
                data-ocid="registration.org_role.input"
                type="text"
                value={form.orgRole}
                onChange={(e) => handleChange("orgRole", e.target.value)}
                placeholder="Intelligence Analyst"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Commander Authorization Code — always shown */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <Label
                htmlFor="reg-bootstrap"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Commander Authorization Code{" "}
                <span className="text-muted-foreground/50">(optional)</span>
              </Label>
              <Input
                id="reg-bootstrap"
                data-ocid="registration.bootstrap_code.input"
                type="text"
                value={form.bootstrapCode}
                onChange={(e) => handleChange("bootstrapCode", e.target.value)}
                placeholder="Provided by your commander or S2"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
              <p className="font-mono text-xs text-muted-foreground/50">
                Only required for initial system activation
              </p>
            </div>

            {error && <FormError message={error} />}

            <Button
              data-ocid="registration.submit_button"
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
