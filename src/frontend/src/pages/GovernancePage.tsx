import { TopNav } from "@/components/layout/TopNav";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";

export default function GovernancePage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="governance.page"
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
              Governance
            </span>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ShieldCheck className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Governance
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                System governance and trust verification
              </p>
            </div>
          </div>

          {/* Coming soon card */}
          <div
            className="rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <ShieldCheck className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  System Governance
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-slate-500">
                  System governance status, Wasm hash publication, upgrade audit
                  trail, and multi-sig controller management. Coming in a future
                  session.
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
                  Multi-sig controller pending
                </p>
              </div>
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
