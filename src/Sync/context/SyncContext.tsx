// SyncContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendMedia, sendParams } from '../../utils/MediaUploader';
// import { FLASK_URL } from '../../constants/Config';

interface SyncEntry {
  id: string;
  videoPath: string;
  params?: Record<string, any>;

  videoUploadStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  paramUploadStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  videoUploadResponse?: any;
  paramUploadResponse?: any;
  
  videoInferenceStatus: 'pending' | 'running' | 'completed' | 'failed';
  paramInferenceStatus: 'pending' | 'running' | 'completed' | 'failed';  
  videoInferenceResponse?: any;
  paramInferenceResponse?: any;
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

  //////////////////////////////////////////// 
  //      CRUD Functions (Atomic)
  ////////////////////////////////////////////


  function atomicAddEntry(
    entries: SyncEntry[],
    videoPath: string,
    params: Record<string, any>
  ): SyncEntry[] {
    
    const id = videoPath.split('/').pop();
    if (!id) return entries;
    if (entries.some((entry) => entry.id === id)) return entries; // Avoid duplicates
  
    const newEntry: SyncEntry = {
      id,
      videoPath,
      params,
      videoUploadStatus: 'new',
      paramUploadStatus: 'new',
      videoInferenceStatus: 'pending',
      paramInferenceStatus: 'pending',
    };
    return [...entries, newEntry];
  }

  function atomicUpdateEntry(
    entries: SyncEntry[],
    id: string,
    updates: Partial<SyncEntry>
  ): SyncEntry[] {
    return entries.map((entry) => {
      if (entry.id !== id) return entry;
  
      let newEntry = { ...entry, ...updates };
  
      // If videoPath changed
      if (updates.videoPath && updates.videoPath !== entry.videoPath) {
        newEntry.id = updates.videoPath.split('/').pop() || entry.id;
        newEntry.videoUploadStatus = 'new';
        newEntry.videoUploadResponse = undefined;
        newEntry.videoInferenceStatus = 'pending';
        newEntry.videoInferenceResponse = undefined;
      }
  
      // If params changed
      if (updates.params && updates.params !== entry.params) {
        newEntry.paramUploadStatus = 'new';
        newEntry.paramUploadResponse = undefined;
        newEntry.paramInferenceStatus = 'pending';
        newEntry.paramInferenceResponse = undefined;
      }
  
      return newEntry;
    });
  }
  
  function atomicRemoveEntry(
    entries: SyncEntry[],
    id: string
  ): SyncEntry[] {
    return entries.filter((entry) => entry.id !== id);
  }

  function atomicRemoveDeprecatedEntries(
    entries: SyncEntry[],
    mediaItems: { path: string }[]
  ): SyncEntry[] {
    const mediaPaths = new Set(mediaItems.map((item) => item.path));
    return entries.filter((entry) => mediaPaths.has(entry.videoPath));
  }

  //////////////////////////////////////////// 
  //      CRUD Functions (Async)
  ////////////////////////////////////////////

  const addSyncEntry = async (
    videoPath: string,
    params: Record<string, any>
  ) => {
    setSyncEntries((prev) => atomicAddEntry(prev, videoPath, params));
  };
  
  const updateSyncEntry = async (
    videoPath: string,
    params: Record<string, any>
  ) => {
    setSyncEntries((prev) => atomicUpdateEntry(prev, videoPath, params));
  };

  const removeSyncEntry = async (
    id: string,
  ) => {
    setSyncEntries((prev) => atomicRemoveEntry(prev, id));
  };

  //////////////////////////////////////////// 
  //            Upload Functions
  ////////////////////////////////////////////
  
  const uploadVideo = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Video Upload Start: ', entry.videoUploadResponse);
    setSyncResult(`Video Upload Start: ${entry.videoPath}`);
    entry.videoUploadStatus = 'uploading';

