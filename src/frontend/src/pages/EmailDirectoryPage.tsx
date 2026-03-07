import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useMemo, useRef, useState } from "react";

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

const TABLE_SKELETON_IDS = ["a", "b", "c", "d", "e"];

function TableSkeleton() {
  return (
    <tbody data-ocid="email_directory.loading_state">
      {TABLE_SKELETON_IDS.map((id) => (
        <tr key={id} className="border-b" style={{ borderColor: "#1a2235" }}>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="160px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="80px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="200px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="120px" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Main EmailDirectoryPage ──────────────────────────────────────────────────

export default function EmailDirectoryPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  // Displayed value updates immediately; filter state is debounced
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(val: string) {
    setInputValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 200);
  }

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: profiles = [], isLoading } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "email-directory-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.orgRole.toLowerCase().includes(q),
    );
  }, [profiles, searchQuery]);

  return (
    <div
      data-ocid="email_directory.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Email Directory
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Mail className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Email Directory
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                {isLoading
                  ? "Loading..."
                  : `${filteredProfiles.length} of ${profiles.length} contacts`}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-5">
            <Input
              data-ocid="email_directory.search_input"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or role..."
              className="max-w-sm border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
          </div>

          {/* Table */}
          <div
            className="overflow-hidden rounded border"
            style={{ borderColor: "#1a2235" }}
          >
            <table className="w-full table-auto">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: "#0f1626",
                    borderColor: "#1a2235",
                  }}
                >
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Rank
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Role
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton />
              ) : filteredProfiles.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={4}>
                      <div data-ocid="email_directory.empty_state">
                        <EmptyState
                          icon={<Mail />}
                          message="No contacts found"
                          className="py-16"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {filteredProfiles.map((profile, idx) => (
                    <tr
                      key={profile.principalId.toString()}
                      data-ocid={`email_directory.row.${idx + 1}`}
                      className="border-b transition-colors last:border-b-0 hover:bg-white/[0.025]"
                      style={{ borderColor: "#1a2235" }}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-white">
                          {profile.name || "—"}
                        </span>
                      </td>

                      {/* Rank */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">
                          {profile.rank || "—"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        {profile.email ? (
                          <a
                            href={`mailto:${profile.email}`}
                            className="font-mono text-xs text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline"
                          >
                            {profile.email}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-slate-600">
                            —
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">
                          {profile.orgRole || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
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
