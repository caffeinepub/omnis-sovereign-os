import { f as createLucideIcon, h as usePermissions, a as useInternetIdentity, c as useExtActor, r as reactExports, j as jsxRuntimeExports, L as Link, a6 as Calendar, B as Button, s as Dialog, t as DialogContent, v as DialogHeader, w as DialogTitle, x as DialogFooter } from "./index-Dm1hd-rR.js";
import { T as TopNav, c as Skeleton } from "./TopNav-DdQyQomH.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-uQL2noKn.js";
import { L as Label, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./displayName-CSKLG_nZ.js";
import { S as Switch } from "./switch-DFnWosOV.js";
import { T as Textarea } from "./textarea-T9HPEIXk.js";
import { c as useMyCalendarEvents, d as useCreateCalendarEvent, e as useUpdateCalendarEvent, f as useDeleteCalendarEvent } from "./useQueries-B8zXSsz3.js";
import { P as Plus } from "./plus-ByWXVOi5.js";
import { C as Clock } from "./clock-DazB164b.js";
import { T as Trash2 } from "./trash-2-CAT_g9_8.js";
import { L as LoaderCircle } from "./loader-circle-BzIe35gm.js";
import "./constants-O6cGduIW.js";
import "./chevron-down-C4YFpDW9.js";
import "./chevron-right-BnUWxoQQ.js";
import "./check-UB5_kp0G.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const Pen = createLucideIcon("pen", __iconNode);
const CLASSIFICATIONS = [
  "UNCLASSIFIED",
  "CUI",
  "CONFIDENTIAL",
  "SECRET",
  "TOP SECRET"
];
function msToDatetimeLocal(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function datetimeLocalToNano(s) {
  return BigInt(new Date(s).getTime()) * 1000000n;
}
function formatEventTime(ts) {
  const ms = Number(ts) > 1e15 ? Number(ts) / 1e6 : Number(ts);
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const DEFAULT_FORM = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  classification: "UNCLASSIFIED",
  isOrgWide: false
};
function CalendarPage() {
  const { profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useExtActor();
  const { data: events = [], isLoading } = useMyCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  function openCreate() {
    const now = msToDatetimeLocal(Date.now());
    const later = msToDatetimeLocal(Date.now() + 36e5);
    setForm({ ...DEFAULT_FORM, startTime: now, endTime: later });
    setEditTarget(null);
    setShowDialog(true);
  }
  function openEdit(ev) {
    const startMs = Number(ev.startTime) > 1e15 ? Number(ev.startTime) / 1e6 : Number(ev.startTime);
    const endMs = Number(ev.endTime) > 1e15 ? Number(ev.endTime) / 1e6 : Number(ev.endTime);
    setForm({
      title: ev.title,
      description: ev.description,
      startTime: msToDatetimeLocal(startMs),
      endTime: msToDatetimeLocal(endMs),
      classification: ev.classification,
      isOrgWide: ev.isOrgWide
    });
    setEditTarget(ev);
    setShowDialog(true);
  }
  async function handleSubmit() {
    if (!identity || !actor) return;
    const principal = identity.getPrincipal();
    const orgId = (profile == null ? void 0 : profile.orgId) ?? "";
    const startNano = datetimeLocalToNano(form.startTime);
    const endNano = datetimeLocalToNano(form.endTime);
    if (editTarget) {
      await updateEvent.mutateAsync({
        ...editTarget,
        title: form.title.trim(),
        description: form.description.trim(),
        startTime: startNano,
        endTime: endNano,
        classification: form.classification,
        isOrgWide: form.isOrgWide
      });
    } else {
      await createEvent.mutateAsync({
        eventId: crypto.randomUUID(),
        orgId,
        title: form.title.trim(),
        description: form.description.trim(),
        startTime: startNano,
        endTime: endNano,
        createdBy: principal,
        classification: form.classification,
        isOrgWide: form.isOrgWide
      });
    }
    setShowDialog(false);
  }
  const sorted = [...events].sort((a, b) => Number(a.startTime - b.startTime));
  const isPending = createEvent.isPending || updateEvent.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "calendar.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Calendar" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                  style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-6 w-6", style: { color: "#f59e0b" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Calendar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500", children: "Shared & personal organization calendar" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "calendar.create.primary_button",
                onClick: openCreate,
                className: "gap-2 font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                  "New Event"
                ]
              }
            )
          ] }),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "calendar.loading_state", className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Skeleton,
            {
              className: "h-16 w-full rounded",
              style: { backgroundColor: "#1a2235" }
            },
            i
          )) }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "calendar.empty_state",
              className: "flex flex-col items-center gap-3 rounded border py-16",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-10 w-10 text-slate-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No events scheduled" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: openCreate,
                    className: "mt-2 border font-mono text-[10px] uppercase tracking-wider text-slate-400",
                    style: {
                      borderColor: "#2a3347",
                      backgroundColor: "transparent"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
                      "Add First Event"
                    ]
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sorted.map((ev, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `calendar.item.${idx + 1}`,
              className: "flex items-start gap-4 rounded border px-4 py-3",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                    style: { backgroundColor: "rgba(245,158,11,0.1)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4", style: { color: "#f59e0b" } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-white", children: ev.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                          style: {
                            backgroundColor: "rgba(245,158,11,0.1)",
                            color: "#f59e0b"
                          },
                          children: ev.classification
                        }
                      ),
                      ev.isOrgWide && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          style: {
                            backgroundColor: "rgba(96,165,250,0.1)",
                            color: "#60a5fa"
                          },
                          children: "Org-Wide"
                        }
                      )
                    ] })
                  ] }),
                  ev.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-slate-500", children: ev.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 font-mono text-[10px] text-slate-600", children: [
                    formatEventTime(ev.startTime),
                    " —",
                    " ",
                    formatEventTime(ev.endTime)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      "data-ocid": `calendar.edit_button.${idx + 1}`,
                      className: "h-7 w-7 border p-0",
                      style: {
                        borderColor: "#2a3347",
                        backgroundColor: "transparent"
                      },
                      onClick: () => openEdit(ev),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3 w-3 text-slate-400" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      "data-ocid": `calendar.delete_button.${idx + 1}`,
                      className: "h-7 w-7 border p-0",
                      style: {
                        borderColor: "rgba(239,68,68,0.3)",
                        backgroundColor: "transparent"
                      },
                      onClick: () => void deleteEvent.mutateAsync(ev.eventId),
                      disabled: deleteEvent.isPending,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-red-400" })
                    }
                  )
                ] })
              ]
            },
            ev.eventId
          )) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "calendar.event.dialog",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            className: "border font-mono sm:max-w-lg",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: editTarget ? "Edit Event" : "New Event" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                    "Title ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "calendar.title.input",
                      value: form.title,
                      onChange: (e) => setForm((p) => ({ ...p, title: e.target.value })),
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      "data-ocid": "calendar.description.textarea",
                      value: form.description,
                      onChange: (e) => setForm((p) => ({ ...p, description: e.target.value })),
                      rows: 2,
                      className: "border font-mono text-xs text-white",
                      style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                      "Start ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "calendar.start.input",
                        type: "datetime-local",
                        value: form.startTime,
                        onChange: (e) => setForm((p) => ({ ...p, startTime: e.target.value })),
                        className: "border font-mono text-xs text-white",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                      "End ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "calendar.end.input",
                        type: "datetime-local",
                        value: form.endTime,
                        onChange: (e) => setForm((p) => ({ ...p, endTime: e.target.value })),
                        className: "border font-mono text-xs text-white",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Classification" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.classification,
                      onValueChange: (v) => setForm((p) => ({ ...p, classification: v })),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          {
                            "data-ocid": "calendar.classification.select",
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
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Org-Wide Event" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      "data-ocid": "calendar.org_wide.switch",
                      checked: form.isOrgWide,
                      onCheckedChange: (v) => setForm((p) => ({ ...p, isOrgWide: v }))
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    "data-ocid": "calendar.event.cancel_button",
                    className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    onClick: () => setShowDialog(false),
                    disabled: isPending,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "calendar.event.save_button",
                    className: "font-mono text-xs uppercase tracking-wider",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    onClick: () => void handleSubmit(),
                    disabled: isPending || !form.title.trim() || !form.startTime || !form.endTime,
                    children: isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : editTarget ? "Save Changes" : "Create Event"
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
  CalendarPage as default
};
