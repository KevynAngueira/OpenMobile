// SyncContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncEntry {
  id: string; // Unique identifier for the video file (e.g., filename or hash)
  videoPath: string;
  uploadStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  inferenceStatus: 'pending' | 'running' | 'completed' | 'failed';
  uploadResponse?: any;
  inferenceResponse?: any;
}

interface SyncContextType {
  syncEntries: SyncEntry[];
  addSyncEntry: (videoPath: string) => Promise<void>;
  updateSyncEntry: (id: string, updates: Partial<SyncEntry>) => void;
  removeSyncEntry: (id: string) => Promise<void>;
  syncAllPending: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

const SYNC_STORAGE_KEY = '@syncEntries';

export const SyncProvider: React.FC = ({ children }) => {
  const [syncEntries, setSyncEntries] = useState<SyncEntry[]>([]);

  // Load sync entries from AsyncStorage when the app starts
  useEffect(() => {
    const loadSyncEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
        if (storedEntries) {
          setSyncEntries(JSON.parse(storedEntries));
        }
      } catch (error) {
        console.error('Failed to load sync entries:', error);
      }
    };

    loadSyncEntries();
  }, []);

  // Save sync entries to AsyncStorage whenever they change
  useEffect(() => {
    const saveSyncEntries = async () => {
      try {
        await AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncEntries));
      } catch (error) {
        console.error('Failed to save sync entries:', error);
      }
    };

    saveSyncEntries();
  }, [syncEntries]);

  const addSyncEntry = async (videoPath: string) => {
    const id = videoPath.split('/').pop(); // Generate ID based on file name
    if (syncEntries.some((entry) => entry.id === id)) return; // Avoid duplicates
    const newEntry: SyncEntry = {
      id,
      videoPath,
      uploadStatus: 'new',
      inferenceStatus: 'pending',
    };
    setSyncEntries((prev) => [...prev, newEntry]);
  };

  const updateSyncEntry = (id: string, updates: Partial<SyncEntry>) => {
    setSyncEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const removeSyncEntry = async (id: string) => {
    setSyncEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const syncAllPending = async () => {
    for (const entry of syncEntries) {
      if (entry.uploadStatus === 'uploaded' && entry.inferenceStatus === 'completed') continue;

      try {
        if (entry.uploadStatus === 'new' || entry.uploadStatus === 'failed') {
          // Upload video
          updateSyncEntry(entry.id, { uploadStatus: 'uploading' });
          const uploadResponse = await sendMedia('video', [entry.videoPath], `${HUB_BASE_URL}upload.py`);
          updateSyncEntry(entry.id, { uploadStatus: 'uploaded', uploadResponse: uploadResponse[0].data });
        }

        if (entry.inferenceStatus === 'pending' || entry.inferenceStatus === 'failed') {
          // Run inference
          updateSyncEntry(entry.id, { inferenceStatus: 'running' });
          const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
          const inferenceResponse = await fetch(`${HUB_BASE_URL}/inferenceVid.py?p1=${fileNameWithoutExtension}&p2=json`);
          const inferenceJson = await inferenceResponse.json();
          updateSyncEntry(entry.id, { inferenceStatus: 'completed', inferenceResponse: inferenceJson });
        }
      } catch (error) {
        console.error('Sync error for video:', entry.videoPath, error);
        if (entry.uploadStatus === 'uploading') {
          updateSyncEntry(entry.id, { uploadStatus: 'failed' });
        }
        if (entry.inferenceStatus === 'running') {
          updateSyncEntry(entry.id, { inferenceStatus: 'failed' });
        }
      }
    }
  };

  return (
    <SyncContext.Provider
      value={{
        syncEntries,
        addSyncEntry,
        updateSyncEntry,
        removeSyncEntry,
        syncAllPending,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

