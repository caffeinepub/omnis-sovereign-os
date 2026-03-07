// MOTOKO BACKLOG: networkMode field on Organization entity — when multi-tenant
// org namespacing is implemented, the org's network mode will be stored in the
// backend and fetched on login, overriding localStorage. For now, localStorage only.

import { type ReactNode, createContext, useContext, useState } from "react";

export type NetworkMode =
  | "military-nipr"
  | "military-sipr"
  | "corporate-standard"
  | "corporate-secure"
  | null;

interface NetworkModeContextValue {
  mode: NetworkMode;
  setMode: (mode: NetworkMode) => void;
  isSet: boolean;
}

const NetworkModeContext = createContext<NetworkModeContextValue | null>(null);

const STORAGE_KEY = "omnis_network_mode";

export function NetworkModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<NetworkMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored === "military-nipr" ||
      stored === "military-sipr" ||
      stored === "corporate-standard" ||
      stored === "corporate-secure"
    ) {
      return stored;
    }
    return null;
  });

  function setMode(next: NetworkMode) {
    setModeState(next);
    if (next === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      console.warn(
        "[OMNIS] Network mode stored in localStorage — UI-only. Backend enforcement pending.",
      );
    }
  }

  return (
    <NetworkModeContext.Provider
      value={{ mode, setMode, isSet: mode !== null }}
    >
      {children}
    </NetworkModeContext.Provider>
  );
}

export function useNetworkMode(): NetworkModeContextValue {
  const ctx = useContext(NetworkModeContext);
  if (!ctx) {
    throw new Error("useNetworkMode must be used within a NetworkModeProvider");
  }
  return ctx;
}
