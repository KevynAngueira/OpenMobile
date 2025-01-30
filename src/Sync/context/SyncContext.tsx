// SyncContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendMedia } from '../../utils/MediaUploader';
import { HUB_BASE_URL } from '../../constants/Config';


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
  
  const syncUploads = async (entries: SyncEntry[], setSyncResult: (message: string) => void) => {
    let updatedEntries = [...entries];

    for (const entry of updatedEntries) {
      console.log('Checking upload status for: ', entry.id);
      if (entry.uploadStatus === 'uploaded') {
        console.log('Skipping Upload: ', entry.id);
        setSyncResult(`Upload Response: skipping ${entry.id}`);
        continue;
      }

      try {
        if (entry.uploadStatus !== 'uploading') {
          entry.uploadStatus = 'uploading';
          const uploadResponse = await sendMedia('video', [entry.videoPath], `${HUB_BASE_URL}upload.py`);
          entry.uploadStatus = 'uploaded';
          entry.uploadResponse = uploadResponse[0].data;
          console.log('Upload Response: ', entry.uploadResponse);
          setSyncResult(`Upload Response: ${entry.uploadResponse}`);
        }
      } catch (error) {
        console.error('Sync error for video upload:', entry.videoPath, error);
        setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
        entry.uploadStatus = 'failed';
        
      }
    }

    return updatedEntries;
  };
  
  const syncInference = async (entries: SyncEntry[], setSyncResult: (message: string) => void) => {
    let updatedEntries = [...entries];

    for (const entry of updatedEntries) {
      console.log('Checking completed status for: ', entry.id);
      if (entry.inferenceStatus === 'completed' || entry.uploadStatus !== 'uploaded') {
        console.log('Skipping Inference: ', entry.id);
        setSyncResult(`Inference Response: skipping ${entry.id}`);
        continue;
      }

      try {
        if (entry.inferenceStatus !== 'completed') {
          entry.inferenceStatus = 'running';
          const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
          const inferenceResponse = await fetch(`${HUB_BASE_URL}/inferenceVid.py?p1=${fileNameWithoutExtension}&p2=json`);
          const inferenceJson = await inferenceResponse.json();
          entry.inferenceStatus = 'completed';
          entry.inferenceResponse = inferenceJson;
          console.log('Inference Response: ', inferenceJson);
          setSyncResult(`Inference Response: ${JSON.stringify(inferenceJson)}`);
          setSyncEntries(updatedEntries);
        }
      } catch (error) {
        console.error('Sync error for video inference:', entry.videoPath, error);
        setSyncResult(`Inference Failed: ${entry.id} => ${error.message}`);
        entry.inferenceStatus = 'failed';
      }
    }
      
    return updatedEntries;
  };
  
  const syncAllPending = async (videosToSend: string[], setSyncResult: (message: string) => void) => {
    let updatedEntries = [...syncEntries];
  
    // Step 1: Remove deprecated entries
    console.log('== Removing Deprecated Entries ==');
    updatedEntries = updatedEntries.filter((entry) =>
      videosToSend.includes(entry.videoPath)
    );
    setSyncEntries(updatedEntries);
  
    // Step 2: Create new entries
    console.log('== Creating New Entries');
     for (const videoPath of videosToSend) {
      const id = videoPath.split('/').pop();
      if (updatedEntries.some((entry) => entry.id === id)) {
        continue; 
      }

      const newEntry: SyncEntry = {
        id,
        videoPath,
        uploadStatus: 'new',
        inferenceStatus: 'pending',
      };
      updatedEntries.push(newEntry);
    }
    setSyncEntries(updatedEntries);
    
    // Step 3: Upload videos
    console.log('== Start Video Upload ==');
    updatedEntries = await syncUploads(updatedEntries, setSyncResult);
    setSyncEntries(updatedEntries);
    console.log('== End Video Upload ==');
    
    setSyncResult("Upload Successful! Running Inference...");
    
    // Step 4: Run inference
    console.log('== Start Video Inference ==');
    updatedEntries = await syncInference(updatedEntries, setSyncResult);
    console.log('== End Video Inference ==');
    
    setTimeout(() => setSyncResult("Inference Successful! Sync Complete"), 3000);
    setTimeout(() => setSyncResult(null), 6000);
  };
  
  return (
    <SyncContext.Provider
      value={{
        syncEntries,
        setSyncEntries,
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

