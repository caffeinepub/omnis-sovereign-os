import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn, isLoginError } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const [warpActive, setWarpActive] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const hasNavigated = useRef(false);

  // Reset navigation guard every time this page mounts (covers logout → re-login)
  useEffect(() => {
    hasNavigated.current = false;
    setWarpActive(false);
    setCheckingProfile(false);
  }, []);

  // Navigate as soon as we have an actor that is authenticated (non-anonymous principal).
  // This handles both:
  //   (a) fresh II login — identity is set, actor is created with it
  //   (b) stored session on page load — actor is ready with the stored identity
  // We do NOT rely on loginStatus because the init effect in useInternetIdentity
  // always resets it to "idle" in its finally block, regardless of auth state.
  useEffect(() => {
    if (isFetching || !actor) return;
    if (hasNavigated.current) return;

    // Determine if the actor is authenticated by checking its principal
    const checkAuth = async () => {
      try {
        // getMyProfile is a light call that only succeeds for a real identity.
        // Anonymous callers get an empty/null profile with registered = false.
        const profile = await actor.getMyProfile();

        // If no identity is available yet, don't proceed — wait for actor refresh
        if (!identity && !profile) return;

        // If profile came back but there is no non-anonymous identity, skip.
        // This guards the anonymous actor case.
        if (!identity) return;
        if (identity.getPrincipal().isAnonymous()) return;

        hasNavigated.current = true;
        setWarpActive(true);
        setCheckingProfile(true);

        // Warp plays for at least 2 seconds
        await new Promise((res) => setTimeout(res, 2000));

        if (!profile || !profile.registered) {
          void navigate({ to: "/register" });
        } else if (!profile.isValidatedByCommander && !profile.isS2Admin) {
          void navigate({ to: "/pending" });
        } else {
          void navigate({ to: "/" });
        }
      } catch {
        // Not authenticated or call failed — stay on login page
        hasNavigated.current = false;
        setWarpActive(false);
        setCheckingProfile(false);
      }
    };

    void checkAuth();
  }, [identity, actor, isFetching, navigate]);

  // Only show loading/disabled for states we control:
  // - actively logging in via II popup
  // - post-auth profile check and warp animation
  // Do NOT disable during isInitializing — that would keep the button dead
  // while a stored session is being restored, and the effect handles auto-nav anyway.
  const isLoading = isLoggingIn || checkingProfile || warpActive;

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
          onClick={() => {
            // If the hook already has an identity (stored session), or if it
            // errored because "already authenticated", the effect above will
            // auto-navigate. Force a re-check by resetting the latch.
            if (identity || isLoginError) {
              hasNavigated.current = false;
              return;
            }
            login();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {warpActive || checkingProfile
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
