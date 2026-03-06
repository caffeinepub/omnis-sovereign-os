import { TopNav } from "@/components/layout/TopNav";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  HardDrive,
  HelpCircle,
  Key,
  Mail,
  MessageSquare,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
    >
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="text-amber-500">{icon}</div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          {title}
        </span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded border px-4 py-3"
      style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
    >
      <div className="mt-0.5 text-amber-500 shrink-0">{icon}</div>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
          {name}
        </p>
        <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Shortcut row ──────────────────────────────────────────────────────────────

function ShortcutRow({
  keys,
  action,
}: {
  keys: string[];
  action: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "#1a2235" }}
    >
      <span className="font-mono text-[10px] text-slate-400">{action}</span>
      <div className="flex items-center gap-1 shrink-0">
        {keys.map((k, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static shortcut key list, order never changes
          <span key={i}>
            {i > 0 && (
              <span className="mx-1 font-mono text-[9px] text-slate-600">
                then
              </span>
            )}
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
              style={{
                backgroundColor: "#1a2235",
                border: "1px solid #2a3347",
              }}
            >
              {k}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HelpPage ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="help.page"
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
              data-ocid="help.hub.link"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Help
            </span>
          </div>

          {/* Page header */}
          <div className="flex items-start gap-4 pb-2">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <HelpCircle className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Help &amp; Reference
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                In-app documentation and guidance
              </p>
            </div>
          </div>

          {/* ── Platform Overview ─────────────────────────────────────── */}
          <Section
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Platform Overview"
          >
            <p className="font-mono text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-white">Omnis Sovereign OS</span>{" "}
              is an enterprise sovereign cloud platform for military and
              corporate organizations — a replacement for Microsoft 365 tools
              running on the{" "}
              <span className="text-amber-400">Internet Computer (ICP)</span>.
            </p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-slate-400">
              Each deployment is{" "}
              <span className="text-white font-semibold">fully sovereign</span>{" "}
              — tamperproof, unstoppable, and under the control of the deploying
              unit. No third-party cloud provider can access, modify, or take
              down your data. The canister runs on-chain and is owned by your
              organization.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Tamperproof", desc: "On-chain Motoko backend" },
                { label: "Unstoppable", desc: "No central point of failure" },
                { label: "Sovereign", desc: "Your keys, your data" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded border px-3 py-2 text-center"
                  style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Module Guide ──────────────────────────────────────────── */}
          <Section
            icon={<FolderOpen className="h-4 w-4" />}
            title="Module Guide"
          >
            <div className="space-y-2">
              <ModuleCard
                icon={<FileText className="h-3.5 w-3.5" />}
                name="Documents"
                description="Classified document management with two-gate access control: clearance level + need-to-know. S2 admins manage folder permissions."
              />
              <ModuleCard
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                name="Messaging"
                description="Secure internal direct messaging. Inbox and sent views, threaded replies, and read receipts. All messages stay on-chain."
              />
              <ModuleCard
                icon={<HardDrive className="h-3.5 w-3.5" />}
                name="File Storage"
                description="Drag-and-drop secure file vault. Files are stored in blob storage and linked to your profile. Persistent across sessions."
              />
              <ModuleCard
                icon={<Users className="h-3.5 w-3.5" />}
                name="Personnel Directory"
                description="Browse all registered personnel with rank, clearance level, and org role. S2 admins can edit sensitive profile fields."
              />
              <ModuleCard
                icon={<Mail className="h-3.5 w-3.5" />}
                name="Email Directory"
                description="Searchable contact directory for all personnel with email addresses and organizational roles."
              />
              <ModuleCard
                icon={<Shield className="h-3.5 w-3.5" />}
                name="Access Monitoring"
                description="S2-only. Real-time anomaly event feed, audit trail, folder activity log, and AI Smart System threat intelligence demo."
              />
            </div>
          </Section>

          {/* ── Keyboard Shortcuts ────────────────────────────────────── */}
          <Section
            icon={<Key className="h-4 w-4" />}
            title="Keyboard Shortcuts"
          >
            <div>
              <ShortcutRow keys={["G", "H"]} action="Go to Hub" />
              <ShortcutRow keys={["G", "D"]} action="Go to Documents" />
              <ShortcutRow keys={["G", "M"]} action="Go to Messaging" />
              <ShortcutRow keys={["G", "N"]} action="Go to Notifications" />
              <ShortcutRow keys={["Ctrl+K"]} action="Open command palette" />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(100,116,139,0.06)",
                borderColor: "#1a2235",
              }}
            >
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Additional shortcuts and a full command palette are planned for
                a future session.
              </p>
            </div>
          </Section>

          {/* ── Security Model ────────────────────────────────────────── */}
          <Section icon={<Shield className="h-4 w-4" />} title="Security Model">
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  Two-Gate Access Control
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  Document access requires passing two independent checks:
                </p>
                <ol className="mt-2 space-y-1 pl-4">
                  <li className="font-mono text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">
                      Gate 1 — Clearance Level:
                    </span>{" "}
                    Your clearance must meet or exceed the folder's required
                    level.
                  </li>
                  <li className="font-mono text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">
                      Gate 2 — Need-to-Know:
                    </span>{" "}
                    You must be explicitly granted access to the folder by an S2
                    admin.
                  </li>
                </ol>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  S2 Admin Role
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  S2 administrators have full system access. They manage
                  clearance levels, folder permissions, need-to-know grants, and
                  anomaly event oversight. S2 admin role requires explicit
                  commander validation.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  Commander Validation
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  Critical roles (S2 admin, commander-level access) require a
                  validation code issued by the commander. This two-person
                  integrity model prevents unilateral privilege escalation.
                </p>
              </div>
            </div>
          </Section>

          {/* ── Deployment & Sovereignty ──────────────────────────────── */}
          <Section
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Deployment & Sovereignty"
          >
            <p className="font-mono text-[10px] leading-relaxed text-slate-400">
              Omnis runs on the{" "}
              <span className="text-amber-400">
                Internet Computer Protocol (ICP)
              </span>
              , a decentralized blockchain network operated by the DFINITY
              Foundation. Your data lives in a canister smart contract — a
              self-contained execution environment that cannot be modified or
              taken offline by any single entity.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div
                className="rounded border px-3 py-2.5"
                style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white mb-1">
                  Current: Single-Tenant
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  One deployment per unit/organization. Full data isolation by
                  default. Recommended for initial deployments.
                </p>
              </div>
              <div
                className="rounded border px-3 py-2.5"
                style={{
                  backgroundColor: "rgba(139,92,246,0.06)",
                  borderColor: "rgba(139,92,246,0.25)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300">
                    Roadmap: Multi-Tenant
                  </p>
                </div>
                <p className="font-mono text-[10px] text-slate-500">
                  One deployment hosting multiple org spaces. Brigade-level
                  management with battalion sub-orgs. Requires future backend
                  update.
                </p>
              </div>
            </div>
          </Section>
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
