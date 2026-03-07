import type { ExtendedProfile, Message } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import {
  Inbox,
  Loader2,
  MessageSquare,
  PenSquare,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFullDate(ts: bigint): string {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string },
): string {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match ? `${match.rank} ${match.name}`.trim() : "Unknown";
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function MessageListSkeleton() {
  return (
    <div data-ocid="messages.inbox.loading_state" className="space-y-1 p-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} height="56px" className="w-full" />
      ))}
    </div>
  );
}

// ─── Compose Modal ────────────────────────────────────────────────────────────

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string };
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onSent: () => void;
  onSwitchToSent: () => void;
}

function ComposeModal({
  open,
  onOpenChange,
  profiles,
  callerPrincipal,
  actor,
  onSent,
  onSwitchToSent,
}: ComposeModalProps) {
  const [toUserId, setToUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setToUserId("");
      setSubject("");
      setBody("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!toUserId) errs.to = "Recipient is required.";
    if (!subject.trim()) errs.subject = "Subject is required.";
    if (!body.trim()) errs.body = "Message body is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const recipientProfile = profiles.find(
        (p) => p.principalId.toString() === toUserId,
      );
      if (!recipientProfile) throw new Error("Recipient not found");

      const message: Message = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: undefined,
        toUserId: recipientProfile.principalId,
        fromUserId: callerPrincipal as unknown as Message["fromUserId"],
        subject: subject.trim(),
        body: body.trim(),
        sentAt: BigInt(Date.now()),
      };

      await actor.sendMessage(message);
      toast.success("Message sent");
      onOpenChange(false);
      onSent();
      onSwitchToSent();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter out self and unregistered users from recipient list
  const recipientOptions = profiles.filter(
    (p) =>
      p.principalId.toString() !== callerPrincipal.toString() &&
      p.registered === true,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="messages.compose.modal"
        className="border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              To <span className="text-red-400">*</span>
            </Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger
                data-ocid="messages.compose.to.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="Select recipient…" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {recipientOptions.map((p) => (
                  <SelectItem
                    key={p.principalId.toString()}
                    value={p.principalId.toString()}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {p.rank} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={errors.to} />
          </div>

          {/* Subject */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Subject <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="messages.compose.subject.input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Enter subject…"
            />
            <FormError message={errors.subject} />
          </div>

          {/* Body */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              data-ocid="messages.compose.body.textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Type your message…"
              rows={5}
            />
            <FormError message={errors.body} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="messages.compose.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347" }}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="messages.compose.submit_button"
            className="gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────────

interface MessageRowProps {
  message: Message;
  profiles: ExtendedProfile[];
  isSelected: boolean;
  isSent: boolean;
  index: number;
  onClick: () => void;
}

function MessageRow({
  message,
  profiles,
  isSelected,
  isSent,
  index,
  onClick,
}: MessageRowProps) {
  const isUnread = !message.read && !isSent;
  const otherParty = isSent
    ? getProfileName(profiles, message.toUserId)
    : getProfileName(profiles, message.fromUserId);

  // Don't show deleted messages
  if (message.deleted) return null;

  return (
    <button
      type="button"
      data-ocid={
        isSent ? `messages.sent.row.${index}` : `messages.inbox.row.${index}`
      }
      onClick={onClick}
      className={cn(
        "relative w-full rounded-sm px-3 py-3 text-left transition-colors",
        isSelected
          ? "bg-amber-500/10 border-l-2 border-amber-500"
          : "border-l-2 border-transparent hover:bg-white/[0.03]",
        isUnread && "bg-white/[0.02]",
      )}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <span
          className="absolute left-[-1px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "#f59e0b" }}
          aria-label="Unread"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "truncate font-mono text-[11px] uppercase tracking-wider",
            isUnread ? "font-bold text-white" : "text-slate-300",
          )}
        >
          {otherParty}
        </span>
        <span className="shrink-0 font-mono text-[9px] text-slate-600">
          {formatRelativeTime(message.sentAt)}
        </span>
      </div>
      <p
        className={cn(
          "mt-0.5 truncate font-mono text-[10px]",
          isUnread ? "font-semibold text-slate-200" : "text-slate-500",
        )}
      >
        {message.subject}
      </p>
    </button>
  );
}

// ─── Thread View ──────────────────────────────────────────────────────────────

interface ThreadViewProps {
  message: Message;
  allMessages: Message[];
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string };
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onDeleted: (id: string) => void;
  onReplySent: () => void;
}

