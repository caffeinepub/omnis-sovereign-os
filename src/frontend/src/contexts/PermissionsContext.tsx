import type { ExtendedProfile, Folder, FolderPermission } from "@/backend.d";
import { DocumentPermission } from "@/backend.d";
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
  folderPermissions: FolderPermission[];
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [folderPermissions, setFolderPermissions] = useState<
    FolderPermission[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    try {
      const [profileResult, permsResult] = await Promise.all([
        actor.getMyProfile(),
        actor.getMyFolderPermission(),
      ]);
      setProfile(profileResult ?? null);
      setFolderPermissions(permsResult);
    } catch {
      setProfile(null);
      setFolderPermissions([]);
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
      setFolderPermissions([]);
      setHasFetched(false);
    }
  }, [identity]);

  const refreshProfile = useCallback(async () => {
    setHasFetched(false);
    await fetchProfile();
  }, [fetchProfile]);

  const canAccessFolder = useCallback(
    (folder: Folder): boolean => {
      // S2 admin bypasses all checks
      if (profile?.isS2Admin) return true;
      const level = profile ? Number(profile.clearanceLevel) : 0;
      // Gate 1: clearance level
      if (level < Number(folder.requiredClearanceLevel)) return false;
      // Gate 2: need-to-know (check folderPermissions loaded in context)
      const perm = folderPermissions.find((p) => p.folderId === folder.id);
      if (!perm) return false;
      if (!perm.needToKnow) return false;
      if (perm.role === DocumentPermission.NoAccess) return false;
      return true;
    },
    [profile, folderPermissions],
  );

  const value: PermissionsContextValue = {
    profile,
    isS2Admin: profile?.isS2Admin ?? false,
    isValidatedByCommander: profile?.isValidatedByCommander ?? false,
    clearanceLevel: profile ? Number(profile.clearanceLevel) : 0,
    canAccessFolder,
    refreshProfile,
    folderPermissions,
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
