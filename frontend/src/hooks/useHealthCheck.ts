import { useEffect, useState } from "react";
import { api, type HealthResponse } from "@/lib/api";

export type HealthState =
  | { status: "checking" }
  | { status: "healthy"; data: HealthResponse }
  | { status: "unreachable" };

export function useHealthCheck(pollIntervalMs = 30000) {
  const [health, setHealth] = useState<HealthState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const data = await api.health();
        if (!cancelled) setHealth({ status: "healthy", data });
      } catch {
        if (!cancelled) setHealth({ status: "unreachable" });
      }
    }

    check();
    const id = setInterval(check, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollIntervalMs]);

  return health;
}
