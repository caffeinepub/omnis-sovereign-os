import { useEffect, useRef } from "react";

interface UseIdleTimerOptions {
  onWarn: () => void;
  onExpire: () => void;
  /** Milliseconds of inactivity before the warning fires. Default: 20 minutes. */
  warnAfterMs?: number;
  /** Milliseconds of inactivity before the session is expired. Default: 22 minutes. */
  expireAfterMs?: number;
}

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "touchstart",
  "click",
] as const;

/**
 * Idle timer hook.
 *
 * Listens for user activity on `window`. After `warnAfterMs` of inactivity
 * calls `onWarn`. After `expireAfterMs` calls `onExpire`. Any activity resets
 * both timers.
 *
 * Does not self-activate — the caller decides when to mount it (e.g. only when
 * an authenticated identity is present).
 */
export function useIdleTimer({
  onWarn,
  onExpire,
  warnAfterMs = 20 * 60 * 1000,
  expireAfterMs = 22 * 60 * 1000,
}: UseIdleTimerOptions): void {
  // Keep callback refs stable so the effect deps array stays minimal
  const onWarnRef = useRef(onWarn);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onWarnRef.current = onWarn;
  }, [onWarn]);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (warnTimerRef.current !== null) {
        clearTimeout(warnTimerRef.current);
        warnTimerRef.current = null;
      }
      if (expireTimerRef.current !== null) {
        clearTimeout(expireTimerRef.current);
        expireTimerRef.current = null;
      }
    }

    function resetTimers() {
      clearTimers();
      warnTimerRef.current = setTimeout(() => {
        onWarnRef.current();
      }, warnAfterMs);
      expireTimerRef.current = setTimeout(() => {
        onExpireRef.current();
      }, expireAfterMs);
    }

    // Start timers immediately on mount
    resetTimers();

    // Reset on any user activity
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimers, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimers);
      }
    };
  }, [warnAfterMs, expireAfterMs]); // callbacks are read via refs — stable
}
