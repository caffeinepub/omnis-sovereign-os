import { h as usePermissions, a as useInternetIdentity, c as useExtActor, r as reactExports, j as jsxRuntimeExports, L as Link, n as SquareCheckBig, B as Button, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, w as DialogFooter } from "./index-Nuoc5gUR.js";
import { T as TopNav, d as Skeleton, a as Textarea, e as formatDate } from "./TopNav-BtVzy2ke.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-DKlcFZL-.js";
import { C as Checkbox } from "./checkbox-By-yMrbs.js";
import { L as Label, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./displayName-mUntZQpD.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CMPl5W90.js";
import { g as useMyTasks, h as useCreateTask, i as useUpdateTaskStatus, j as useDeleteTask } from "./useQueries-B_H3JpO2.js";
import { P as Plus } from "./plus-BpymW9Mr.js";
import { L as LoaderCircle } from "./loader-circle-BnPM08q-.js";
import { T as Trash2 } from "./trash-2-DVGgutY8.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-Cauoz1NP.js";
import "./check-cDSKCr7b.js";
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "InProgress", "Done", "Blocked"];
const PRIORITY_COLORS = {
  Low: "#64748b",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444"
};
const DEFAULT_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: ""
};
function TasksPage() {
  const { profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useExtActor();
  const { data: tasks = [], isLoading } = useMyTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  const openTasks = tasks.filter((t) => t.status !== "Done");
  const doneTasks = tasks.filter((t) => t.status === "Done");
  async function handleCreate() {
    if (!identity || !actor) return;
    const principal = identity.getPrincipal();
    const orgId = (profile == null ? void 0 : profile.orgId) ?? "";
    await createTask.mutateAsync({
      taskId: crypto.randomUUID(),
      orgId,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: principal,
      assignedBy: principal,
      dueDate: form.dueDate ? BigInt(new Date(form.dueDate).getTime()) * 1000000n : void 0,
      status: "Open",
      priority: form.priority,
      createdAt: BigInt(Date.now()) * 1000000n
    });
    setForm(DEFAULT_FORM);
    setShowDialog(false);
  }
  function renderTask(task, idx) {
    const isDone = task.status === "Done";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": `tasks.item.${idx + 1}`,
        className: "flex items-start gap-3 rounded border px-4 py-3",
        style: {
          backgroundColor: "#0f1626",
          borderColor: "#1a2235",
          opacity: isDone ? 0.6 : 1
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              "data-ocid": `tasks.checkbox.${idx + 1}`,
              checked: isDone,
              onCheckedChange: (checked) => void updateStatus.mutateAsync({
                taskId: task.taskId,
                status: checked ? "Done" : "Open"
              }),
              className: "mt-0.5 border-slate-600"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "font-mono text-sm font-semibold text-white",
                  style: { textDecoration: isDone ? "line-through" : "none" },
                  children: task.title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                  style: {
                    backgroundColor: `${PRIORITY_COLORS[task.priority] ?? "#64748b"}18`,
                    color: PRIORITY_COLORS[task.priority] ?? "#64748b"
                  },
                  children: task.priority
                }
              )
            ] }),
            task.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs text-slate-500", children: task.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3", children: [
              task.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-slate-600", children: [
                "Due ",
                formatDate(task.dueDate)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: task.status,
                  onValueChange: (v) => void updateStatus.mutateAsync({
                    taskId: task.taskId,
                    status: v
                  }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-5 w-28 border-0 bg-transparent p-0 font-mono text-[10px] uppercase tracking-wider text-slate-500 focus:ring-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectContent,
                      {
                        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                        children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "font-mono text-xs", children: s }, s))
                      }
                    )
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              "data-ocid": `tasks.delete_button.${idx + 1}`,
              className: "h-7 w-7 shrink-0 border p-0",
              style: {
                borderColor: "rgba(239,68,68,0.3)",
                backgroundColor: "transparent"
              },
              onClick: () => void deleteTask.mutateAsync(task.taskId),
              disabled: deleteTask.isPending,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-red-400" })
            }
          )
        ]
      },
      task.taskId
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "tasks.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Tasks" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                  style: { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-6 w-6", style: { color: "#f59e0b" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Tasks" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500", children: [
                  tasks.length,
                  " total · ",
                  openTasks.length,
                  " open"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "tasks.create.primary_button",
                onClick: () => setShowDialog(true),
                className: "gap-2 font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                  "New Task"
                ]
              }
            )
          ] }),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "tasks.loading_state", className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Skeleton,
            {
              className: "h-16 w-full rounded",
              style: { backgroundColor: "#1a2235" }
            },
            i
          )) }) : tasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "tasks.empty_state",
              className: "flex flex-col items-center gap-3 rounded border py-16",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-10 w-10 text-slate-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-slate-600", children: "No tasks yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => setShowDialog(true),
                    className: "mt-2 border font-mono text-[10px] uppercase tracking-wider text-slate-400",
                    style: {
                      borderColor: "#2a3347",
                      backgroundColor: "transparent"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3 w-3" }),
                      "Create First Task"
                    ]
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "open", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsList,
              {
                className: "mb-4 border",
                style: { backgroundColor: "#0d1525", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      "data-ocid": "tasks.open.tab",
                      value: "open",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: [
                        "Open (",
                        openTasks.length,
                        ")"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      "data-ocid": "tasks.done.tab",
                      value: "done",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400",
                      children: [
                        "Done (",
                        doneTasks.length,
                        ")"
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "open", children: openTasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center font-mono text-xs text-slate-600", children: "All tasks complete!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: openTasks.map((t, i) => renderTask(t, i + 1)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "done", children: doneTasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center font-mono text-xs text-slate-600", children: "No completed tasks" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: doneTasks.map((t, i) => renderTask(t, i + 1)) }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "tasks.create.dialog",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            className: "border font-mono",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "New Task" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: [
                    "Title ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "tasks.title.input",
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
                      "data-ocid": "tasks.description.textarea",
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
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Priority" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: form.priority,
                        onValueChange: (v) => setForm((p) => ({ ...p, priority: v })),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectTrigger,
                            {
                              "data-ocid": "tasks.priority.select",
                              className: "border font-mono text-xs text-white",
                              style: {
                                backgroundColor: "#1a2235",
                                borderColor: "#2a3347"
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectContent,
                            {
                              style: {
                                backgroundColor: "#0f1626",
                                borderColor: "#1a2235"
                              },
                              children: PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectItem,
                                {
                                  value: p,
                                  className: "font-mono text-xs",
                                  children: p
                                },
                                p
                              ))
                            }
                          )
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Due Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "tasks.due_date.input",
                        type: "date",
                        value: form.dueDate,
                        onChange: (e) => setForm((p) => ({ ...p, dueDate: e.target.value })),
                        className: "border font-mono text-xs text-white",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
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
                    "data-ocid": "tasks.create.cancel_button",
                    className: "border font-mono text-xs uppercase tracking-wider text-slate-400",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    onClick: () => setShowDialog(false),
                    disabled: createTask.isPending,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": "tasks.create.submit_button",
                    className: "font-mono text-xs uppercase tracking-wider",
                    style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                    onClick: () => void handleCreate(),
                    disabled: createTask.isPending || !form.title.trim(),
                    children: createTask.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Create Task"
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
  TasksPage as default
};
