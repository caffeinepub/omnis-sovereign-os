import { TopNav } from "@/components/layout/TopNav";

interface StubPageProps {
  title: string;
}

export default function StubPage({ title }: StubPageProps) {
  return (
    <div
      data-ocid="stub.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.2em] text-white">
            {title}
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-widest text-slate-500">
            Coming soon
          </p>
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