function ThreadView({
  message,
  allMessages,
  profiles,
  callerPrincipal,
  actor,
  onDeleted,
  onReplySent,
}: ThreadViewProps) {
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find thread root id
  const threadRootId = message.parentMessageId ?? message.id;

  // Build thread: original message + all replies sharing same thread root
  const threadMessages = allMessages
    .filter(
      (m) =>
        !m.deleted &&
        (m.id === threadRootId ||
          m.parentMessageId === threadRootId ||
          m.id === message.id ||
          m.parentMessageId === message.id),
    )
    .sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));

  // Deduplicate by id
  const seen = new Set<string>();
  const uniqueThread = threadMessages.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // Scroll to bottom of thread on open
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is a stable ref, intentionally run only on message.id change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [message.id]);

  async function handleSendReply() {
    if (!replyBody.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }
    setReplyError("");
    setIsSendingReply(true);
    try {
      const reply: Message = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: threadRootId,
        toUserId:
          message.fromUserId.toString() === callerPrincipal.toString()
            ? message.toUserId
            : message.fromUserId,
        fromUserId: callerPrincipal as unknown as Message["fromUserId"],
        subject: message.subject.startsWith("Re: ")
          ? message.subject
          : `Re: ${message.subject}`,
        body: replyBody.trim(),
        sentAt: BigInt(Date.now()),
      };
      await actor.replyToMessage(reply);
      setReplyBody("");
      toast.success("Reply sent");
      onReplySent();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await actor.deleteMessage(message.id);
      toast.success("Message deleted");
      onDeleted(message.id);
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  const senderName = getProfileName(profiles, message.fromUserId);
  const recipientName = getProfileName(profiles, message.toUserId);

  return (
    <div
      data-ocid="messages.thread.panel"
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Thread header */}
      <div
        className="shrink-0 border-b px-5 py-4"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
              {message.subject}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                From: <span className="text-slate-300">{senderName}</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                To: <span className="text-slate-300">{recipientName}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-600">
                {formatFullDate(message.sentAt)}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="messages.thread.delete.open_modal_button"
            className="h-7 w-7 shrink-0 p-0 text-slate-500 hover:text-red-400"
            onClick={() => setDeleteOpen(true)}
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Message"
        description="This message will be permanently deleted. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Thread messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-0 divide-y" style={{ borderColor: "#1a2235" }}>
          {uniqueThread.map((msg, idx) => {
            const isFromCaller =
              msg.fromUserId.toString() === callerPrincipal.toString();
            const msgSenderName = getProfileName(profiles, msg.fromUserId);
            const isFirst = idx === 0;

            return (
              <div
                key={msg.id}
                data-ocid={`messages.thread.item.${idx + 1}`}
                className={cn(
                  "px-5 py-4",
                  isFromCaller ? "bg-white/[0.015]" : "",
                  isFirst ? "" : "",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Avatar initials */}
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-bold uppercase"
                      style={{
                        backgroundColor: isFromCaller ? "#f59e0b22" : "#1a2235",
                        color: isFromCaller ? "#f59e0b" : "#94a3b8",
                        border: `1px solid ${isFromCaller ? "#f59e0b44" : "#2a3347"}`,
                      }}
                    >
                      {msgSenderName.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold uppercase tracking-wider",
                        isFromCaller ? "text-amber-400" : "text-slate-300",
                      )}
                    >
                      {msgSenderName}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-600">
                    {formatRelativeTime(msg.sentAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply box */}
      <div
        className="shrink-0 border-t p-4"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Textarea
              data-ocid="messages.thread.reply.textarea"
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value);
                setReplyError("");
              }}
              onFocus={() => setReplyError("")}
              className="min-h-[72px] border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Type a reply…"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void handleSendReply();
                }
              }}
            />
            {replyError && <FormError message={replyError} />}
          </div>
          <Button
            type="button"
            data-ocid="messages.thread.reply.submit_button"
            className="mt-0 gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSendReply()}
            disabled={isSendingReply}
            title="Send reply (Ctrl+Enter)"
          >
            {isSendingReply ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Reply className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSendingReply ? "Sending…" : "Reply"}
            </span>
          </Button>
        </div>
        <p className="mt-1.5 font-mono text-[9px] text-slate-700">
          Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}

