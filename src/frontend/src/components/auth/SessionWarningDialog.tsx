import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface SessionWarningDialogProps {
  open: boolean;
  onStayLoggedIn: () => void;
  onLogOut: () => void;
  tierLabel?: string;
  minutesRemaining?: number;
}

export function SessionWarningDialog({
  open,
  onStayLoggedIn,
  onLogOut,
  tierLabel,
  minutesRemaining,
}: SessionWarningDialogProps) {
  const defaultMsg = minutesRemaining
    ? `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}.`
    : "Your session will expire in 5 minutes.";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        data-ocid="session.dialog"
        className="border-border bg-card text-card-foreground sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-DEFAULT" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="space-y-1 text-muted-foreground">
            <span className="block">{defaultMsg}</span>
            {tierLabel && (
              <span className="block text-xs text-muted-foreground/70">
                {tierLabel}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            data-ocid="session.logout_button"
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
            onClick={onLogOut}
          >
            Log Out
          </Button>
          <Button
            data-ocid="session.stay_logged_in_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onStayLoggedIn}
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
