// hooks/useSyncMaps.ts
import { useMemo } from "react";
import { SyncEntry } from '../types/SyncTypes';

export function useSyncMaps(
  syncEntries: SyncEntry[]
) {
  const syncMap = useMemo(() => {
    const map: Record<string, SyncEntry> = {};
    for (const s of syncEntries) map[s.videoPath] = s;
    return map;
  }, [syncEntries]);

  const videoToSync = (videoPath: string): SyncEntry => {
    return syncMap[videoPath];
  }

  return {
    syncMap,
    videoToSync
  };
}
