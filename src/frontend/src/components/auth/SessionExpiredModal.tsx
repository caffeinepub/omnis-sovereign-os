import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

interface SessionExpiredModalProps {
  onSignIn: () => void;
}

export function SessionExpiredModal({ onSignIn }: SessionExpiredModalProps) {
  return (
    <div
      data-ocid="session.modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="flex max-w-sm flex-col items-center gap-6 rounded-lg border border-border bg-card px-8 py-10 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2
            id="session-expired-title"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Session Expired
          </h2>
          <p
            id="session-expired-desc"
            className="text-sm text-muted-foreground"
          >
            Your session has expired due to inactivity. Please sign in again to
            continue.
          </p>
        </div>
        <Button
          data-ocid="session.signin_button"
          className="w-full bg-primary font-mono text-sm font-medium uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          onClick={onSignIn}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
