/**
 * ProfilePreviewPage — Demo preview of 1SG Nicholas J. Gracie's profile.
 * This is a static visual preview only. No backend reads or writes.
 */

import { TopNav } from "@/components/layout/TopNav";
import { ClearanceBadge } from "@/components/shared/ClearanceBadge";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeft,
  AtSign,
  Building2,
  Calendar,
  Lock,
  Mail,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

const DEMO = {
  name: "1SG GRACIE, Nicholas J",
  firstName: "Nicholas",
  lastName: "GRACIE",
  mi: "J",
  rank: "First Sergeant (1SG)",
  branch: "Army",
  category: "Enlisted",
  payGrade: "E-8",
  email: "nicholas.j.gracie.mil@army.mil",
  unit: "HHC, 1-501ST PIR",
  orgRole: "First Sergeant",
  clearanceLevel: 4,
  clearanceLabel: "TS/SCI",
  isS2Verified: true,
  isS2Admin: false,
  verifiedNote: "Verified by S2 — fields locked",
  joined: "Omnis Sovereign OS",
};

function FieldRow({
  icon: Icon,
  label,
  value,
  locked,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded border px-4 py-3"
      style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          {label}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-white">{value}</p>
      </div>
      {locked && <Lock className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />}
    </div>
  );
}

export default function ProfilePreviewPage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="profile_preview.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back nav */}
          <button
            type="button"
            data-ocid="profile_preview.back_button"
            onClick={() => void navigate({ to: "/personnel" })}
            className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-amber-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Personnel
          </button>

          {/* Preview banner */}
          <div
            className="mb-6 flex items-center gap-3 rounded border px-4 py-2.5"
            style={{
              backgroundColor: "rgba(245,158,11,0.06)",
              borderColor: "#f59e0b",
            }}
          >
            <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
              Profile Preview — Demo data only. This profile is not stored in
              the backend.
            </p>
          </div>

          {/* Profile card */}
          <div
            className="rounded-lg border"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {/* Header band */}
            <div
              className="flex flex-col items-center gap-4 border-b px-6 py-8 sm:flex-row sm:items-start"
              style={{ borderColor: "#1a2235" }}
            >
              {/* Avatar */}
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 font-mono text-2xl font-bold tracking-wider"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                  color: "#f59e0b",
                }}
              >
                NJG
              </div>

              {/* Name + badges */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="font-mono text-xl font-bold uppercase tracking-[0.15em] text-white">
                    {DEMO.name}
                  </h1>
                  <VerifiedBadge />
                </div>
                <p className="mt-1 font-mono text-sm uppercase tracking-wider text-slate-400">
                  {DEMO.rank}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {DEMO.branch} · {DEMO.category} · Pay Grade {DEMO.payGrade}
                </p>

                {/* Clearance + verification row */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <ClearanceBadge level={DEMO.clearanceLevel} />
                  {DEMO.isS2Verified && (
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-amber-500/80">
                        S2 Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Field grid */}
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <FieldRow
                icon={User}
                label="Full Name (DoD Standard)"
                value={`${DEMO.lastName}, ${DEMO.firstName} ${DEMO.mi}`}
                locked
              />
              <FieldRow
                icon={Star}
                label="Rank / Pay Grade"
                value={`${DEMO.rank} · ${DEMO.payGrade}`}
                locked
              />
              <FieldRow icon={Building2} label="Unit" value={DEMO.unit} />
              <FieldRow
                icon={User}
                label="Organizational Role"
                value={DEMO.orgRole}
              />
              <FieldRow icon={Mail} label="Email" value={DEMO.email} />
              <FieldRow
                icon={AtSign}
                label="Branch"
                value={`${DEMO.branch} — ${DEMO.category}`}
              />
              <div
                className="flex items-start gap-3 rounded border px-4 py-3 sm:col-span-2"
                style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
              >
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/60" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                    Clearance Level
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-amber-500">
                    {DEMO.clearanceLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Locked fields notice */}
            <div
              className="mx-6 mb-6 flex items-center gap-2 rounded border px-4 py-2.5"
              style={{
                backgroundColor: "rgba(245,158,11,0.04)",
                borderColor: "#2a3347",
              }}
            >
              <Lock className="h-3 w-3 shrink-0 text-slate-600" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                {DEMO.verifiedNote}. Name and rank are read-only for this user.
                S2 admin can edit.
              </p>
            </div>

            {/* Footer actions */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4"
              style={{ borderColor: "#1a2235" }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  Account registered in {DEMO.joined}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="profile_preview.back_button_footer"
                  className="border font-mono text-xs uppercase tracking-wider text-slate-400"
                  style={{ borderColor: "#2a3347" }}
                  onClick={() => void navigate({ to: "/personnel" })}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  data-ocid="profile_preview.send_message.button"
                  className="font-mono text-xs uppercase tracking-wider"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  onClick={() => void navigate({ to: "/messages" })}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
