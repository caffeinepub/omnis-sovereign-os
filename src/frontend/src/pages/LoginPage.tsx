import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [warpActive, setWarpActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const hasNavigated = useRef(false);
  const timeoutStarted = useRef(false);

  // Reset on mount (covers logout → login cycles)
  useEffect(() => {
    hasNavigated.current = false;
    timeoutStarted.current = false;
    setWarpActive(false);
    setIsChecking(false);
    setSessionTimedOut(false);
  }, []);

  const triggerNavigate = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setWarpActive(true);
    setIsChecking(true);
    setTimeout(() => {
      void navigate({ to: "/register" });
    }, 1800);
  }, [navigate]);

  // When identity becomes real, navigate immediately — no actor needed.
  // RegistrationGatePage handles profile-based routing.
  useEffect(() => {
    if (!identity) return;
    if (identity.getPrincipal().isAnonymous()) return;
    triggerNavigate();
  }, [identity, triggerNavigate]);

  // Safety-net timeout: if identity never becomes real within 20s, show error.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount only
  useEffect(() => {
    if (timeoutStarted.current) return;
    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        setSessionTimedOut(true);
      }
    }, 20_000);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isLoggingIn || isChecking || warpActive;

  const handleSignIn = () => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      // Already authenticated — trigger navigation directly
      triggerNavigate();
      return;
    }
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

        {/* Session timeout error */}
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
