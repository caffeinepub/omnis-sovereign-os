import { loadConfig } from "@/config";
import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";

interface StorageClientState {
  client: StorageClient | null;
  isReady: boolean;
}

export function useStorageClient(
  identity: Identity | null,
): StorageClientState {
  const [state, setState] = useState<StorageClientState>({
    client: null,
    isReady: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const config = await loadConfig();
        const agentOptions = identity ? { identity } : {};
        const agent = new HttpAgent({
          ...agentOptions,
          host: config.backend_host,
        });

        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }

        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        if (!cancelled) {
          setState({ client, isReady: true });
        }
      } catch (err) {
        console.error("Failed to initialize storage client:", err);
        if (!cancelled) {
          setState({ client: null, isReady: true });
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [identity]);

  return state;
}
