import { TopNav } from "@/components/layout/TopNav";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CLEARANCE_LABELS, NETWORK_MODE_CONFIGS } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Clock,
  Globe,
  Lock,
  Settings,
  Shield,
  User,
} from "lucide-react";

function SectionCard({
  icon,
  title,
  children,
  badge,
  "data-ocid": dataOcid,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  badge?: string;
  "data-ocid"?: string;
}) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      data-ocid={dataOcid}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="text-amber-500">{icon}</div>
        <span className="flex-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          {title}
        </span>
        {badge && (
          <span
            className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  locked,
}: {
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-b-0"
      style={{ borderColor: "#1a2235" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-300">{value}</span>
        {locked && (
          <div className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5 text-slate-600" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
              S2 Managed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const SENSITIVITY_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, clearanceLevel, isS2Admin } = usePermissions();
  const { mode: networkMode, isSet: networkModeIsSet } = useNetworkMode();

  const clearanceLabel =
    CLEARANCE_LABELS[clearanceLevel] ?? `Level ${clearanceLevel}`;
  const displayName = profile?.name?.trim() || "—";

  return (
    <div
      data-ocid="settings.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" data-ocid="settings.hub.link">
                    Hub
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page header */}
          <div className="flex items-start gap-4 pb-2">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <Settings className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Settings
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Platform configuration
              </p>
            </div>
          </div>

          {/* ── Account ───────────────────────────────────────────────── */}
          <SectionCard icon={<User className="h-4 w-4" />} title="Account">
            <div>
              <FieldRow label="Display Name" value={displayName} />
              <FieldRow
                label="Clearance Level"
                value={`${clearanceLevel} — ${clearanceLabel}`}
                locked
              />
              <FieldRow
                label="Role"
                value={isS2Admin ? "S2 Administrator" : profile?.orgRole || "—"}
                locked
              />
              <FieldRow label="Email" value={profile?.email || "—"} />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(245,158,11,0.05)",
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500/70 mt-0.5" />
              <p className="font-mono text-[10px] leading-relaxed text-amber-400/70">
                Sensitive fields (clearance level, rank, S2 admin role) are
                managed by your S2 administrator. Contact your S2 to update
                these values.
              </p>
            </div>
          </SectionCard>

          {/* ── Security ──────────────────────────────────────────────── */}
          <SectionCard icon={<Shield className="h-4 w-4" />} title="Security">
            <div>
              <FieldRow
                label="Identity Provider"
                value="Internet Identity (ICP)"
              />
              <FieldRow
                label="Session"
                value="Delegated identity — auto-expires"
              />
              <FieldRow
                label="Authentication"
                value="Hardware key / biometric"
              />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(100,116,139,0.06)",
                borderColor: "#1a2235",
              }}
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
              <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                Advanced security settings (session timeout configuration, MFA
                policy, CAC integration) require a future backend update.
              </p>
            </div>
          </SectionCard>

          {/* ── Network Mode ──────────────────────────────────────────── */}
          <SectionCard
            icon={<Globe className="h-4 w-4" />}
            title="Network Mode"
            data-ocid="settings.network_mode.card"
          >
            {networkModeIsSet && networkMode ? (
              <>
                {(() => {
                  const config = NETWORK_MODE_CONFIGS[networkMode];
                  const isMilitary = config.group === "military";
                  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
                  const accentBg = isMilitary
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(139,92,246,0.08)";
                  const accentBorder = isMilitary
                    ? "rgba(59,130,246,0.3)"
                    : "rgba(139,92,246,0.3)";
                  const sensitivity =
                    SENSITIVITY_LABELS[config.monitoringSensitivity];
                  return (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                          style={{
                            backgroundColor: accentBg,
                            color: accentColor,
                            border: `1px solid ${accentBorder}`,
                          }}
                        >
                          {config.shortCode}
                        </span>
                        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-white">
                          {config.label}
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] leading-relaxed text-slate-400">
                        {config.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                          Monitoring Sensitivity:
                        </span>
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest font-semibold"
                          style={{ color: sensitivity.color }}
                        >
                          {sensitivity.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {isS2Admin && (
                  <button
                    type="button"
                    data-ocid="settings.network_mode.change_button"
                    onClick={() => void navigate({ to: "/network-mode-setup" })}
                    className="mt-4 flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                    style={{ borderColor: "rgba(245,158,11,0.3)" }}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Change Mode
                  </button>
                )}
              </>
            ) : (
              <div
                className="flex items-start gap-2.5 rounded border px-3 py-2.5"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.25)",
                }}
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                    Network mode not configured. Contact your S2 admin.
                  </p>
                  {isS2Admin && (
                    <button
                      type="button"
                      data-ocid="settings.network_mode.change_button"
                      onClick={() =>
                        void navigate({ to: "/network-mode-setup" })
                      }
                      className="mt-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 underline underline-offset-2 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2"
                    >
                      Configure Now →
                    </button>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Organization ──────────────────────────────────────────── */}
          <SectionCard
            icon={<Building2 className="h-4 w-4" />}
            title="Organization"
          >
            <div>
              <FieldRow label="Deployment Model" value="Single-Tenant" />
              <FieldRow label="Data Isolation" value="Per-deployment (full)" />
              <FieldRow
                label="Multi-Unit Support"
                value="One deployment per unit"
              />
            </div>

            <div
              className="mt-4 rounded border px-4 py-3 space-y-2"
              style={{
                backgroundColor: "#0a111f",
                borderColor: "#1e2d45",
              }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Multi-Tenant Org Namespacing
                </span>
                <Badge
                  className="ml-auto font-mono text-[9px] uppercase tracking-widest"
                  style={{
                    backgroundColor: "rgba(139,92,246,0.12)",
                    color: "#a78bfa",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  Roadmap
                </Badge>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                Option B: one deployment serving multiple units/organizations
                with hard data isolation. Each unit would have its own org
                namespace, scoped users, and S2 admin. Cross-org access requires
                explicit multi-org grant.
              </p>
              <p className="font-mono text-[10px] text-slate-600">
                Requires a future Motoko backend update (Organization entity,
                orgId scoping on all queries).
              </p>
            </div>
          </SectionCard>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