    try {
      const uploadResponse = await sendMedia(
        'video',
        [{
          path: entry.videoPath,
          params: entry.params,
        }],
        `${serverURL}/send/video`
      );

      entry.videoUploadResponse = uploadResponse[0].data;
      console.log('Video Upload Response: ', entry.videoUploadResponse);
      setSyncResult(`Video Upload Response: ${entry.videoUploadResponse}`);

      if (entry.videoUploadResponse?.status === "success") {
        entry.videoUploadStatus = 'uploaded';
        console.log('Video Upload Successful!');
      }
    } catch (error) {
      console.error('Sync error for video upload:', entry.videoPath, error);
      setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
      entry.videoUploadStatus = 'failed';
    }
  };

  const uploadParams = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Param Upload Start: ', entry.videoPath);
    setSyncResult(`Param Upload Start: ${entry.videoPath}`);
    entry.paramUploadStatus = 'uploading';

    try {
      const uploadResponse = await sendParams(
        [{
          path: entry.videoPath,
          params: entry.params,
        }],
        `${serverURL}/send/params`
      );

      entry.paramUploadResponse = uploadResponse[0].data;
      
      console.log('Param Upload Response: ', entry.paramUploadResponse);
      setSyncResult(`Param Upload Response: ${entry.paramUploadResponse}`);

      if (entry.paramUploadResponse?.status === "success") {
        entry.paramUploadStatus = 'uploaded';
        console.log('Param Upload Successful!');
      }
    } catch (error) {
      console.error('Sync error for param upload:', entry.videoPath, error);
      setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
      entry.paramUploadStatus = 'failed';
    }
  };

  const syncUploads = async (
    serverURL: string, 
    entries: SyncEntry[], 
    setSyncResult: (message: string) => void
  ) => {
    let updatedEntries = [...entries];

    for (const entry of updatedEntries) {      

      const videoAttached = entry.videoUploadStatus === 'uploaded';
      const paramsAttached = entry.paramUploadStatus === 'uploaded';

      if (videoAttached && paramsAttached) {
        console.log('Skipping Upload: ', entry.id);
        setSyncResult(`Upload Response: skipping ${entry.id}`);
        continue;
      }

      if (!videoAttached) {
        uploadVideo(serverURL, entry, setSyncResult);
        setSyncEntries(updatedEntries);
      }

      if (!paramsAttached) {
        uploadParams(serverURL, entry, setSyncResult);
        setSyncEntries(updatedEntries);
      }
    }

    return updatedEntries;
  };
  
  //////////////////////////////////////////// 
  //            Inference Functions
  ////////////////////////////////////////////


  const inferenceVideo = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Video Inference Start: ', entry.videoPath);
    setSyncResult(`Video Inference Start: ${entry.videoPath}`);
    entry.videoInferenceStatus = 'running';

    try {
      const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
      const inferenceResponse = await fetch(`${serverURL}/inference/video/${fileNameWithoutExtension}`);
      const inferenceJson = await inferenceResponse.json();     

      entry.videoInferenceResponse = inferenceJson;
      console.log('Video Inference Response: ', entry.videoInferenceResponse);
      setSyncResult(`Video Inference Response: ${JSON.stringify(inferenceJson)}`);

      if (entry.videoInferenceResponse?.status === "success") {
        entry.videoInferenceStatus = 'completed';
        console.log('Video Inference Successful!');
      }
    } catch (error) {
      console.error('Sync error for video inference:', entry.videoPath, error);
      setSyncResult(`Inference Failed: ${entry.id} => ${error.message}`);
      entry.videoInferenceStatus = 'failed';
    }
  };

  const inferenceParams = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Param Inference Start: ', entry.videoPath);
    setSyncResult(`Param Inference Start: ${entry.videoPath}`);
    entry.paramInferenceStatus = 'running';

    try {
      const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
      const inferenceResponse = await fetch(`${serverURL}/inference/params/${fileNameWithoutExtension}`);
      const inferenceJson = await inferenceResponse.json();     

      entry.paramInferenceResponse = inferenceJson;
      console.log('Param Inference Response: ', entry.paramInferenceResponse);
      setSyncResult(`Param Inference Response: ${JSON.stringify(inferenceJson)}`);

      if (entry.paramInferenceResponse?.status === "success") {
        entry.paramInferenceStatus = 'completed';
        console.log('Param Inference Successful!');
      }
    } catch (error) {
      console.error('Sync error for param inference:', entry.videoPath, error);
      setSyncResult(`Inference Failed: ${entry.id} => ${error.message}`);
      entry.paramInferenceStatus = 'failed';
    }
  };

  const syncInference = async (
    serverURL: string,
    entries: SyncEntry[], 
    setSyncResult: (message: string) => void
  ) => {
    let updatedEntries = [...entries];

    for (const entry of updatedEntries) {
      
      const videoAttached = entry.videoUploadStatus === 'uploaded';
      const paramAttached = entry.paramUploadStatus === 'uploaded';
      if (!videoAttached || !paramAttached) {
        console.log(`Warning: skipping ${entry.id}, video or params not uploaded`);
        setSyncResult(`Warning: skipping ${entry.id}, video or params not uploaded`);
      }

      const videoResults = entry.videoInferenceStatus === 'completed';
      const paramResults = entry.paramInferenceStatus === 'completed';
      
      if (videoResults && paramResults) {
        console.log('Skipping Inference: ', entry.id);
        setSyncResult(`Inference Response: skipping ${entry.id}`);
        continue;
      }
    
      if (!videoResults) {
        inferenceVideo(serverURL, entry, setSyncResult);
        setSyncEntries(updatedEntries);
      }

      if (!paramResults) {
        inferenceParams(serverURL, entry, setSyncResult);
        setSyncEntries(updatedEntries);
      }
    }
      
    return updatedEntries;
  };

  //////////////////////////////////////////// 
  //            Sync All
  ////////////////////////////////////////////
  
  const syncAllPending = async (
    serverURL: string,
    mediaItems: {path: string; params?: Record<string, any>}[], 
    setSyncResult: (message: string) => void
  ) => {
    let updatedEntries = ([...(syncEntries || [])]).filter(Boolean);
  
    setSyncResult('Pre-loading sync entries...');
    // Step 1: Remove deprecated entries
    console.log('== Removing Deprecated Sync Entries ==');
    updatedEntries = atomicRemoveDeprecatedEntries(updatedEntries, mediaItems);

    // Step 2: Create new entries
    console.log('== Creating or Updating Sync Entries ==');
    for (const item of mediaItems) {
      const id = item.path.split('/').pop();
      const existingEntry = syncEntries.find((entry) => entry.id === id);

      if (!existingEntry) {
        updatedEntries = atomicAddEntry(updatedEntries, item.path, item.params || {});
        console.log(`Added new sync entry: ${id}`);
      } else {
        updatedEntries = atomicUpdateEntry(
          updatedEntries,
          id, 
          {
            videoPath: item.path,
            params: item.params,
          }
        );
        console.log(`Updated sync entry: ${id}`);
      }
    }
    setSyncEntries(updatedEntries);
    console.log(updatedEntries);

    if (updatedEntries.length === 0) {
      setSyncResult("No videos attached to annotations.");
      setTimeout(() => setSyncResult(null), 3000);
      return;
    }

    setSyncResult("Starting Upload...");

    // Step 3: Upload videos
    console.log('== Start Video Upload ==');
    updatedEntries = await syncUploads(serverURL, updatedEntries, setSyncResult);
    console.log('== End Video Upload ==');
    
    setSyncResult("Upload Successful! Running Inference...");
    
    // Step 4: Run inference
    console.log('== Start Video Inference ==');
    updatedEntries = await syncInference(serverURL, updatedEntries, setSyncResult);
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