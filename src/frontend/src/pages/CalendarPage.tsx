import { TopNav } from "@/components/layout/TopNav";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, ChevronRight, Clock, Users } from "lucide-react";

export default function CalendarPage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="calendar.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Calendar
            </span>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <Calendar className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Calendar
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Shared &amp; personal organization calendar
              </p>
            </div>
          </div>

          {/* Feature preview card */}
          <div
            className="mb-6 rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <Calendar className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Shared &amp; Personal Calendar
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-slate-400">
                  Outlook-style shared and personal calendars for your
                  organization — scheduling, events, and coordination. Backend
                  wiring is planned for a future session.
                </p>
              </div>
              <div
                className="rounded border px-4 py-2"
                style={{
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  Backend integration planned
                </p>
              </div>
            </div>
          </div>

          {/* Planned features grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Personal Calendar
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Private scheduling, reminders, and personal time management.
              </p>
            </div>
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Shared Calendars
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Org-wide and section-level shared calendars for coordination.
              </p>
            </div>
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Scheduling
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Meeting scheduling, availability lookup, and event invitations.
              </p>
            </div>
          </div>
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
