import type { Task } from "@/backend.d";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCreateTask,
  useDeleteTask,
  useMyTasks,
  useUpdateTaskStatus,
} from "@/hooks/useQueries";
import { formatDate } from "@/lib/formatters";
import { Link } from "@tanstack/react-router";
import { CheckSquare, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "InProgress", "Done", "Blocked"];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "#64748b",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

interface TaskFormState {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
}

const DEFAULT_FORM: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
};

export default function TasksPage() {
  const { profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const { data: tasks = [], isLoading } = useMyTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM);

  const openTasks = tasks.filter((t) => t.status !== "Done");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  async function handleCreate() {
    if (!identity || !actor) return;
    const principal = identity.getPrincipal();
    const orgId = profile?.orgId ?? "";
    await createTask.mutateAsync({
      taskId: crypto.randomUUID(),
      orgId,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: principal,
      assignedBy: principal,
      dueDate: form.dueDate
        ? BigInt(new Date(form.dueDate).getTime()) * 1_000_000n
        : undefined,
      status: "Open",
      priority: form.priority,
      createdAt: BigInt(Date.now()) * 1_000_000n,
    });
    setForm(DEFAULT_FORM);
    setShowDialog(false);
  }

  function renderTask(task: Task, idx: number) {
    const isDone = task.status === "Done";
    return (
      <div
        key={task.taskId}
        data-ocid={`tasks.item.${idx + 1}`}
        className="flex items-start gap-3 rounded border px-4 py-3"
        style={{
          backgroundColor: "#0f1626",
          borderColor: "#1a2235",
          opacity: isDone ? 0.6 : 1,
        }}
      >
        <Checkbox
          data-ocid={`tasks.checkbox.${idx + 1}`}
          checked={isDone}
          onCheckedChange={(checked) =>
            void updateStatus.mutateAsync({
              taskId: task.taskId,
              status: checked ? "Done" : "Open",
            })
          }
          className="mt-0.5 border-slate-600"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="font-mono text-sm font-semibold text-white"
              style={{ textDecoration: isDone ? "line-through" : "none" }}
            >
              {task.title}
            </p>
            <span
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${PRIORITY_COLORS[task.priority] ?? "#64748b"}18`,
                color: PRIORITY_COLORS[task.priority] ?? "#64748b",
              }}
            >
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {task.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            {task.dueDate && (
              <span className="font-mono text-[10px] text-slate-600">
                Due {formatDate(task.dueDate)}
              </span>
            )}
            <Select
              value={task.status}
              onValueChange={(v) =>
                void updateStatus.mutateAsync({
                  taskId: task.taskId,
                  status: v,
                })
              }
            >
              <SelectTrigger className="h-5 w-28 border-0 bg-transparent p-0 font-mono text-[10px] uppercase tracking-wider text-slate-500 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="font-mono text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          data-ocid={`tasks.delete_button.${idx + 1}`}
          className="h-7 w-7 shrink-0 border p-0"
          style={{
            borderColor: "rgba(239,68,68,0.3)",
            backgroundColor: "transparent",
          }}
          onClick={() => void deleteTask.mutateAsync(task.taskId)}
          disabled={deleteTask.isPending}
        >
          <Trash2 className="h-3 w-3 text-red-400" />
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="tasks.page"
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
                  <BreadcrumbPage>Tasks</BreadcrumbPage>
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
                <CheckSquare className="h-6 w-6" style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Tasks
                </h1>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500">
                  {tasks.length} total · {openTasks.length} open
                </p>
              </div>
            </div>
            <Button
              data-ocid="tasks.create.primary_button"
              onClick={() => setShowDialog(true)}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>

          {isLoading ? (
            <div data-ocid="tasks.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded"
                  style={{ backgroundColor: "#1a2235" }}
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div
              data-ocid="tasks.empty_state"
              className="flex flex-col items-center gap-3 rounded border py-16"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <CheckSquare className="h-10 w-10 text-slate-700" />
              <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                No tasks yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDialog(true)}
                className="mt-2 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                style={{
                  borderColor: "#2a3347",
                  backgroundColor: "transparent",
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                Create First Task
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="open">
              <TabsList
                className="mb-4 border"
                style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
              >
                <TabsTrigger
                  data-ocid="tasks.open.tab"
                  value="open"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
                >
                  Open ({openTasks.length})
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="tasks.done.tab"
                  value="done"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
                >
                  Done ({doneTasks.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                {openTasks.length === 0 ? (
                  <p className="py-8 text-center font-mono text-xs text-slate-600">
                    All tasks complete!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {openTasks.map((t, i) => renderTask(t, i + 1))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="done">
                {doneTasks.length === 0 ? (
                  <p className="py-8 text-center font-mono text-xs text-slate-600">
                    No completed tasks
                  </p>
                ) : (
                  <div className="space-y-2">
                    {doneTasks.map((t, i) => renderTask(t, i + 1))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          data-ocid="tasks.create.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              New Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                data-ocid="tasks.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Description
              </Label>
              <Textarea
                data-ocid="tasks.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Priority
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger
                    data-ocid="tasks.priority.select"
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "#0f1626",
                      borderColor: "#1a2235",
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="font-mono text-xs"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Due Date
                </Label>
                <Input
                  data-ocid="tasks.due_date.input"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="tasks.create.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowDialog(false)}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button
              data-ocid="tasks.create.submit_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => void handleCreate()}
              disabled={createTask.isPending || !form.title.trim()}
            >
              {createTask.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Create Task"
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
