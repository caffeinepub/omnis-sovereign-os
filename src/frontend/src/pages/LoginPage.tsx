import type { ExtendedProfile } from "@/backend.d";
import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const [warpActive, setWarpActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  // Prevent double-navigation even across rapid re-renders
  const hasNavigated = useRef(false);
  // Track whether a checkAuth call is in flight
  const checkInFlight = useRef(false);

  // Reset navigation guard on every fresh mount (covers logout → login cycles)
  useEffect(() => {
    hasNavigated.current = false;
    checkInFlight.current = false;
    setWarpActive(false);
    setIsChecking(false);
  }, []);

  // Core navigation effect — fires whenever identity or actor readiness changes.
  // Conditions to attempt navigation:
  //   1. We are NOT still fetching the actor
  //   2. We have a real (non-anonymous) identity
  //   3. We haven't already started navigating or have a check in flight
  // Note: actor may be null if _initializeAccessControlWithSecret fails — we
  //       still navigate to /register in that case (profile check will just fail).
  useEffect(() => {
    // Guard: wait for actor query to settle (not mid-fetch)
    if (isFetching) return;

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

        {/* Login button */}
        <Button
          data-ocid="login.primary_button"
          className="h-12 w-64 bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_oklch(0.72_0.175_70_/_0.4)] transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.6)] disabled:opacity-50"
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {warpActive || isChecking
                ? "Initializing..."
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
      </div>

      {/* Bottom scan line effect */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
      <div className="absolute bottom-6 font-mono text-xs text-muted-foreground/40">
        OMNIS-OS v2.0 · CLEARANCE VERIFICATION REQUIRED
      </div>
    </div>
  );
}
