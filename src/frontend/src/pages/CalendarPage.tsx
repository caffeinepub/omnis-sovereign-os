import type { CalendarEvent } from "@/backend.d";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useExtActor as useActor } from "@/hooks/useExtActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useMyCalendarEvents,
  useUpdateCalendarEvent,
} from "@/hooks/useQueries";
import { formatDate } from "@/lib/formatters";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const CLASSIFICATIONS = [
  "UNCLASSIFIED",
  "CUI",
  "CONFIDENTIAL",
  "SECRET",
  "TOP SECRET",
];

function msToDatetimeLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToNano(s: string): bigint {
  return BigInt(new Date(s).getTime()) * 1_000_000n;
}

function formatEventTime(ts: bigint): string {
  const ms = Number(ts) > 1e15 ? Number(ts) / 1_000_000 : Number(ts);
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EventFormState {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  classification: string;
  isOrgWide: boolean;
}

const DEFAULT_FORM: EventFormState = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  classification: "UNCLASSIFIED",
  isOrgWide: false,
};

export default function CalendarPage() {
  const { profile } = usePermissions();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const { data: events = [], isLoading } = useMyCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormState>(DEFAULT_FORM);

  function openCreate() {
    const now = msToDatetimeLocal(Date.now());
    const later = msToDatetimeLocal(Date.now() + 3600_000);
    setForm({ ...DEFAULT_FORM, startTime: now, endTime: later });
    setEditTarget(null);
    setShowDialog(true);
  }

  function openEdit(ev: CalendarEvent) {
    const startMs =
      Number(ev.startTime) > 1e15
        ? Number(ev.startTime) / 1_000_000
        : Number(ev.startTime);
    const endMs =
      Number(ev.endTime) > 1e15
        ? Number(ev.endTime) / 1_000_000
        : Number(ev.endTime);
    setForm({
      title: ev.title,
      description: ev.description,
      startTime: msToDatetimeLocal(startMs),
      endTime: msToDatetimeLocal(endMs),
      classification: ev.classification,
      isOrgWide: ev.isOrgWide,
    });
    setEditTarget(ev);
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!identity || !actor) return;
    const principal = identity.getPrincipal();
    const orgId = profile?.orgId ?? "";

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
        isOrgWide: form.isOrgWide,
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
        isOrgWide: form.isOrgWide,
      });
    }
    setShowDialog(false);
  }

  const sorted = [...events].sort((a, b) => Number(a.startTime - b.startTime));
  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <div
      data-ocid="calendar.page"
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
                  <BreadcrumbPage>Calendar</BreadcrumbPage>
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
                <Calendar className="h-6 w-6" style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Calendar
                </h1>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-slate-500">
                  Shared &amp; personal organization calendar
                </p>
              </div>
            </div>
            <Button
              data-ocid="calendar.create.primary_button"
              onClick={openCreate}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Event
            </Button>
          </div>

          {/* Event list */}
          {isLoading ? (
            <div data-ocid="calendar.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded"
                  style={{ backgroundColor: "#1a2235" }}
                />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              data-ocid="calendar.empty_state"
              className="flex flex-col items-center gap-3 rounded border py-16"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <Calendar className="h-10 w-10 text-slate-700" />
              <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                No events scheduled
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreate}
                className="mt-2 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                style={{
                  borderColor: "#2a3347",
                  backgroundColor: "transparent",
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((ev, idx) => (
                <div
                  key={ev.eventId}
                  data-ocid={`calendar.item.${idx + 1}`}
                  className="flex items-start gap-4 rounded border px-4 py-3"
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: "rgba(245,158,11,0.1)" }}
                  >
                    <Clock className="h-4 w-4" style={{ color: "#f59e0b" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-sm font-semibold text-white">
                        {ev.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: "rgba(245,158,11,0.1)",
                            color: "#f59e0b",
                          }}
                        >
                          {ev.classification}
                        </span>
                        {ev.isOrgWide && (
                          <span
                            className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                            style={{
                              backgroundColor: "rgba(96,165,250,0.1)",
                              color: "#60a5fa",
                            }}
                          >
                            Org-Wide
                          </span>
                        )}
                      </div>
                    </div>
                    {ev.description && (
                      <p className="mt-0.5 font-mono text-xs text-slate-500">
                        {ev.description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-slate-600">
                      {formatEventTime(ev.startTime)} —{" "}
                      {formatEventTime(ev.endTime)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`calendar.edit_button.${idx + 1}`}
                      className="h-7 w-7 border p-0"
                      style={{
                        borderColor: "#2a3347",
                        backgroundColor: "transparent",
                      }}
                      onClick={() => openEdit(ev)}
                    >
                      <Edit2 className="h-3 w-3 text-slate-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`calendar.delete_button.${idx + 1}`}
                      className="h-7 w-7 border p-0"
                      style={{
                        borderColor: "rgba(239,68,68,0.3)",
                        backgroundColor: "transparent",
                      }}
                      onClick={() => void deleteEvent.mutateAsync(ev.eventId)}
                      disabled={deleteEvent.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          data-ocid="calendar.event.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              {editTarget ? "Edit Event" : "New Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                data-ocid="calendar.title.input"
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
                data-ocid="calendar.description.textarea"
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
                  Start <span className="text-red-400">*</span>
                </Label>
                <Input
                  data-ocid="calendar.start.input"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  End <span className="text-red-400">*</span>
                </Label>
                <Input
                  data-ocid="calendar.end.input"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Classification
              </Label>
              <Select
                value={form.classification}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, classification: v }))
                }
              >
                <SelectTrigger
                  data-ocid="calendar.classification.select"
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
            <div className="flex items-center gap-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Org-Wide Event
              </Label>
              <Switch
                data-ocid="calendar.org_wide.switch"
                checked={form.isOrgWide}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isOrgWide: v }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="calendar.event.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              data-ocid="calendar.event.save_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => void handleSubmit()}
              disabled={
                isPending ||
                !form.title.trim() ||
                !form.startTime ||
                !form.endTime
              }
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : editTarget ? (
                "Save Changes"
              ) : (
                "Create Event"
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
