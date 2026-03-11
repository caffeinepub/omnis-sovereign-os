import type { GovernanceRecord } from "@/backend.d";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/contexts/PermissionsContext";
import {
  useCommanderAuthCodeStatus,
  useGenerateCommanderAuthCode,
  useGovernanceLog,
  useRotateCommanderAuthCode,
  useWasmHash,
} from "@/hooks/useQueries";
import { formatDateTime } from "@/lib/formatters";
import { Link } from "@tanstack/react-router";
import { Copy, Hash, Key, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function truncateHash(h: string) {
  if (!h) return "—";
  if (h.length <= 20) return h;
  return `${h.slice(0, 10)}…${h.slice(-8)}`;
}

export default function GovernancePage() {
  const { isS2Admin } = usePermissions();
  const { data: govLog = [], isLoading: logLoading } = useGovernanceLog();
  const { data: wasmHash = "", isLoading: hashLoading } = useWasmHash();
  const { data: codeActive } = useCommanderAuthCodeStatus();
  const generateCode = useGenerateCommanderAuthCode();
  const rotateCode = useRotateCommanderAuthCode();

  const [generatedCode, setGeneratedCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  async function handleGenerate() {
    try {
      const code = await generateCode.mutateAsync();
      setGeneratedCode(code);
      setShowCode(true);
    } catch {
      // error handled in hook
    }
  }

  async function handleRotate() {
    try {
      const code = await rotateCode.mutateAsync();
      setGeneratedCode(code);
      setShowCode(true);
    } catch {
      // error handled in hook
    }
  }

  return (
    <div
      data-ocid="governance.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Governance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ShieldCheck className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div className="flex-1">
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Governance
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                System trust, audit trail, and authorization
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Wasm Hash */}
            <div
              className="rounded border p-5"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-500" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                  Canister Wasm Hash
                </h2>
              </div>
              {hashLoading ? (
                <Skeleton
                  className="h-6 w-full"
                  style={{ backgroundColor: "#1a2235" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-2 py-1.5 font-mono text-[10px] text-slate-300"
                    style={{
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347",
                    }}
                  >
                    {wasmHash || "Not published"}
                  </code>
                  {wasmHash && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 border p-0"
                      style={{
                        borderColor: "#2a3347",
                        backgroundColor: "transparent",
                      }}
                      onClick={() => {
                        void navigator.clipboard.writeText(wasmHash);
                        toast.success("Hash copied");
                      }}
                    >
                      <Copy className="h-3 w-3 text-slate-400" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Commander Auth Code — S2 only */}
            {isS2Admin && (
              <div
                className="rounded border p-5"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-500" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                    Commander Auth Code
                  </h2>
                  <Badge
                    className="ml-auto font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      backgroundColor: codeActive
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(100,116,139,0.15)",
                      color: codeActive ? "#22c55e" : "#64748b",
                      border: "none",
                    }}
                  >
                    {codeActive ? "Active" : "No code"}
                  </Badge>
                </div>

                {showCode && generatedCode && (
                  <div
                    className="mb-3 rounded border px-3 py-2"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.05)",
                      borderColor: "rgba(245,158,11,0.3)",
                    }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      Current code — share securely with designated S2
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 font-mono text-sm font-bold tracking-[0.15em] text-amber-400">
                        {generatedCode}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 border p-0"
                        style={{
                          borderColor: "rgba(245,158,11,0.4)",
                          backgroundColor: "transparent",
                        }}
                        onClick={() => {
                          void navigator.clipboard.writeText(generatedCode);
                          toast.success("Code copied");
                        }}
                      >
                        <Copy className="h-3 w-3 text-amber-400" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    data-ocid="governance.generate_code.primary_button"
                    className="h-7 flex-1 font-mono text-[10px] uppercase tracking-wider"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                    onClick={() => void handleGenerate()}
                    disabled={generateCode.isPending}
                  >
                    {generateCode.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  {codeActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="governance.rotate_code.secondary_button"
                      className="h-7 flex-1 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                      style={{
                        borderColor: "#2a3347",
                        backgroundColor: "transparent",
                      }}
                      onClick={() => void handleRotate()}
                      disabled={rotateCode.isPending}
                    >
                      {rotateCode.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Rotate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Governance Log */}
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                Governance Event Log
              </h2>
              {logLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
              )}
            </div>

            {logLoading ? (
              <div
                data-ocid="governance.log.loading_state"
                className="space-y-2"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-full rounded"
                    style={{ backgroundColor: "#1a2235" }}
                  />
                ))}
              </div>
            ) : govLog.length === 0 ? (
              <div
                data-ocid="governance.log.empty_state"
                className="flex flex-col items-center gap-3 rounded border py-12"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <ShieldCheck className="h-8 w-8 text-slate-700" />
                <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                  No governance events logged
                </p>
              </div>
            ) : (
              <div
                className="overflow-hidden rounded border"
                style={{ borderColor: "#1a2235" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        borderColor: "#1a2235",
                        backgroundColor: "#0d1525",
                      }}
                    >
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        Event
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        Description
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        Timestamp
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        Wasm
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...govLog]
                      .sort((a, b) => Number(b.timestamp - a.timestamp))
                      .map((r: GovernanceRecord, idx) => (
                        <TableRow
                          key={r.recordId}
                          data-ocid={`governance.log.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {r.eventType}
                          </TableCell>
                          <TableCell className="max-w-xs font-mono text-xs text-slate-300">
                            {r.description}
                          </TableCell>
                          <TableCell className="font-mono text-[10px] text-slate-500">
                            {formatDateTime(r.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-[10px] text-slate-600">
                            {truncateHash(r.wasmHash)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
