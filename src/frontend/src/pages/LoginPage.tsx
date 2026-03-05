import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn, isInitializing, isLoginError } =
    useInternetIdentity();
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

  // After auth success + actor ready — check profile and navigate.
  // Also handles the case where identity is already valid when Sign In is clicked
  // (passkey completed in II popup before button interaction): isLoginError with
  // a valid identity means we're already authenticated, so proceed normally.
  useEffect(() => {
    if (
      !identity ||
      !actor ||
      isFetching ||
      checkingProfile ||
      hasNavigated.current
    )
      return;

    setWarpActive(true);
    setCheckingProfile(true);

    const run = async () => {
      try {
        const profile = await actor.getMyProfile();
        // Warp plays for at least 2.5 seconds
        await new Promise((res) => setTimeout(res, 2500));
        hasNavigated.current = true;
        if (!profile || !profile.registered) {
          void navigate({ to: "/register" });
        } else {
          void navigate({ to: "/" });
        }
      } catch {
        setWarpActive(false);
        setCheckingProfile(false);
        hasNavigated.current = false;
      }
    };

    void run();
  }, [identity, actor, isFetching, checkingProfile, navigate]);

  // If the II hook reports "already authenticated" error but we have a valid
  // identity, the error is benign — the identity effect above will handle navigation.
  // Only show the button as loading when truly in progress.
  const isLoading =
    (isLoggingIn || isInitializing || checkingProfile) && !isLoginError;

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
          onClick={login}
          disabled={isLoading || checkingProfile || warpActive}
        >
          {isLoading || checkingProfile || warpActive ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {warpActive ? "Initializing..." : "Authenticating..."}
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
