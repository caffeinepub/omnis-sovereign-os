import { h as usePermissions, a as useInternetIdentity, c as useExtActor, r as reactExports, j as jsxRuntimeExports, L as Link, B as Button, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, w as DialogFooter } from "./index-CnBkd1vF.js";
import { T as TopNav, d as Skeleton, f as formatRelativeTime, a as Textarea } from "./TopNav-D92LzMme.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-DKCCDcWa.js";
import { L as Label, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./displayName-B5NkxsrN.js";
import { u as useBroadcastMessages, a as useMarkBroadcastRead, b as useCreateBroadcastMessage } from "./useQueries-D_eZX6qU.js";
import { M as Megaphone } from "./megaphone-BDavQpNe.js";
import { P as Plus } from "./plus-CHuw3WQC.js";
import { L as LoaderCircle } from "./loader-circle-CXCl3Roj.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-B23VjFYD.js";
import "./check-C4XqBZ-7.js";
const CLASSIFICATIONS = [
  "UNCLASSIFIED",
  "CUI",
  "CONFIDENTIAL",
  "SECRET",
  "TOP SECRET"
];
const CLASSIFICATION_COLORS = {
  UNCLASSIFIED: "#22c55e",
  CUI: "#f59e0b",
  CONFIDENTIAL: "#3b82f6",
  SECRET: "#f97316",
  "TOP SECRET": "#ef4444"
};
function AnnouncementsPage() {
  const { isS2Admin, profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useExtActor();
  const { data: messages = [], isLoading } = useBroadcastMessages();
  const markRead = useMarkBroadcastRead();
  const createMsg = useCreateBroadcastMessage();
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [classification, setClassification] = reactExports.useState("UNCLASSIFIED");
  const sorted = [...messages].sort((a, b) => Number(b.sentAt - a.sentAt));
  async function handleCreate() {
    if (!identity || !actor) return;
    const orgId = (profile == null ? void 0 : profile.orgId) ?? "";
    await createMsg.mutateAsync({
      messageId: crypto.randomUUID(),
      orgId,
      fromUserId: identity.getPrincipal(),
      title: title.trim(),
      body: body.trim(),
      sentAt: BigInt(Date.now()) * 1000000n,
      classification
    });
    setTitle("");
    setBody("");
    setClassification("UNCLASSIFIED");
    setShowDialog(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "announcements.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Announcements" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                  style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-6 w-6", style: { color: "#f59e0b" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Announcements" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Org-wide broadcast communications" })
              ] })
            ] }),
            isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "announcements.compose.primary_button",
                onClick: () => setShowDialog(true),
                className: "gap-2 font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                  "New Announcement"
                ]
              }
            )
          ] }),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "announcements.loading_state", className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Skeleton,
            {
              className: "h-20 w-full rounded",
              style: { backgroundColor: "#1a2235" }
            },
            i
          )) }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "announcements.empty_state",
              className: "flex flex-col items-center gap-3 rounded border py-16",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-10 w-10 text-slate-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No announcements yet" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sorted.map((msg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `announcements.item.${idx + 1}`,
              className: "rounded border px-5 py-4",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                        style: {
                          color: CLASSIFICATION_COLORS[msg.classification] ?? "#64748b",
                          backgroundColor: `${CLASSIFICATION_COLORS[msg.classification] ?? "#64748b"}18`
                        },
                        children: msg.classification
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-sm font-bold text-white", children: msg.title })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-mono text-[10px] text-slate-600", children: formatRelativeTime(msg.sentAt) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs leading-relaxed text-slate-400", children: msg.body }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `announcements.mark_read.button.${idx + 1}`,
                    className: "font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-400",
                    onClick: () => void markRead.mutateAsync(msg.messageId),
                    children: "Mark Read"
                  }
                ) })
              ]
            },
            msg.messageId
          )) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "announcements.compose.dialog",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            className: "border font-mono sm:max-w-lg",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Broadcast Announcement" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                    "Title ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "announcements.title.input",
                      value: title,
                      onChange: (e) => setTitle(e.target.value),
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                    "Message ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      "data-ocid": "announcements.body.textarea",
                      value: body,
                      onChange: (e) => setBody(e.target.value),
                      rows: 4,
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Classification" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: classification, onValueChange: setClassification, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        "data-ocid": "announcements.classification.select",
                        className: "border font-mono text-xs text-white",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectContent,
                      {
                        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                        children: CLASSIFICATIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, className: "font-mono text-xs", children: c }, c))
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    "data-ocid": "announcements.compose.cancel_button",
                    className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    onClick: () => setShowDialog(false),
                    disabled: createMsg.isPending,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "announcements.compose.submit_button",
                    className: "font-mono text-xs uppercase tracking-wider",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    onClick: () => void handleCreate(),
                    disabled: createMsg.isPending || !title.trim() || !body.trim(),
                    children: createMsg.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Broadcast"
                  }
                )
              ] })
            ]
          }
        ) }),
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
  AnnouncementsPage as default
};