// ─── Main MessagesPage ────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal();

  // Check for ?compose=true query param
  const search = useSearch({ strict: false }) as Record<string, string>;
  const openComposeFromQuery = search.compose === "true";

  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  // Open compose modal if query param is set
  useEffect(() => {
    if (openComposeFromQuery) {
      setComposeOpen(true);
    }
  }, [openComposeFromQuery]);

  // ── Load messages + profiles ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    try {
      const [inbox, sent, allProfiles] = await Promise.all([
        actor.getInboxMessages(),
        actor.getSentMessages(),
        actor.getAllProfiles(),
      ]);
      setInboxMessages(inbox.filter((m) => !m.deleted));
      setSentMessages(sent.filter((m) => !m.deleted));
      setProfiles(allProfiles);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Select message + mark as read ─────────────────────────────────────────
  async function handleSelectMessage(msg: Message) {
    setSelectedMessage(msg);
    // Only mark as read for inbox messages
    if (activeTab === "inbox" && !msg.read && actor) {
      try {
        await actor.markMessageRead(msg.id);
        setInboxMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
        );
      } catch {
        // Non-critical, don't toast
      }
    }
  }

  // ── Delete message ─────────────────────────────────────────────────────────
  function handleMessageDeleted(id: string) {
    setInboxMessages((prev) => prev.filter((m) => m.id !== id));
    setSentMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedMessage((prev) => (prev?.id === id ? null : prev));
  }

  // ── Reply sent — reload to get new reply ───────────────────────────────────
  function handleReplySent() {
    void loadData();
  }

  // ── Compose sent ───────────────────────────────────────────────────────────
  function handleComposeSent() {
    void loadData();
  }

  // ── All messages combined for thread reconstruction ────────────────────────
  const allMessages = [...inboxMessages, ...sentMessages];

  // Deduplicate by id
  const seenIds = new Set<string>();
  const uniqueAllMessages = allMessages.filter((m) => {
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });

  const unreadCount = inboxMessages.filter((m) => !m.read).length;

  return (
    <div
      data-ocid="messages.page"
      className="flex h-screen flex-col overflow-hidden"
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
                Messaging
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Compose modal */}
      {actor && callerPrincipal && (
        <ComposeModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          profiles={profiles}
          callerPrincipal={callerPrincipal}
          actor={actor}
          onSent={handleComposeSent}
          onSwitchToSent={() => setActiveTab("sent")}
        />
      )}

      {/* Page header strip */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: "#1a2235" }}
      >
        <MessageSquare className="h-4 w-4 text-amber-500" />
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none">
            Messaging
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Secure internal communications
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────────────── */}
        <aside
          className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r"
          style={{ backgroundColor: "#0a0e1a", borderColor: "#1a2235" }}
        >
          {/* Compose button */}
          <div
            className="shrink-0 border-b p-3"
            style={{ borderColor: "#1a2235" }}
          >
            <Button
              type="button"
              data-ocid="messages.compose.open_modal_button"
              className="w-full gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => setComposeOpen(true)}
            >
              <PenSquare className="h-3.5 w-3.5" />
              Compose
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "inbox" | "sent");
              setSelectedMessage(null);
            }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList
              className="shrink-0 rounded-none border-b bg-transparent p-0 h-9"
              style={{ borderColor: "#1a2235" }}
            >
              <TabsTrigger
                value="inbox"
                data-ocid="messages.inbox.tab"
                className="h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Inbox
                {unreadCount > 0 && (
                  <span
                    className="ml-1.5 rounded-full px-1 py-px font-mono text-[9px] font-bold"
                    style={{ backgroundColor: "#f59e0b22", color: "#f59e0b" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                data-ocid="messages.sent.tab"
                className="h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <MessageListSkeleton />
                ) : inboxMessages.length === 0 ? (
                  <EmptyState
                    icon={<Inbox />}
                    message="No messages in inbox"
                    className="h-64"
                  />
                ) : (
                  <div className="space-y-0.5 p-2">
                    {inboxMessages.map((msg, idx) => (
                      <MessageRow
                        key={msg.id}
                        message={msg}
                        profiles={profiles}
                        isSelected={selectedMessage?.id === msg.id}
                        isSent={false}
                        index={idx + 1}
                        onClick={() => void handleSelectMessage(msg)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <MessageListSkeleton />
                ) : sentMessages.length === 0 ? (
                  <EmptyState
                    icon={<Send />}
                    message="No sent messages"
                    className="h-64"
                  />
                ) : (
                  <div className="space-y-0.5 p-2">
                    {sentMessages.map((msg, idx) => (
                      <MessageRow
                        key={msg.id}
                        message={msg}
                        profiles={profiles}
                        isSelected={selectedMessage?.id === msg.id}
                        isSent={true}
                        index={idx + 1}
                        onClick={() => void handleSelectMessage(msg)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <main
          className="flex flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: "#080c18" }}
        >
          {selectedMessage && actor && callerPrincipal ? (
            <ThreadView
              message={selectedMessage}
              allMessages={uniqueAllMessages}
              profiles={profiles}
              callerPrincipal={callerPrincipal}
              actor={actor}
              onDeleted={handleMessageDeleted}
              onReplySent={handleReplySent}
            />
          ) : (
            <div
              data-ocid="messages.empty_state"
              className="flex h-full flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#1a2235" }}
                >
                  <MessageSquare className="h-7 w-7 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    Select a message to read
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-700">
                    or compose a new message
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-2 border font-mono text-[10px] uppercase tracking-widest text-slate-400"
                  style={{ borderColor: "#2a3347" }}
                  onClick={() => setComposeOpen(true)}
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  New Message
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="shrink-0 border-t px-4 py-3 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-500"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
