import { a9 as useActor, a as useInternetIdentity, a3 as useQuery, a4 as useQueryClient, p as ue } from "./index-DuIlzyaK.js";
import { u as useMutation } from "./TopNav-DWuUPlpI.js";
function useGovernanceLog() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "governance-log"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getGovernanceLog();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching
  });
}
function useWasmHash() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "wasm-hash"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await actor.getWasmHash();
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching
  });
}
function useCommanderAuthCodeStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "auth-code-status"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.getCommanderAuthCodeStatus();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching
  });
}
function useGenerateCommanderAuthCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.generateCommanderAuthCode();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "auth-code-status"]
      });
    },
    onError: () => ue.error("Failed to generate auth code")
  });
}
function useRotateCommanderAuthCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.rotateCommanderAuthCode();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "auth-code-status"]
      });
      ue.success("Auth code rotated");
    },
    onError: () => ue.error("Failed to rotate auth code")
  });
}
function useMyCalendarEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "calendar-events"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyCalendarEvents();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching
  });
}
function useCreateCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (event) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCalendarEvent(event);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"]
      });
      ue.success("Event created");
    },
    onError: () => ue.error("Failed to create event")
  });
}
function useUpdateCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (event) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCalendarEvent(event);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"]
      });
      ue.success("Event updated");
    },
    onError: () => ue.error("Failed to update event")
  });
}
function useDeleteCalendarEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (eventId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCalendarEvent(eventId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "calendar-events"]
      });
      ue.success("Event deleted");
    },
    onError: () => ue.error("Failed to delete event")
  });
}
function useMyTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "my-tasks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyTasks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching
  });
}
function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (task) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(task);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"]
      });
      ue.success("Task created");
    },
    onError: () => ue.error("Failed to create task")
  });
}
function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async ({
      taskId,
      status
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTaskStatus(taskId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"]
      });
    },
    onError: () => ue.error("Failed to update task")
  });
}
function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (taskId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "my-tasks"]
      });
      ue.success("Task deleted");
    },
    onError: () => ue.error("Failed to delete task")
  });
}
function useBroadcastMessages() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "broadcast-messages"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBroadcastMessages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
}
function useMarkBroadcastRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (messageId) => {
      if (!actor) throw new Error("Not connected");
      return actor.markBroadcastRead(messageId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "broadcast-messages"]
      });
    }
  });
}
function useCreateBroadcastMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useMutation({
    mutationFn: async (msg) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBroadcastMessage(msg);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "broadcast-messages"]
      });
      ue.success("Announcement sent");
    },
    onError: () => ue.error("Failed to send announcement")
  });
}
function useRoleApprovalRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "role-approval-requests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRoleApprovalRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching
  });
}
function usePendingUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "pending-users"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0
  });
}
function useDeniedUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  return useQuery({
    queryKey: [principalStr, "denied-users"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getDeniedUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0
  });
}
export {
  useMarkBroadcastRead as a,
  useCreateBroadcastMessage as b,
  useMyCalendarEvents as c,
  useCreateCalendarEvent as d,
  useUpdateCalendarEvent as e,
  useDeleteCalendarEvent as f,
  useMyTasks as g,
  useCreateTask as h,
  useUpdateTaskStatus as i,
  useDeleteTask as j,
  useGovernanceLog as k,
  useWasmHash as l,
  useCommanderAuthCodeStatus as m,
  useGenerateCommanderAuthCode as n,
  useRotateCommanderAuthCode as o,
  usePendingUsers as p,
  useDeniedUsers as q,
  useRoleApprovalRequests as r,
  useBroadcastMessages as u
};
