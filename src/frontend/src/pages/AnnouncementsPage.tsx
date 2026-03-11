import type { BroadcastMessage } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useBroadcastMessages,
  useCreateBroadcastMessage,
  useMarkBroadcastRead,
} from "@/hooks/useQueries";
import { formatRelativeTime } from "@/lib/formatters";
import { Link } from "@tanstack/react-router";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { useState } from "react";

const CLASSIFICATIONS = [
  "UNCLASSIFIED",
  "CUI",
  "CONFIDENTIAL",
  "SECRET",
  "TOP SECRET",
];

const CLASSIFICATION_COLORS: Record<string, string> = {
  UNCLASSIFIED: "#22c55e",
  CUI: "#f59e0b",
  CONFIDENTIAL: "#3b82f6",
  SECRET: "#f97316",
  "TOP SECRET": "#ef4444",
};

export default function AnnouncementsPage() {
  const { isS2Admin, profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const { data: messages = [], isLoading } = useBroadcastMessages();
  const markRead = useMarkBroadcastRead();
  const createMsg = useCreateBroadcastMessage();

  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [classification, setClassification] = useState("UNCLASSIFIED");

  const sorted = [...messages].sort((a, b) => Number(b.sentAt - a.sentAt));

  async function handleCreate() {
    if (!identity || !actor) return;
    const orgId = profile?.orgId ?? "";
    await createMsg.mutateAsync({
      messageId: crypto.randomUUID(),
      orgId,
      fromUserId: identity.getPrincipal(),
      title: title.trim(),
      body: body.trim(),
      sentAt: BigInt(Date.now()) * 1_000_000n,
      classification,
    });
    setTitle("");
    setBody("");
    setClassification("UNCLASSIFIED");
    setShowDialog(false);
  }

  return (
    <div
      data-ocid="announcements.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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
                  <BreadcrumbPage>Announcements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                <Megaphone className="h-6 w-6" style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Announcements
                </h1>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500">
                  Org-wide broadcast communications
                </p>
              </div>
            </div>
            {isS2Admin && (
              <Button
                data-ocid="announcements.compose.primary_button"
                onClick={() => setShowDialog(true)}
                className="gap-2 font-mono text-xs uppercase tracking-wider"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                <Plus className="h-3.5 w-3.5" />
                New Announcement
              </Button>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div data-ocid="announcements.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded"
                  style={{ backgroundColor: "#1a2235" }}
                />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              data-ocid="announcements.empty_state"
              className="flex flex-col items-center gap-3 rounded border py-16"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <Megaphone className="h-10 w-10 text-slate-700" />
              <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                No announcements yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((msg: BroadcastMessage, idx) => (
                <div
                  key={msg.messageId}
                  data-ocid={`announcements.item.${idx + 1}`}
                  className="rounded border px-5 py-4"
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          color:
                            CLASSIFICATION_COLORS[msg.classification] ??
                            "#64748b",
                          backgroundColor: `${CLASSIFICATION_COLORS[msg.classification] ?? "#64748b"}18`,
                        }}
                      >
                        {msg.classification}
                      </span>
                      <h3 className="font-mono text-sm font-bold text-white">
                        {msg.title}
                      </h3>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-slate-600">
                      {formatRelativeTime(msg.sentAt)}
                    </span>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-slate-400">
                    {msg.body}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      data-ocid={`announcements.mark_read.button.${idx + 1}`}
                      className="font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-400"
                      onClick={() => void markRead.mutateAsync(msg.messageId)}
                    >
                      Mark Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Compose Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          data-ocid="announcements.compose.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Broadcast Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                data-ocid="announcements.title.input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                data-ocid="announcements.body.textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Classification
              </Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger
                  data-ocid="announcements.classification.select"
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  {CLASSIFICATIONS.map((c) => (
                    <SelectItem key={c} value={c} className="font-mono text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="announcements.compose.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowDialog(false)}
              disabled={createMsg.isPending}
            >
              Cancel
            </Button>
            <Button
              data-ocid="announcements.compose.submit_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => void handleCreate()}
              disabled={createMsg.isPending || !title.trim() || !body.trim()}
            >
              {createMsg.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Broadcast"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
