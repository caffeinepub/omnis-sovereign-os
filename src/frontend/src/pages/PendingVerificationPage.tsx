import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ShieldAlert } from "lucide-react";

export default function PendingVerificationPage() {
  const { clear } = useInternetIdentity();

  const handleSignOut = () => {
    clear();
    window.location.href = "/login";
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex max-w-md flex-col items-center gap-8">
        {/* Icon */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_40px_oklch(0.72_0.175_70_/_0.25)]"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            borderColor: "rgba(245, 158, 11, 0.35)",
          }}
        >
          <ShieldAlert className="h-10 w-10" style={{ color: "#f59e0b" }} />
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-mono text-2xl font-bold uppercase tracking-widest"
            style={{ color: "#f0f4ff" }}
          >
            PENDING VERIFICATION
          </h1>
          <p className="font-mono text-sm text-slate-400">
            Your access is pending S2 verification.
          </p>
        </div>

        {/* Divider */}
        <div className="flex w-64 items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "#1a2235" }} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
            HOLD
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "#1a2235" }} />
        </div>

        {/* Body */}
        <p className="max-w-sm font-mono text-xs leading-relaxed text-slate-500">
          You will be notified when your account is activated. If you believe
          this is an error, contact your S2 or security officer.
        </p>

        {/* Status indicator */}
        <div
          className="flex w-full items-center gap-3 rounded border px-4 py-3"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Awaiting S2 approval
          </span>
        </div>

        {/* Sign out */}
        <button
          type="button"
          data-ocid="pending.sign_out_button"
          onClick={handleSignOut}
          className="font-mono text-xs uppercase tracking-widest text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline"
        >
          Sign Out
        </button>
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="absolute bottom-6 font-mono text-xs text-slate-700">
        OMNIS-OS · ACCESS RESTRICTED
      </div>
    </div>
  );
}
