import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export function CommanderValidationBanner() {
  const { isS2Admin, isValidatedByCommander } = usePermissions();
  const navigate = useNavigate();

  if (!isS2Admin || isValidatedByCommander) return null;

  return (
    <button
      type="button"
      data-ocid="commander_validation.banner"
      onClick={() => void navigate({ to: "/validate-commander" })}
      className="flex w-full items-center justify-center gap-2 bg-amber px-4 py-2 text-center font-mono text-xs font-semibold uppercase tracking-widest text-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      style={{ backgroundColor: "#f59e0b" }}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      S2 Admin validation required. Click here to validate.
    </button>
  );
}
