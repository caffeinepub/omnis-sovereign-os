import { TopNav } from "@/components/layout/TopNav";
import { Badge } from "@/components/ui/badge";
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  Clock,
  Eye,
  Lock,
  Monitor,
  Settings,
  Shield,
  User,
} from "lucide-react";

function SectionCard({
  icon,
  title,
  children,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, clearanceLevel, isS2Admin } = usePermissions();

  const clearanceLabel =
    CLEARANCE_LABELS[clearanceLevel] ?? `Level ${clearanceLevel}`;
  const displayName = profile
    ? `${profile.rank} ${profile.name}`.trim() || "—"
    : "—";

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="settings.hub.link"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Settings
            </span>
          </div>

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

          {/* ── Display ───────────────────────────────────────────────── */}
          <SectionCard
            icon={<Monitor className="h-4 w-4" />}
            title="Display"
            badge="Coming Soon"
          >
            <div>
              <FieldRow label="Theme" value="Dark — Military (fixed)" />
              <FieldRow label="Font" value="Geist Mono / JetBrains Mono" />
              <FieldRow label="Density" value="Compact" />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(100,116,139,0.06)",
                borderColor: "#1a2235",
              }}
            >
              <Eye className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
              <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                Display customization (theme selection, layout density, font
                scaling) is planned. The current dark military theme is fixed
                for all users.
              </p>
            </div>
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
