import { f as createLucideIcon, c as useExtActor, a as useInternetIdentity, z as useSearch, r as reactExports, p as ue, j as jsxRuntimeExports, M as MessageSquare, B as Button, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, w as DialogFooter, e as cn } from "./index-BlEGMROs.js";
import { T as TopNav, b as SquarePen, S as ScrollArea, a as Textarea, f as formatRelativeTime } from "./TopNav-D8UQSmDX.js";
import { C as ConfirmDialog } from "./ConfirmDialog-Cgc01nrU.js";
import { E as EmptyState } from "./EmptyState-0-AYWQ3I.js";
import { F as FormError } from "./FormError-BOV4wCQq.js";
import { S as SkeletonCard } from "./SkeletonCard-DEpFfpMx.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-CXZKGbs0.js";
import { L as Label, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, I as Input } from "./displayName-Dizd79pw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C_lHOsM1.js";
import { S as Send } from "./send-ZRgeh2jm.js";
import { L as LoaderCircle } from "./loader-circle-D_xteZXh.js";
import { T as Trash2 } from "./trash-2-7EpzgAzU.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-D4lTJ-EH.js";
import "./check-BXhHek9h.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M20 18v-2a4 4 0 0 0-4-4H4", key: "5vmcpk" }],
  ["path", { d: "m9 17-5-5 5-5", key: "nvlc11" }]
];
const Reply = createLucideIcon("reply", __iconNode);
function formatFullDate(ts) {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1e6) : new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getProfileName(profiles, principal) {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString()
  );
  return match ? `${match.rank} ${match.name}`.trim() : "Unknown";
}
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
function MessageListSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "messages.inbox.loading_state", className: "space-y-1 p-3", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "56px", className: "w-full" }, i)) });
}
function ComposeModal({
  open,
  onOpenChange,
  profiles,
  callerPrincipal,
  actor,
  onSent,
  onSwitchToSent
}) {
  const [toUserId, setToUserId] = reactExports.useState("");
  const [subject, setSubject] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setToUserId("");
      setSubject("");
      setBody("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);
  function validate() {
    const errs = {};
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
        (p) => p.principalId.toString() === toUserId
      );
      if (!recipientProfile) throw new Error("Recipient not found");
      const message = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: void 0,
        toUserId: recipientProfile.principalId,
        fromUserId: callerPrincipal,
        subject: subject.trim(),
        body: body.trim(),
        sentAt: BigInt(Date.now())
      };
      await actor.sendMessage(message);
      ue.success("Message sent");
      onOpenChange(false);
      onSent();
      onSwitchToSent();
    } catch {
      ue.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }
  const recipientOptions = profiles.filter(
    (p) => p.principalId.toString() !== callerPrincipal.toString() && p.registered === true
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "messages.compose.modal",
      className: "border sm:max-w-lg",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Compose Message" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: [
              "To ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: toUserId, onValueChange: setToUserId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectTrigger,
                {
                  "data-ocid": "messages.compose.to.select",
                  className: "border font-mono text-xs text-white",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select recipient…" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectContent,
                {
                  style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                  children: recipientOptions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    SelectItem,
                    {
                      value: p.principalId.toString(),
                      className: "font-mono text-xs text-slate-300 focus:text-white",
                      children: [
                        p.rank,
                        " ",
                        p.name
                      ]
                    },
                    p.principalId.toString()
                  ))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: errors.to })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: [
              "Subject ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "messages.compose.subject.input",
                value: subject,
                onChange: (e) => setSubject(e.target.value),
                className: "border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                placeholder: "Enter subject…"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: errors.subject })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: [
              "Message ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "data-ocid": "messages.compose.body.textarea",
                value: body,
                onChange: (e) => setBody(e.target.value),
                className: "border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                placeholder: "Type your message…",
                rows: 5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: errors.body })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              "data-ocid": "messages.compose.cancel_button",
              className: "border font-mono text-xs uppercase tracking-wider text-slate-300",
              style: { borderColor: "#2a3347" },
              onClick: () => onOpenChange(false),
              disabled: isSubmitting,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              "data-ocid": "messages.compose.submit_button",
              className: "gap-1.5 font-mono text-xs uppercase tracking-wider",
              style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
              onClick: () => void handleSubmit(),
              disabled: isSubmitting,
              children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                "Sending…"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
                "Send"
              ] })
            }
          )
        ] })
      ]
    }
  ) });
}
function MessageRow({
  message,
  profiles,
  isSelected,
  isSent,
  index,
  onClick
}) {
  const isUnread = !message.read && !isSent;
  const otherParty = isSent ? getProfileName(profiles, message.toUserId) : getProfileName(profiles, message.fromUserId);
  if (message.deleted) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-ocid": isSent ? `messages.sent.row.${index}` : `messages.inbox.row.${index}`,
      onClick,
      className: cn(
        "relative w-full rounded-sm px-3 py-3 text-left transition-colors",
        isSelected ? "bg-amber-500/10 border-l-2 border-amber-500" : "border-l-2 border-transparent hover:bg-white/[0.03]",
        isUnread && "bg-white/[0.02]"
      ),
      children: [
        isUnread && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "absolute left-[-1px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
            style: { backgroundColor: "#f59e0b" },
            "aria-label": "Unread"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "truncate font-mono text-[11px] uppercase tracking-wider",
                isUnread ? "font-bold text-white" : "text-slate-300"
              ),
              children: otherParty
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-mono text-[9px] text-slate-600", children: formatRelativeTime(message.sentAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: cn(
              "mt-0.5 truncate font-mono text-[10px]",
              isUnread ? "font-semibold text-slate-200" : "text-slate-500"
            ),
            children: message.subject
          }
        )
      ]
    }
  );
}
function ThreadView({
  message,
  allMessages,
  profiles,
  callerPrincipal,
  actor,
  onDeleted,
  onReplySent
}) {
  const [replyBody, setReplyBody] = reactExports.useState("");
  const [isSendingReply, setIsSendingReply] = reactExports.useState(false);
  const [deleteOpen, setDeleteOpen] = reactExports.useState(false);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [replyError, setReplyError] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  const threadRootId = message.parentMessageId ?? message.id;
  const threadMessages = allMessages.filter(
    (m) => !m.deleted && (m.id === threadRootId || m.parentMessageId === threadRootId || m.id === message.id || m.parentMessageId === message.id)
  ).sort((a, b) => a.sentAt < b.sentAt ? -1 : 1);
  const seen = /* @__PURE__ */ new Set();
  const uniqueThread = threadMessages.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  reactExports.useEffect(() => {
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
      const reply = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: threadRootId,
        toUserId: message.fromUserId.toString() === callerPrincipal.toString() ? message.toUserId : message.fromUserId,
        fromUserId: callerPrincipal,
        subject: message.subject.startsWith("Re: ") ? message.subject : `Re: ${message.subject}`,
        body: replyBody.trim(),
        sentAt: BigInt(Date.now())
      };
      await actor.replyToMessage(reply);
      setReplyBody("");
      ue.success("Reply sent");
      onReplySent();
    } catch {
      ue.error("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  }
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await actor.deleteMessage(message.id);
      ue.success("Message deleted");
      onDeleted(message.id);
    } catch {
      ue.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }
  const senderName = getProfileName(profiles, message.fromUserId);
  const recipientName = getProfileName(profiles, message.toUserId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "messages.thread.panel",
      className: "flex h-full flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "shrink-0 border-b px-5 py-4",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "truncate font-mono text-sm font-bold uppercase tracking-wider text-white", children: message.subject }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: [
                    "From: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: senderName })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: [
                    "To: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: recipientName })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-600", children: formatFullDate(message.sentAt) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  "data-ocid": "messages.thread.delete.open_modal_button",
                  className: "h-7 w-7 shrink-0 p-0 text-slate-500 hover:text-red-400",
                  onClick: () => setDeleteOpen(true),
                  title: "Delete message",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConfirmDialog,
          {
            isOpen: deleteOpen,
            onOpenChange: setDeleteOpen,
            title: "Delete Message",
            description: "This message will be permanently deleted. This cannot be undone.",
            confirmLabel: isDeleting ? "Deleting…" : "Delete",
            cancelLabel: "Cancel",
            onConfirm: () => void handleDelete(),
            onCancel: () => setDeleteOpen(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0 divide-y", style: { borderColor: "#1a2235" }, children: uniqueThread.map((msg, idx) => {
          const isFromCaller = msg.fromUserId.toString() === callerPrincipal.toString();
          const msgSenderName = getProfileName(profiles, msg.fromUserId);
          const isFirst = idx === 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `messages.thread.item.${idx + 1}`,
              className: cn(
                "px-5 py-4",
                isFromCaller ? "bg-white/[0.015]" : "",
                isFirst ? "" : ""
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-bold uppercase",
                        style: {
                          backgroundColor: isFromCaller ? "#f59e0b22" : "#1a2235",
                          color: isFromCaller ? "#f59e0b" : "#94a3b8",
                          border: `1px solid ${isFromCaller ? "#f59e0b44" : "#2a3347"}`
                        },
                        children: msgSenderName.slice(0, 2).toUpperCase()
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: cn(
                          "font-mono text-[10px] font-semibold uppercase tracking-wider",
                          isFromCaller ? "text-amber-400" : "text-slate-300"
                        ),
                        children: msgSenderName
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-slate-600", children: formatRelativeTime(msg.sentAt) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200", children: msg.body })
              ]
            },
            msg.id
          );
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "shrink-0 border-t p-4",
            style: { borderColor: "#1a2235", backgroundColor: "#0a0e1a" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      "data-ocid": "messages.thread.reply.textarea",
                      value: replyBody,
                      onChange: (e) => {
                        setReplyBody(e.target.value);
                        setReplyError("");
                      },
                      onFocus: () => setReplyError(""),
                      className: "min-h-[72px] border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                      placeholder: "Type a reply…",
                      rows: 3,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          void handleSendReply();
                        }
                      }
                    }
                  ),
                  replyError && /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: replyError })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    "data-ocid": "messages.thread.reply.submit_button",
                    className: "mt-0 gap-1.5 font-mono text-xs uppercase tracking-wider",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    onClick: () => void handleSendReply(),
                    disabled: isSendingReply,
                    title: "Send reply (Ctrl+Enter)",
                    children: [
                      isSendingReply ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-3.5 w-3.5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: isSendingReply ? "Sending…" : "Reply" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 font-mono text-[9px] text-slate-700", children: "Ctrl+Enter to send" })
            ]
          }
        )
      ]
    }
  );
}
function MessagesPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity == null ? void 0 : identity.getPrincipal();
  const search = useSearch({ strict: false });
  const openComposeFromQuery = search.compose === "true";
  const [activeTab, setActiveTab] = reactExports.useState("inbox");
  const [inboxMessages, setInboxMessages] = reactExports.useState([]);
  const [sentMessages, setSentMessages] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [selectedMessage, setSelectedMessage] = reactExports.useState(null);
  const [composeOpen, setComposeOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (openComposeFromQuery) {
      setComposeOpen(true);
    }
  }, [openComposeFromQuery]);
  const loadData = reactExports.useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    try {
      const [inbox, sent, allProfiles] = await Promise.all([
        actor.getInboxMessages(),
        actor.getSentMessages(),
        actor.getAllProfiles()
      ]);
      setInboxMessages(inbox.filter((m) => !m.deleted));
      setSentMessages(sent.filter((m) => !m.deleted));
      setProfiles(allProfiles);
    } catch {
      ue.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);
  reactExports.useEffect(() => {
    void loadData();
  }, [loadData]);
  async function handleSelectMessage(msg) {
    setSelectedMessage(msg);
    if (activeTab === "inbox" && !msg.read && actor) {
      try {
        await actor.markMessageRead(msg.id);
        setInboxMessages(
          (prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m)
        );
      } catch {
      }
    }
  }
  function handleMessageDeleted(id) {
    setInboxMessages((prev) => prev.filter((m) => m.id !== id));
    setSentMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedMessage((prev) => (prev == null ? void 0 : prev.id) === id ? null : prev);
  }
  function handleReplySent() {
    void loadData();
  }
  function handleComposeSent() {
    void loadData();
  }
  const allMessages = [...inboxMessages, ...sentMessages];
  const seenIds = /* @__PURE__ */ new Set();
  const uniqueAllMessages = allMessages.filter((m) => {
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });
  const unreadCount = inboxMessages.filter((m) => !m.read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "messages.page",
      className: "flex h-screen flex-col overflow-hidden",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "nav",
          {
            className: "border-b px-6 py-2.5",
            style: { borderColor: "#1a2235", backgroundColor: "#0a0e1a" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                BreadcrumbLink,
                {
                  href: "/",
                  className: "font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300",
                  children: "Hub"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, { className: "text-slate-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Messaging" }) })
            ] }) })
          }
        ),
        actor && callerPrincipal && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ComposeModal,
          {
            open: composeOpen,
            onOpenChange: setComposeOpen,
            profiles,
            callerPrincipal,
            actor,
            onSent: handleComposeSent,
            onSwitchToSent: () => setActiveTab("sent")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex shrink-0 items-center gap-3 border-b px-5 py-3",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 text-amber-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none", children: "Messaging" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "Secure internal communications" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "aside",
            {
              className: "flex w-[320px] shrink-0 flex-col overflow-hidden border-r",
              style: { backgroundColor: "#0a0e1a", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "shrink-0 border-b p-3",
                    style: { borderColor: "#1a2235" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        "data-ocid": "messages.compose.open_modal_button",
                        className: "w-full gap-2 font-mono text-xs uppercase tracking-widest",
                        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                        onClick: () => setComposeOpen(true),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3.5 w-3.5" }),
                          "Compose"
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Tabs,
                  {
                    value: activeTab,
                    onValueChange: (v) => {
                      setActiveTab(v);
                      setSelectedMessage(null);
                    },
                    className: "flex flex-1 flex-col overflow-hidden",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsList,
                        {
                          className: "shrink-0 rounded-none border-b bg-transparent p-0 h-9",
                          style: { borderColor: "#1a2235" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              TabsTrigger,
                              {
                                value: "inbox",
                                "data-ocid": "messages.inbox.tab",
                                className: "h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                                children: [
                                  "Inbox",
                                  unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: "ml-1.5 rounded-full px-1 py-px font-mono text-[9px] font-bold",
                                      style: { backgroundColor: "#f59e0b22", color: "#f59e0b" },
                                      children: unreadCount
                                    }
                                  )
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TabsTrigger,
                              {
                                value: "sent",
                                "data-ocid": "messages.sent.tab",
                                className: "h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                                children: "Sent"
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inbox", className: "mt-0 flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(MessageListSkeleton, {}) : inboxMessages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        EmptyState,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, {}),
                          message: "No messages in inbox",
                          className: "h-64"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5 p-2", children: inboxMessages.map((msg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MessageRow,
                        {
                          message: msg,
                          profiles,
                          isSelected: (selectedMessage == null ? void 0 : selectedMessage.id) === msg.id,
                          isSent: false,
                          index: idx + 1,
                          onClick: () => void handleSelectMessage(msg)
                        },
                        msg.id
                      )) }) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sent", className: "mt-0 flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(MessageListSkeleton, {}) : sentMessages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        EmptyState,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, {}),
                          message: "No sent messages",
                          className: "h-64"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5 p-2", children: sentMessages.map((msg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MessageRow,
                        {
                          message: msg,
                          profiles,
                          isSelected: (selectedMessage == null ? void 0 : selectedMessage.id) === msg.id,
                          isSent: true,
                          index: idx + 1,
                          onClick: () => void handleSelectMessage(msg)
                        },
                        msg.id
                      )) }) }) })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "main",
            {
              className: "flex flex-1 flex-col overflow-hidden",
              style: { backgroundColor: "#080c18" },
              children: selectedMessage && actor && callerPrincipal ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                ThreadView,
                {
                  message: selectedMessage,
                  allMessages: uniqueAllMessages,
                  profiles,
                  callerPrincipal,
                  actor,
                  onDeleted: handleMessageDeleted,
                  onReplySent: handleReplySent
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-ocid": "messages.empty_state",
                  className: "flex h-full flex-col items-center justify-center",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "flex h-16 w-16 items-center justify-center rounded-full",
                        style: { backgroundColor: "#1a2235" },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-7 w-7 text-slate-600" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "Select a message to read" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[10px] text-slate-700", children: "or compose a new message" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "mt-2 gap-2 border font-mono text-[10px] uppercase tracking-widest text-slate-400",
                        style: { borderColor: "#2a3347" },
                        onClick: () => setComposeOpen(true),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3.5 w-3.5" }),
                          "New Message"
                        ]
                      }
                    )
                  ] })
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "shrink-0 border-t px-4 py-3 text-center",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-700", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              ".",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "transition-colors hover:text-slate-500",
                  children: "Built with love using caffeine.ai"
                }
              )
            ] })
          }
        )
      ]
    }
  );
}
export {
  MessagesPage as default
};
