/**
 * useExtActor — typed wrapper around useActor that returns the actor
 * cast to the full ExtendedBackend interface from backend.d.ts.
 *
 * The auto-generated backend.ts only exposes a minimal 3-method backendInterface.
 * The full contract is declared in backend.d.ts and matches the deployed canister.
 * Use this hook anywhere you need to call backend methods beyond the 3 generated ones.
 */
import type { backendInterface as ExtBackend } from "@/backend.d";
import { useActor } from "./useActor";

export function useExtActor() {
  const { actor, isFetching } = useActor();
  return {
    actor: actor as unknown as ExtBackend | null,
    isFetching,
  };
}
