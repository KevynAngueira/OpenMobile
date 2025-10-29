// SyncContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendMedia } from '../../utils/MediaUploader';
//import { HUB_BASE_URL } from '../../constants/Config';
import { FLASK_URL } from '../../constants/Config';


interface SyncEntry {
  id: string;
  videoPath: string;
  params?: Record<string, any>;
  videoStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  paramStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
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
      videoStatus: 'new',
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
      if (entry.videoStatus === 'uploaded') {
        console.log('Skipping Upload: ', entry.id);
        setSyncResult(`Upload Response: skipping ${entry.id}`);
        continue;
      }

      try {
        if ((entry.videoStatus !== 'uploading') || (entry.paramStatus !== 'uploading')) {
          entry.videoStatus = 'uploading';
          entry.paramStatus = 'uploading';

          const uploadResponse = await sendMedia(
            'video',
            [{
              path: entry.videoPath,
              params: entry.params
            }],
            `${FLASK_URL}/video/send`
          );          

          entry.videoStatus = 'uploaded';
          entry.paramStatus = 'uploaded';
          
          entry.uploadResponse = uploadResponse[0].data;
          console.log('Upload Response: ', entry.uploadResponse);
          setSyncResult(`Upload Response: ${entry.uploadResponse}`);
        }
      } catch (error) {
        console.error('Sync error for video upload:', entry.videoPath, error);
        setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
        entry.videoStatus = 'failed';
        
      }
    }

    return updatedEntries;
  };
  
  const syncInference = async (entries: SyncEntry[], setSyncResult: (message: string) => void) => {
    let updatedEntries = [...entries];

    for (const entry of updatedEntries) {
      console.log('Checking completed status for: ', entry.id);
      if (entry.inferenceStatus === 'completed' || entry.videoStatus !== 'uploaded') {
        console.log('Skipping Inference: ', entry.id);
        setSyncResult(`Inference Response: skipping ${entry.id}`);
        continue;
      }

      try {
        if (entry.inferenceStatus !== 'completed') {
          entry.inferenceStatus = 'running';
          const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
          const inferenceResponse = await fetch(`${FLASK_URL}/inference/${fileNameWithoutExtension}`);
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
  
  const syncAllPending = async (
    mediaItems: {path: string; params?: Record<string, any>}[], 
    setSyncResult: (message: string) => void
  ) => {
    let updatedEntries = ([...(syncEntries || [])]).filter(Boolean);
  
    // Step 1: Remove deprecated entries
    console.log('== Removing Deprecated Entries ==');
    updatedEntries = updatedEntries.filter((entry) =>{
      return mediaItems.some((item) => item.path === entry.videoPath)
    });
    setSyncEntries(updatedEntries);
  
    console.log(updatedEntries); // Debug log

    // Step 2: Create new entries
    console.log('== Creating New Entries');
    for (const item of mediaItems) {
      const id = item.path.split('/').pop();
      if (!updatedEntries.some((entry) => entry.id === id)) {
        const newEntry: SyncEntry = {
          id: id,
          videoPath: item.path,
          params: item.params,
          videoStatus: 'new',
          inferenceStatus: 'pending',
        };
        updatedEntries.push(newEntry);      
      } else {
        updatedEntries = updatedEntries.map((entry) => 
          ((entry.id === id) && (JSON.stringify(entry.params) !== JSON.stringify(item.params))) ?
            {
              ...entry,
              params: item.params,
              paramStatus: 'new',
              inferenceStatus: 'pending',
            } : entry
        );
      }
    }
    setSyncEntries(updatedEntries);

    console.log(updatedEntries); // Debug log
    
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