import { useCallback, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

const WARN_TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes
const EXPIRE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function useSessionGuard() {
  const { login } = useInternetIdentity();
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store the last route in memory only — never sessionStorage
  const lastRouteRef = useRef<string>(window.location.pathname);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARN_TIMEOUT_MS);
    expireTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      setShowExpired(true);
    }, EXPIRE_TIMEOUT_MS);
  }, [clearTimers]);

  const resetActivity = useCallback(() => {
    lastRouteRef.current = window.location.pathname;
    startTimers();
  }, [startTimers]);

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  const handleExpiredSignIn = useCallback(() => {
    setShowExpired(false);
    login();
    // After re-auth, navigate to last known route (in-memory only)
    // The router will handle redirect after login status changes
  }, [login]);

  // Attach activity listeners
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"] as const;
    for (const evt of events) {
      window.addEventListener(evt, resetActivity, { passive: true });
    }
    startTimers();
    return () => {
      clearTimers();
      for (const evt of events) {
        window.removeEventListener(evt, resetActivity);
      }
    };
  }, [resetActivity, startTimers, clearTimers]);

  return {
    showWarning,
    showExpired,
    handleStayLoggedIn,
    handleExpiredSignIn,
    lastRoute: lastRouteRef.current,
  };
}
