import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";

interface SIPRReauthDialogProps {
  open: boolean;
  documentTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SIPRReauthDialog({
  open,
  documentTitle,
  onConfirm,
  onCancel,
}: SIPRReauthDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        data-ocid="sipr_reauth.dialog"
        className="border-border bg-card text-card-foreground sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-white">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            Identity Verification Required
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1">
            <span
              className="block font-mono text-xs text-slate-400"
              style={{
                borderLeft: "3px solid rgba(248,113,113,0.5)",
                paddingLeft: "0.75rem",
              }}
            >
              &ldquo;{documentTitle}&rdquo;
            </span>
            <span className="block font-mono text-xs text-slate-400">
              This document is classified{" "}
              <span className="font-bold text-red-400">SIPR or above</span>. You
              must verify your identity before accessing it. You will be
              prompted to re-authenticate.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            data-ocid="sipr_reauth.cancel_button"
            variant="outline"
            className="border-border font-mono text-xs uppercase tracking-wider text-foreground hover:bg-accent"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            data-ocid="sipr_reauth.confirm_button"
            className="gap-2 bg-amber-500 font-mono text-xs uppercase tracking-wider text-black hover:bg-amber-400"
            onClick={onConfirm}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Verify Identity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
