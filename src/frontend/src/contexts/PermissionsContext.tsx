import type { ExtendedProfile, Folder } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface PermissionsContextValue {
  profile: ExtendedProfile | null;
  isS2Admin: boolean;
  isValidatedByCommander: boolean;
  clearanceLevel: number;
  canAccessFolder: (folder: Folder) => boolean;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    try {
      const result = await actor.getMyProfile();
      setProfile(result ?? null);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [actor, isFetching]);

  // Fetch once when actor becomes available and identity is set
  useEffect(() => {
    if (actor && !isFetching && identity && !hasFetched) {
      void fetchProfile();
    }
  }, [actor, isFetching, identity, hasFetched, fetchProfile]);

  // Reset when identity changes (logout/login)
  useEffect(() => {
    if (!identity) {
      setProfile(null);
      setHasFetched(false);
    }
  }, [identity]);

  const refreshProfile = useCallback(async () => {
    setHasFetched(false);
    await fetchProfile();
    setHasFetched(true);
  }, [fetchProfile]);

  const canAccessFolder = useCallback(
    (folder: Folder): boolean => {
      const level = profile ? Number(profile.clearanceLevel) : 0;
      return level >= Number(folder.requiredClearanceLevel);
    },
    [profile],
  );

  const value: PermissionsContextValue = {
    profile,
    isS2Admin: profile?.isS2Admin ?? false,
    isValidatedByCommander: profile?.isValidatedByCommander ?? false,
    clearanceLevel: profile ? Number(profile.clearanceLevel) : 0,
    canAccessFolder,
    refreshProfile,
    isLoading,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
