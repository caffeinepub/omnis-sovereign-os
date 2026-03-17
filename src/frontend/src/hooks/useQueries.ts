/**
 * Centralized TanStack Query hooks for Omnis Sovereign OS.
 * All new backend API calls live here following the pattern:
 *   queryKey: [principalStr, "entity-name"]
 */
// Cast actor to extended interface since backend.ts is auto-generated with minimal types
// The full contract is in backend.d.ts which matches the deployed canister.
import type { backendInterface as ExtBackend } from "@/backend.d";
import type {
  BroadcastMessage,
  CalendarEvent,
  GovernanceRecord,
  KeywordWatchEntry,
  MessageGroup,
  Organization,
  RoleApprovalRequest,
  Task,
  UserPresence,
} from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Governance ────────────────────────────────────────────────────────────────

export function useGovernanceLog() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<GovernanceRecord[]>({
    queryKey: [principalStr, "governance-log"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getGovernanceLog();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWasmHash() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<string>({
    queryKey: [principalStr, "wasm-hash"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await (actor as unknown as ExtBackend).getWasmHash();
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommanderAuthCodeStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<boolean>({
    queryKey: [principalStr, "auth-code-status"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await (
          actor as unknown as ExtBackend
        ).getCommanderAuthCodeStatus();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateCommanderAuthCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation<string>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).generateCommanderAuthCode();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "auth-code-status"],
      });
    },
    onError: () => toast.error("Failed to generate auth code"),
  });
}

export function useRotateCommanderAuthCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation<string>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).rotateCommanderAuthCode();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "auth-code-status"],
      });
      toast.success("Auth code rotated");
    },
    onError: () => toast.error("Failed to rotate auth code"),
  });
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export function useMyCalendarEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<CalendarEvent[]>({
    queryKey: [principalStr, "calendar-events"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getMyCalendarEvents();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (event: CalendarEvent) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).createCalendarEvent(event);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"],
      });
      toast.success("Event created");
    },
    onError: () => toast.error("Failed to create event"),
  });
}

export function useUpdateCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (event: CalendarEvent) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).updateCalendarEvent(event);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"],
      });
      toast.success("Event updated");
    },
    onError: () => toast.error("Failed to update event"),
  });
}

export function useDeleteCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).deleteCalendarEvent(eventId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"],
      });
      toast.success("Event deleted");
    },
    onError: () => toast.error("Failed to delete event"),
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function useMyTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<Task[]>({
    queryKey: [principalStr, "my-tasks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getMyTasks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (task: Task) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).createTask(task);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"],
      });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: { taskId: string; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).updateTaskStatus(taskId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"],
      });
    },
    onError: () => toast.error("Failed to update task"),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).deleteTask(taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"],
      });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });
}

// ── Broadcast / Announcements ─────────────────────────────────────────────────

export function useBroadcastMessages() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<BroadcastMessage[]>({
    queryKey: [principalStr, "broadcast-messages"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getBroadcastMessages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useMarkBroadcastRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).markBroadcastRead(messageId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "broadcast-messages"],
      });
    },
  });
}

export function useCreateBroadcastMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useMutation({
    mutationFn: async (msg: BroadcastMessage) => {
      if (!actor) throw new Error("Not connected");
      return (actor as unknown as ExtBackend).createBroadcastMessage(msg);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "broadcast-messages"],
      });
      toast.success("Announcement sent");
    },
    onError: () => toast.error("Failed to send announcement"),
  });
}

// ── Group Messaging ───────────────────────────────────────────────────────────

export function useMyMessageGroups() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<MessageGroup[]>({
    queryKey: [principalStr, "message-groups"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getMyMessageGroups();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Presence ──────────────────────────────────────────────────────────────────

export function useOrgPresence() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<UserPresence[]>({
    queryKey: [principalStr, "org-presence"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const ext = actor as unknown as ExtBackend;
        if (typeof ext.getOrgPresence !== "function") return [];
        return await ext.getOrgPresence();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

// ── Role Approval Requests ────────────────────────────────────────────────────

export function useRoleApprovalRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<RoleApprovalRequest[]>({
    queryKey: [principalStr, "role-approval-requests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getRoleApprovalRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Organization ──────────────────────────────────────────────────────────────

export function useOrganization(orgId: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<Organization | null>({
    queryKey: [principalStr, "organization", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return null;
      try {
        return await (actor as unknown as ExtBackend).getOrganization(orgId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!orgId,
  });
}

// ── Keyword Watch ─────────────────────────────────────────────────────────────

export function useKeywordWatchList() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<KeywordWatchEntry[]>({
    queryKey: [principalStr, "keyword-watch"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getKeywordWatchList();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: [principalStr, "pending-users"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getPendingUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useDeniedUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "anon";
  return useQuery({
    queryKey: [principalStr, "denied-users"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as unknown as ExtBackend).getDeniedUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}
