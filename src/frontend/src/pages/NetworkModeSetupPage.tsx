import { NETWORK_MODE_CONFIGS, type NetworkMode } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const SENSITIVITY_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" },
};

const MILITARY_MODES: NetworkMode[] = ["military-nipr", "military-sipr"];
const CORPORATE_MODES: NetworkMode[] = [
  "corporate-standard",
  "corporate-secure",
];

function ModeCard({
  mode,
  selected,
  onSelect,
}: {
  mode: NetworkMode;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = NETWORK_MODE_CONFIGS[mode];
  const isMilitary = config.group === "military";
  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
  const accentBg = isMilitary
    ? "rgba(59,130,246,0.08)"
    : "rgba(139,92,246,0.08)";
  const accentBorder = isMilitary
    ? "rgba(59,130,246,0.3)"
    : "rgba(139,92,246,0.3)";

  const sensitivity = SENSITIVITY_LABELS[config.monitoringSensitivity];

  const ocidMap: Record<NetworkMode, string> = {
    "military-nipr": "network_mode_setup.military_nipr.card",
    "military-sipr": "network_mode_setup.military_sipr.card",
    "corporate-standard": "network_mode_setup.corporate_standard.card",
    "corporate-secure": "network_mode_setup.corporate_secure.card",
  };

  return (
    <motion.button
      type="button"
      data-ocid={ocidMap[mode]}
      onClick={onSelect}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="relative w-full rounded border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500/40"
      style={{
        backgroundColor: selected ? "rgba(245,158,11,0.07)" : "#0f1626",
        borderColor: selected ? "#f59e0b" : accentBorder,
        boxShadow: selected
          ? "0 0 0 1px rgba(245,158,11,0.15), 0 0 16px rgba(245,158,11,0.06)"
          : "none",
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <CheckCircle2
          className="absolute right-3 top-3 h-4 w-4"
          style={{ color: "#f59e0b" }}
        />
      )}

      {/* Short code badge */}
      <span
        className="mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{
          backgroundColor: accentBg,
          color: accentColor,
          border: `1px solid ${accentBorder}`,
        }}
      >
        {config.shortCode}
      </span>

      {/* Label */}
      <p className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-white">
        {config.label}
      </p>

      {/* Description */}
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400">
        {config.description}
      </p>

      {/* Monitoring sensitivity */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          Monitoring:
        </span>
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: sensitivity.color }}
        >
          {sensitivity.label}
        </span>
      </div>
    </motion.button>
  );
}

export default function NetworkModeSetupPage() {
  const { setMode } = useNetworkMode();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NetworkMode | null>(null);

  function handleConfirm() {
    if (!selected) return;
    setMode(selected);
    void navigate({ to: "/onboarding" });
  }

  return (
    <div
      data-ocid="network_mode_setup.page"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
          >
            <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.25em] text-white">
            Network Mode Setup
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500">
            Select your deployment network type
          </p>
        </motion.div>

        {/* Group: Military */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(59,130,246,0.2)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/70">
              Military
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(59,130,246,0.2)" }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {MILITARY_MODES.map((m) => (
              <ModeCard
                key={m}
                mode={m}
                selected={selected === m}
                onSelect={() => setSelected(m)}
              />
            ))}
          </div>
        </motion.div>

        {/* Group: Corporate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.14,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(139,92,246,0.2)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
              Corporate
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(139,92,246,0.2)" }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CORPORATE_MODES.map((m) => (
              <ModeCard
                key={m}
                mode={m}
                selected={selected === m}
                onSelect={() => setSelected(m)}
              />
            ))}
          </div>
        </motion.div>

        {/* Confirm button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <button
            type="button"
            data-ocid="network_mode_setup.confirm_button"
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full rounded border px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            style={{
              backgroundColor: selected ? "#f59e0b" : "#1a2235",
              color: selected ? "#0a0e1a" : "#64748b",
              borderColor: selected ? "#f59e0b" : "#1a2235",
            }}
          >
            {selected
              ? `Confirm — ${NETWORK_MODE_CONFIGS[selected].shortCode}`
              : "Select a Mode to Continue"}
          </button>

          {/* Info note */}
          <div
            className="flex items-start gap-2.5 rounded border px-4 py-3"
            style={{
              backgroundColor: "rgba(100,116,139,0.05)",
              borderColor: "#1a2235",
            }}
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
            <p className="font-mono text-[10px] leading-relaxed text-slate-600">
              This can be changed later in Settings (S2 admin only). This
              setting is currently stored locally until a future backend update.
            </p>
          </div>

          {/* Warning for SIPR */}
          {selected === "military-sipr" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2.5 rounded border px-4 py-3"
              style={{
                backgroundColor: "rgba(239,68,68,0.05)",
                borderColor: "rgba(239,68,68,0.25)",
              }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="font-mono text-[10px] leading-relaxed text-red-400/80">
                SIPR mode enables maximum monitoring sensitivity. All document
                access, messaging, and user activity will be subject to
                heightened anomaly detection.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
