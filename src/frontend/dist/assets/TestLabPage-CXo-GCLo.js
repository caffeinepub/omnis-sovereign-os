import { b as useNavigate, j as jsxRuntimeExports, M as MessageSquare, k as Mail, y as FileText, r as reactExports, i as Users, B as Button, l as Shield } from "./index-CnBkd1vF.js";
import { T as TopNav, S as ScrollArea, a as Textarea, L as Lock } from "./TopNav-D92LzMme.js";
import { e as Badge } from "./displayName-B5NkxsrN.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BAv1gao8.js";
import { C as ChevronRight } from "./chevron-right-B23VjFYD.js";
import { F as FlaskConical } from "./flask-conical-r24ct2KJ.js";
import { S as Send } from "./send-CRunlJ7v.js";
import "./constants-O6cGduIW.js";
import "./check-C4XqBZ-7.js";
const BOTS = [
  {
    id: "bot-hayes",
    name: "HAYES, Jordan M",
    rank: "PFC",
    role: "Motor Pool Operator",
    clearance: "UNCLASSIFIED",
    clearanceLevel: 0,
    initials: "JH",
    accentColor: "#64748b",
    autoReply: "Wilco. Message received. I'll get back to you at the next available opportunity. PFC Hayes, out.",
    emailReply: "PFC Hayes here. Got your message. Will follow up through proper channels. Hooah."
  },
  {
    id: "bot-rivera",
    name: "RIVERA, Carlos A",
    rank: "SPC",
    role: "Intelligence Analyst",
    clearance: "CUI",
    clearanceLevel: 1,
    initials: "CR",
    accentColor: "#60a5fa",
    autoReply: "Copy that. Intelligence section acknowledges. Standing by for further guidance. SPC Rivera.",
    emailReply: "SPC Rivera, Intel Section. Your message has been received and logged. Awaiting action items."
  },
  {
    id: "bot-thompson",
    name: "THOMPSON, Marcus D",
    rank: "SGT",
    role: "Team Leader, 1st PLT",
    clearance: "SECRET",
    clearanceLevel: 2,
    initials: "MT",
    accentColor: "#f59e0b",
    autoReply: "Sergeant Thompson here. Roger on your last. I'll coordinate with the team and report back. Watch your six.",
    emailReply: "SGT Thompson, 1st PLT. Message received and understood. Will brief the team and respond via secure channel."
  },
  {
    id: "bot-wallace",
    name: "WALLACE, Sarah K",
    rank: "CPT",
    role: "S3 Operations Officer",
    clearance: "TOP SECRET",
    clearanceLevel: 3,
    initials: "SW",
    accentColor: "#a78bfa",
    autoReply: "Captain Wallace, S3. Acknowledged. Reviewed your message against current OPORD. Will integrate into the ops cycle. Stand by.",
    emailReply: "CPT Wallace, S3 Operations. Your communication has been received. I'll coordinate with staff and respond with guidance within the hour."
  },
  {
    id: "bot-nguyen",
    name: "NGUYEN, James T",
    rank: "CW2",
    role: "Aviation Warrant / Intelligence",
    clearance: "TS/SCI",
    clearanceLevel: 4,
    initials: "JN",
    accentColor: "#f87171",
    autoReply: "CW2 Nguyen here. Your message has been received at the appropriate classification level. Response will follow through secure means only.",
    emailReply: "CW2 Nguyen, Special Programs. Acknowledged. This channel is monitored. Your inquiry will be addressed through proper SCI protocols."
  }
];
const TEST_DOCS = [
  {
    id: "doc-unclass",
    title: "Unit Training Schedule — Q2",
    classification: "UNCLASSIFIED",
    classLevel: 0,
    description: "Quarterly training plan for all personnel. Physical fitness schedule, weapons qualification dates, and mandatory training events.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "All Personnel", rank: "ALL", role: "Unit-wide distribution" }
    ],
    color: "#4ade80"
  },
  {
    id: "doc-cui",
    title: "Personnel Roster — FOUO",
    classification: "CUI // FOUO",
    classLevel: 1,
    description: "For Official Use Only. Complete unit personnel roster with contact information, duty assignments, and emergency contacts.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" }
    ],
    color: "#60a5fa"
  },
  {
    id: "doc-conf",
    title: "Logistics Movement Plan",
    classification: "CONFIDENTIAL",
    classLevel: 2,
    description: "Movement timeline, vehicle manifest, and supply routes for upcoming field exercise. Contains grid coordinates and rally points.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "RIVERA, Carlos A", rank: "SPC", role: "Intel Analyst" },
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" }
    ],
    color: "#f59e0b"
  },
  {
    id: "doc-secret",
    title: "Intelligence Summary — INTREP 07",
    classification: "SECRET",
    classLevel: 3,
    description: "Intelligence report summarizing adversary activity, pattern of life analysis, and threat assessment for the operational area.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" }
    ],
    color: "#fb923c"
  },
  {
    id: "doc-ts",
    title: "Operational Order (OPORD) — Op Ironclad",
    classification: "TOP SECRET",
    classLevel: 4,
    description: "Complete OPORD for Operation Ironclad. Situation, mission, execution, sustainment, and command/signal. See annex for task organization.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" }
    ],
    color: "#f87171"
  },
  {
    id: "doc-tssci",
    title: "Special Access Program Brief",
    classification: "TS/SCI",
    classLevel: 5,
    description: "SAP briefing summary. Compartmented information. Access strictly limited to read-on personnel. SCI facility required.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" }
    ],
    color: "#c084fc"
  }
];
function MessagingTab() {
  const [selectedBot, setSelectedBot] = reactExports.useState(BOTS[0]);
  const [input, setInput] = reactExports.useState("");
  const [threads, setThreads] = reactExports.useState({});
  const messagesEndRef = reactExports.useRef(null);
  const currentThread = threads[selectedBot.id] ?? [];
  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const now = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const userMsg = {
      id: crypto.randomUUID(),
      sender: "YOU",
      initials: "ME",
      accentColor: "#f59e0b",
      body: text,
      time: now,
      isMe: true
    };
    const botReplyDelay = 1200 + Math.random() * 800;
    setThreads((prev) => ({
      ...prev,
      [selectedBot.id]: [...prev[selectedBot.id] ?? [], userMsg]
    }));
    setInput("");
    setTimeout(() => {
      const botMsg = {
        id: crypto.randomUUID(),
        sender: selectedBot.rank,
        initials: selectedBot.initials,
        accentColor: selectedBot.accentColor,
        body: selectedBot.autoReply,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        isMe: false
      };
      setThreads((prev) => ({
        ...prev,
        [selectedBot.id]: [...prev[selectedBot.id] ?? [], botMsg]
      }));
      setTimeout(
        () => {
          var _a;
          return (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        },
        50
      );
    }, botReplyDelay);
  }
  function sendBroadcast() {
    const text = "ATTENTION ALL: This is a multi-recipient broadcast test message. Please acknowledge receipt.";
    const now = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const updates = { ...threads };
    for (const bot of BOTS) {
      const userMsg = {
        id: crypto.randomUUID(),
        sender: "YOU",
        initials: "ME",
        accentColor: "#f59e0b",
        body: text,
        time: now,
        isMe: true
      };
      updates[bot.id] = [...updates[bot.id] ?? [], userMsg];
      const delay = 800 + Math.random() * 1500;
      setTimeout(() => {
        const botMsg = {
          id: crypto.randomUUID(),
          sender: bot.rank,
          initials: bot.initials,
          accentColor: bot.accentColor,
          body: bot.autoReply,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          isMe: false
        };
        setThreads((prev) => ({
          ...prev,
          [bot.id]: [...prev[bot.id] ?? [], botMsg]
        }));
      }, delay);
    }
    setThreads(updates);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "testlab.messaging.panel",
      className: "flex h-[600px] overflow-hidden rounded border",
      style: { borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-52 shrink-0 border-r",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b px-3 py-3", style: { borderColor: "#1a2235" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Test Contacts" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: BOTS.map((bot) => {
                const unread = (threads[bot.id] ?? []).filter(
                  (m) => !m.isMe
                ).length;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "testlab.messaging.contact.button",
                    onClick: () => setSelectedBot(bot),
                    className: "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2",
                    style: {
                      backgroundColor: selectedBot.id === bot.id ? "rgba(245,158,11,0.06)" : void 0,
                      borderLeft: selectedBot.id === bot.id ? "2px solid #f59e0b" : "2px solid transparent"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold",
                          style: {
                            backgroundColor: `${bot.accentColor}20`,
                            color: bot.accentColor
                          },
                          children: bot.initials
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-mono text-[10px] font-semibold uppercase text-white", children: bot.rank }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-mono text-[9px] text-slate-500", children: bot.name.split(",")[0] })
                      ] }),
                      unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold",
                          style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                          children: unread
                        }
                      )
                    ]
                  },
                  bot.id
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t px-3 py-2", style: { borderColor: "#1a2235" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  "data-ocid": "testlab.messaging.broadcast.button",
                  onClick: sendBroadcast,
                  className: "w-full rounded border px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-colors hover:bg-amber-500/10",
                  style: {
                    borderColor: "rgba(245,158,11,0.3)",
                    color: "#f59e0b"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-0.5 inline h-3 w-3" }),
                    " Broadcast All"
                  ]
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-1 flex-col",
            style: { backgroundColor: "#090d1a" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-3 border-b px-4 py-3",
                  style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-bold",
                        style: {
                          backgroundColor: `${selectedBot.accentColor}20`,
                          color: selectedBot.accentColor
                        },
                        children: selectedBot.initials
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-bold uppercase tracking-wider text-white", children: selectedBot.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[9px] text-slate-500", children: [
                        selectedBot.rank,
                        " · ",
                        selectedBot.role
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: "ml-auto border font-mono text-[8px] uppercase tracking-wider",
                        style: {
                          borderColor: `${selectedBot.accentColor}40`,
                          color: selectedBot.accentColor,
                          backgroundColor: `${selectedBot.accentColor}10`
                        },
                        children: selectedBot.clearance
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 px-4 py-3", children: currentThread.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center py-12 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mb-3 h-8 w-8 text-slate-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: "Send a message to start the conversation" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                currentThread.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `flex items-start gap-2.5 ${msg.isMe ? "flex-row-reverse" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold",
                          style: {
                            backgroundColor: `${msg.accentColor}20`,
                            color: msg.accentColor
                          },
                          children: msg.initials
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: `max-w-[70%] rounded px-3 py-2 ${msg.isMe ? "rounded-tr-none" : "rounded-tl-none"}`,
                          style: {
                            backgroundColor: msg.isMe ? "rgba(245,158,11,0.12)" : "#1a2235",
                            border: `1px solid ${msg.isMe ? "rgba(245,158,11,0.2)" : "#2a3347"}`
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] leading-relaxed text-slate-200", children: msg.body }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-[9px] text-slate-600", children: msg.time })
                          ]
                        }
                      )
                    ]
                  },
                  msg.id
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t p-3", style: { borderColor: "#1a2235" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    "data-ocid": "testlab.messaging.input",
                    value: input,
                    onChange: (e) => setInput(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    },
                    placeholder: "Type a message... (Enter to send)",
                    className: "min-h-0 resize-none border font-mono text-xs text-white placeholder:text-slate-600",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    rows: 2
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    "data-ocid": "testlab.messaging.send_button",
                    onClick: sendMessage,
                    disabled: !input.trim(),
                    className: "shrink-0 self-end font-mono text-xs uppercase tracking-wider disabled:opacity-40",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
                  }
                )
              ] }) })
            ]
          }
        )
      ]
    }
  );
}
function EmailTab() {
  const [selectedEmail, setSelectedEmail] = reactExports.useState(null);
  const [composeOpen, setComposeOpen] = reactExports.useState(false);
  const [composeTo, setComposeTo] = reactExports.useState(BOTS[0].id);
  const [composeSubject, setComposeSubject] = reactExports.useState("");
  const [composeBody, setComposeBody] = reactExports.useState("");
  const [inbox, setInbox] = reactExports.useState([
    {
      id: "email-welcome",
      from: "SYSTEM",
      fromInitials: "SY",
      fromColor: "#f59e0b",
      subject: "Welcome to Omnis Secure Mail",
      body: "This is a simulated email environment for testing purposes. Your messages are not transmitted externally. Use this module to validate the email UX before backend integration.",
      time: "09:00",
      read: false,
      isReply: false
    }
  ]);
  function sendEmail() {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    const bot = BOTS.find((b) => b.id === composeTo) ?? BOTS[0];
    const now = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const sent = {
      id: crypto.randomUUID(),
      from: `To: ${bot.rank} ${bot.name}`,
      fromInitials: "ME",
      fromColor: "#f59e0b",
      subject: `Sent: ${composeSubject}`,
      body: composeBody,
      time: now,
      read: true,
      isReply: false
    };
    setInbox((prev) => [sent, ...prev]);
    setComposeOpen(false);
    setComposeSubject("");
    setComposeBody("");
    setTimeout(
      () => {
        const reply = {
          id: crypto.randomUUID(),
          from: `${bot.rank} ${bot.name}`,
          fromInitials: bot.initials,
          fromColor: bot.accentColor,
          subject: `RE: ${composeSubject}`,
          body: bot.emailReply,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          }),
          read: false,
          isReply: true
        };
        setInbox((prev) => [reply, ...prev]);
      },
      2e3 + Math.random() * 1500
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "testlab.email.panel",
      className: "flex h-[600px] overflow-hidden rounded border",
      style: { borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-72 shrink-0 border-r",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between border-b px-3 py-3",
                  style: { borderColor: "#1a2235" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-500", children: [
                      "Inbox (",
                      inbox.filter((m) => !m.read).length,
                      " unread)"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "testlab.email.compose_button",
                        onClick: () => setComposeOpen(true),
                        className: "rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors hover:bg-amber-500/10",
                        style: { borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b" },
                        children: "Compose"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: inbox.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  "data-ocid": "testlab.email.item.button",
                  onClick: () => {
                    setSelectedEmail(msg);
                    setInbox(
                      (prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m)
                    );
                  },
                  className: "flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-white/[0.03]",
                  style: {
                    backgroundColor: (selectedEmail == null ? void 0 : selectedEmail.id) === msg.id ? "rgba(245,158,11,0.04)" : void 0,
                    borderLeft: !msg.read ? "2px solid #f59e0b" : "2px solid transparent"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold",
                          style: {
                            backgroundColor: `${msg.fromColor}20`,
                            color: msg.fromColor
                          },
                          children: msg.fromInitials
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `truncate font-mono text-[10px] ${!msg.read ? "font-bold text-white" : "text-slate-400"}`,
                          children: msg.from
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto shrink-0 font-mono text-[9px] text-slate-600", children: msg.time })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: `truncate font-mono text-[9px] ${!msg.read ? "text-slate-300" : "text-slate-600"}`,
                        children: msg.subject
                      }
                    )
                  ]
                },
                msg.id
              )) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex flex-1 flex-col",
            style: { backgroundColor: "#090d1a" },
            children: composeOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-5 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] uppercase tracking-widest text-slate-300", children: "New Message" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "testlab.email.close_button",
                    onClick: () => setComposeOpen(false),
                    className: "font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-400",
                    children: "Cancel"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "compose-to",
                      className: "mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500",
                      children: "To"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      id: "compose-to",
                      "data-ocid": "testlab.email.to.select",
                      value: composeTo,
                      onChange: (e) => setComposeTo(e.target.value),
                      className: "w-full rounded border bg-transparent px-3 py-2 font-mono text-xs text-white focus:outline-none",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                      children: BOTS.map((bot) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: bot.id, children: [
                        bot.rank,
                        " ",
                        bot.name,
                        " — ",
                        bot.clearance
                      ] }, bot.id))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "compose-subject",
                      className: "mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500",
                      children: "Subject"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "compose-subject",
                      "data-ocid": "testlab.email.subject.input",
                      value: composeSubject,
                      onChange: (e) => setComposeSubject(e.target.value),
                      placeholder: "Enter subject...",
                      className: "w-full rounded border bg-transparent px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "compose-body",
                      className: "mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500",
                      children: "Message"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "compose-body",
                      "data-ocid": "testlab.email.body.textarea",
                      value: composeBody,
                      onChange: (e) => setComposeBody(e.target.value),
                      placeholder: "Type your message...",
                      className: "min-h-[160px] resize-none border font-mono text-xs text-white placeholder:text-slate-600",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  "data-ocid": "testlab.email.send_button",
                  onClick: sendEmail,
                  disabled: !composeSubject.trim() || !composeBody.trim(),
                  className: "gap-2 font-mono text-xs uppercase tracking-wider disabled:opacity-40",
                  style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
                    "Send"
                  ]
                }
              ) })
            ] }) : selectedEmail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "mb-4 border-b pb-4",
                  style: { borderColor: "#1a2235" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-base font-bold text-white", children: selectedEmail.subject }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 font-mono text-[10px] text-slate-500", children: [
                      "From: ",
                      selectedEmail.from,
                      " · ",
                      selectedEmail.time
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-relaxed text-slate-300", children: selectedEmail.body }) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mb-3 h-8 w-8 text-slate-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: "Select a message or compose a new one" })
            ] })
          }
        )
      ]
    }
  );
}
function DocumentsTab() {
  const [selectedDoc, setSelectedDoc] = reactExports.useState(null);
  const [showRoster, setShowRoster] = reactExports.useState(false);
  const classColors = {
    0: {
      border: "rgba(74,222,128,0.4)",
      text: "#4ade80",
      bg: "rgba(74,222,128,0.08)"
    },
    1: {
      border: "rgba(96,165,250,0.4)",
      text: "#60a5fa",
      bg: "rgba(96,165,250,0.08)"
    },
    2: {
      border: "rgba(245,158,11,0.4)",
      text: "#f59e0b",
      bg: "rgba(245,158,11,0.08)"
    },
    3: {
      border: "rgba(251,146,60,0.4)",
      text: "#fb923c",
      bg: "rgba(251,146,60,0.08)"
    },
    4: {
      border: "rgba(248,113,113,0.4)",
      text: "#f87171",
      bg: "rgba(248,113,113,0.08)"
    },
    5: {
      border: "rgba(192,132,252,0.4)",
      text: "#c084fc",
      bg: "rgba(192,132,252,0.08)"
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "testlab.documents.panel", className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] uppercase tracking-widest text-slate-400", children: "Classification Test Vault — Click any document to view the S2 access roster" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: TEST_DOCS.map((doc, idx) => {
      const cls = classColors[doc.classLevel] ?? classColors[0];
      const isSelected = (selectedDoc == null ? void 0 : selectedDoc.id) === doc.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "data-ocid": `testlab.documents.item.${idx + 1}`,
          onClick: () => {
            setSelectedDoc(isSelected ? null : doc);
            setShowRoster(false);
          },
          className: "flex flex-col gap-3 rounded border p-4 text-left transition-all duration-200 hover:border-amber-500/40",
          style: {
            backgroundColor: isSelected ? "#1a2235" : "#0f1626",
            borderColor: isSelected ? "#f59e0b" : "#1a2235"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mt-0.5 h-4 w-4 shrink-0 text-slate-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest",
                  style: {
                    borderColor: cls.border,
                    color: cls.text,
                    backgroundColor: cls.bg
                  },
                  children: doc.classification
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[11px] font-bold uppercase tracking-wide text-white", children: doc.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-500", children: doc.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-2.5 w-2.5 text-slate-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[9px] text-slate-600", children: [
                doc.accessList.length,
                " authorized",
                " ",
                doc.accessList.length === 1 ? "user" : "users"
              ] })
            ] })
          ]
        },
        doc.id
      );
    }) }),
    selectedDoc && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "testlab.documents.access_roster.panel",
        className: "overflow-hidden rounded border",
        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between border-b px-4 py-3",
              style: { borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-500", children: "S2 Access Roster" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-[9px] text-slate-500", children: [
                    selectedDoc.title,
                    " · ",
                    selectedDoc.classification
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    "data-ocid": "testlab.documents.roster_toggle.button",
                    variant: "ghost",
                    size: "sm",
                    onClick: () => setShowRoster((v) => !v),
                    className: "h-7 border px-2.5 font-mono text-[9px] uppercase tracking-wider text-amber-400 hover:text-amber-300",
                    style: {
                      borderColor: "rgba(245,158,11,0.3)",
                      backgroundColor: "rgba(245,158,11,0.05)"
                    },
                    children: showRoster ? "Hide Roster" : "View Roster"
                  }
                )
              ]
            }
          ),
          showRoster && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "grid grid-cols-[1fr_auto_1fr_auto] gap-4 border-b px-4 py-2",
                style: {
                  backgroundColor: "#0d1525",
                  borderColor: "#1a2235"
                },
                children: ["Name", "Rank", "Role", "Access Level"].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "font-mono text-[9px] uppercase tracking-widest text-slate-600",
                    children: col
                  },
                  col
                ))
              }
            ),
            selectedDoc.accessList.map((user, idx) => {
              const cls = classColors[selectedDoc.classLevel] ?? classColors[0];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": `testlab.documents.roster.row.${idx + 1}`,
                  className: "grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 border-b px-4 py-3 last:border-0",
                  style: { borderColor: "#1a2235" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] font-semibold text-white", children: user.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-400", children: user.rank }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-slate-500", children: user.role }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest",
                        style: {
                          borderColor: cls.border,
                          color: cls.text,
                          backgroundColor: cls.bg
                        },
                        children: selectedDoc.classification
                      }
                    )
                  ]
                },
                `${user.name}-${user.rank}`
              );
            })
          ] })
        ]
      }
    )
  ] });
}
function TestLabPage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "testlab.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => void navigate({ to: "/" }),
                className: "font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                children: "Hub"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-slate-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-300", children: "Test Lab" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-6 w-6", style: { color: "#f59e0b" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Test Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Simulated environment · 5 bot contacts · classification vault · S2 access rosters" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "messaging", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsList,
              {
                className: "mb-6 border",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      value: "messaging",
                      "data-ocid": "testlab.messaging.tab",
                      className: "gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                        "Messaging"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      value: "email",
                      "data-ocid": "testlab.email.tab",
                      className: "gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
                        "Email"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      value: "documents",
                      "data-ocid": "testlab.documents.tab",
                      className: "gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                        "Documents"
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "messaging", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessagingTab, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailTab, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "documents", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentsTab, {}) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "border-t px-4 py-4 text-center",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: [
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
                  className: "transition-colors hover:text-slate-400",
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
  TestLabPage as default
};
