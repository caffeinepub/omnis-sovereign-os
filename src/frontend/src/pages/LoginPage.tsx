import type { ExtendedProfile } from "@/backend.d";
import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const [warpActive, setWarpActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  // Prevent double-navigation even across rapid re-renders
  const hasNavigated = useRef(false);
  // Track whether a checkAuth call is in flight
  const checkInFlight = useRef(false);
  // Ensure the session timeout is only started once — background refetches
  // must not cancel and restart the timer.
  const timeoutStarted = useRef(false);

  // Reset navigation guard on every fresh mount (covers logout → login cycles)
  useEffect(() => {
    hasNavigated.current = false;
    checkInFlight.current = false;
    timeoutStarted.current = false;
    setWarpActive(false);
    setIsChecking(false);
    setSessionTimedOut(false);
  }, []);

  // After II authentication, if the actor never becomes ready within 20s, show
  // an actionable error instead of spinning forever.
  // The timer is started only ONCE (via timeoutStarted ref) so that background
  // refetches from TanStack Query do not cancel and restart it.
  // actor is intentionally omitted from deps — background refetches changing actor
  // must not cancel/restart the already-running timer (would cause a never-ending spinner).
  // biome-ignore lint/correctness/useExhaustiveDependencies: actor intentionally excluded to prevent timer restart on refetch
  useEffect(() => {
    const hasRealIdentity =
      !!identity && !identity.getPrincipal().isAnonymous();
    // Only start once we have a real identity
    if (!hasRealIdentity || hasNavigated.current) return;
    // Actor is already ready — no timeout needed
    if (actor) return;
    // Timer already running — don't restart on isFetching flips
    if (timeoutStarted.current) return;

    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        setSessionTimedOut(true);
      }
    }, 20_000);

    return () => clearTimeout(timer);
  }, [identity]);

  // Core navigation effect — fires whenever identity or actor readiness changes.
  // Conditions to attempt navigation:
  //   1. We are NOT on the INITIAL actor fetch (background refetches are allowed)
  //   2. We have a real (non-anonymous) identity
  //   3. We haven't already started navigating or have a check in flight
  // Note: actor may be null if _initializeAccessControlWithSecret fails — we
  //       still navigate to /register in that case (profile check will just fail).
  useEffect(() => {
    // Guard: block only on the initial actor fetch, not background refetches.
    // Using `!actor && isFetching` means navigation can proceed once the actor
    // is available even if TanStack Query has a background refetch in flight.
    if (!actor && isFetching) return;

    // Guard: must have a real (non-anonymous) identity
    if (!identity) return;
    if (identity.getPrincipal().isAnonymous()) return;

    // Guard: only navigate once
    if (hasNavigated.current || checkInFlight.current) return;

    checkInFlight.current = true;

    const checkAuth = async () => {
      try {
        hasNavigated.current = true;
        setWarpActive(true);
        setIsChecking(true);

        // Give the warp animation a moment
        await new Promise<void>((res) => setTimeout(res, 1800));

        // If actor is available, check the profile to route correctly.
        // If actor is null (initialization failed), fall through to /register.
        let profile: ExtendedProfile | null = null;
        if (actor) {
          try {
            profile = await actor.getMyProfile();
          } catch {
            // getMyProfile threw — treat as unregistered so user can register
          }
        }

        if (!profile || !profile.registered) {
          void navigate({ to: "/register" });
        } else if (!profile.isValidatedByCommander && !profile.isS2Admin) {
          void navigate({ to: "/pending" });
        } else {
          void navigate({ to: "/" });
        }
      } catch {
        // Something failed — reset so the user can try again
        hasNavigated.current = false;
        checkInFlight.current = false;
        setWarpActive(false);
        setIsChecking(false);
      }
    };

    void checkAuth();
  }, [identity, actor, isFetching, navigate]);

  const isLoading = isLoggingIn || isChecking || warpActive;

  const handleSignIn = () => {
    // If we already have a valid identity, just reset the latch and let the
    // effect above handle navigation (covers "stored session" case where II
    // is already authenticated but the page was re-mounted after sign-out)
    if (identity && !identity.getPrincipal().isAnonymous()) {
      hasNavigated.current = false;
      checkInFlight.current = false;
      return;
    }
    // Otherwise open the II popup
    login();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Starfield background */}
      <StarfieldWarp warpActive={warpActive} />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_40px_oklch(0.72_0.175_70_/_0.3)]">
            <ShieldCheck className="h-10 w-10 text-amber" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-mono text-4xl font-bold uppercase tracking-[0.3em] text-foreground">
              OMNIS
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Sovereign OS
            </p>
            <p
              className="font-mono text-xs tracking-[0.2em]"
              style={{ color: "#f59e0b" }}
            >
              Unstoppable. Tamperproof. Sovereign.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-64 items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            AUTHENTICATE
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Session timeout error — shown when actor init stalls */}
        {sessionTimedOut ? (
          <div className="flex w-72 flex-col items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border"
              style={{ borderColor: "#ef4444", backgroundColor: "#1a0a0a" }}
            >
              <ShieldAlert className="h-6 w-6" style={{ color: "#ef4444" }} />
            </div>
            <p
              className="text-center font-mono text-xs leading-relaxed"
              style={{ color: "#fca5a5" }}
            >
              Session initialization timed out.
              <br />
              This may be a network issue.
            </p>
            <Button
              data-ocid="login.retry_button"
              className="h-10 w-full font-mono text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "#ef4444",
                color: "#fff",
              }}
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Login button */}
            <Button
              data-ocid="login.primary_button"
              className="h-12 w-64 bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-primary/90 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 20px oklch(0.72 0.175 70 / 0.4)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 32px oklch(0.72 0.175 70 / 0.65)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 20px oklch(0.72 0.175 70 / 0.4)";
              }}
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {warpActive || isChecking
                    ? "Accessing System..."
                    : "Authenticating..."}
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="max-w-xs font-mono text-xs leading-relaxed text-muted-foreground/60">
              Access restricted to authorized personnel only. All sessions are
              monitored and logged.
            </p>
          </>
        )}
      </div>

      {/* Bottom scan line effect */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
      <div className="absolute bottom-6 font-mono text-xs text-muted-foreground/40">
        OMNIS-OS · CLEARANCE VERIFICATION REQUIRED
      </div>
    </div>
  );
}
