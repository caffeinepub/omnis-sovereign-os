import { UserRole } from "@/backend.d";
import { FormError } from "@/components/shared/FormError";
import { RankSelector } from "@/components/shared/RankSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName } from "@/lib/displayName";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function RegistrationGatePage() {
  const { actor, isFetching } = useActor();
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
  const [showBootstrapCode, setShowBootstrapCode] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  // Ensure the session timeout is only started once — background refetches
  // from TanStack Query must not cancel and restart the timer.
  const timeoutStarted = useRef(false);

  // If the authenticated actor never becomes available within 20s AFTER a real
  // identity is present, break out of the infinite spinner and show a recoverable error.
  // We do NOT start the timeout until the user has actually authenticated via
  // Internet Identity AND the actor is still loading (isFetching).
  // The timer is started only ONCE (via timeoutStarted ref).
  // biome-ignore lint/correctness/useExhaustiveDependencies: actor/isFetching intentionally excluded to prevent timer restart on refetch
  useEffect(() => {
    const hasRealIdentity =
      !!identity && !identity.getPrincipal().isAnonymous();
    // Only start the countdown once the user has authenticated
    if (!hasRealIdentity) return;
    // Actor is already ready (and not anonymous) — no timeout needed
    if (actor && !identity.getPrincipal().isAnonymous()) return;
    // Timer already running — don't restart
    if (timeoutStarted.current) return;

    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      setSessionTimedOut(true);
    }, 25_000);

    return () => clearTimeout(timer);
  }, [identity]);

  // Detect if this is the first user (no S2 admins exist yet)
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getAllProfiles()
      .then((profiles) => {
        const hasS2 = profiles.some((p) => p.isS2Admin);
        setIsFirstUser(!hasS2);
      })
      .catch(() => setIsFirstUser(false));
  }, [actor, isFetching]);

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

    // Actor may still be initializing — wait for it
    if (isFetching) {
      setError(
        "System is still initializing. Please wait a moment and try again.",
      );
      return;
    }

    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
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
          // Authorization code path failed — continue as regular user
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

  // Determine whether we're waiting for the authenticated actor.
  // useActor always returns an actor (even an anonymous one), so we can't use
  // !actor alone. We're "loading" when we have a real identity but the actor
  // query is still fetching (meaning the authenticated actor hasn't replaced
  // the anonymous one yet).
  const hasRealIdentity = !!identity && !identity.getPrincipal().isAnonymous();
  const isActorLoading = hasRealIdentity && isFetching;

  // Show a loading screen while the actor is still initializing
  if (isActorLoading) {
    // If init has stalled for too long, show a recoverable error
    if (sessionTimedOut) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-5"
          style={{ backgroundColor: "#0a0e1a" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border"
            style={{ borderColor: "#ef4444", backgroundColor: "#1a0a0a" }}
          >
            <ShieldAlert className="h-7 w-7" style={{ color: "#ef4444" }} />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p
              className="font-mono text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#fca5a5" }}
            >
              Session timed out
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Session initialization timed out. This may be a network issue.
            </p>
          </div>
          <button
            type="button"
            data-ocid="registration.retry_button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-red-900/30"
            style={{ borderColor: "#ef4444", color: "#fca5a5" }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      );
    }

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]">
          <ShieldCheck className="h-7 w-7 text-amber" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-amber" />
          Establishing secure session...
        </div>
      </div>
    );
  }

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

        {/* First-user banner */}
        {isFirstUser && (
          <div
            className="mb-5 flex items-start gap-3 rounded border px-4 py-3"
            style={{
              backgroundColor: "rgba(245,158,11,0.06)",
              borderColor: "rgba(245,158,11,0.3)",
            }}
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "#f59e0b" }}
            />
            <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
              You appear to be the first person to register on this workspace.
              If you are the designated system administrator, complete
              registration then click{" "}
              <span className="font-semibold text-amber-400">
                &lsquo;Establish Your Workspace&rsquo;
              </span>{" "}
              to set up the S2 role and unit.
            </p>
          </div>
        )}

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
              <p className="font-mono text-[10px] text-slate-500">
                Will display as:{" "}
                <span className="font-semibold text-slate-300">
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

            {/* Commander Authorization Code — collapsible, S2 admin only */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                data-ocid="registration.bootstrap_code.toggle"
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                onClick={() => setShowBootstrapCode((v) => !v)}
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showBootstrapCode && "rotate-180",
                  )}
                />
                I am the designated S2 administrator
              </button>
              {showBootstrapCode && (
                <div className="mt-3 space-y-1.5">
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
                    onChange={(e) =>
                      handleChange("bootstrapCode", e.target.value)
                    }
                    placeholder="Provided by your commander or S2"
                    className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                  />
                  <p className="font-mono text-xs text-muted-foreground/50">
                    Only required for initial system activation
                  </p>
                </div>
              )}
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
