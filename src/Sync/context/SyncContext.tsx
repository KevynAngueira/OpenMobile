// SyncContext.tsx
import _ from 'lodash';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sendMedia, sendParams } from '../../utils/MediaUploader';
import { SyncEntry } from '../../types/SyncTypes';
import { server } from '../../../metro.config';
import { read } from 'react-native-fs';

interface SyncContextType {
  syncEntries: SyncEntry[];
  addSyncEntry: (videoPath: string) => Promise<void>;
  updateSyncEntry: (id: string, updates: Partial<SyncEntry>) => void;
  removeSyncEntry: (id: string) => Promise<void>;
  removeAllSyncEntry: () => Promise<void>;
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
  ): {allEntries: SyncEntry[], newEntry: SyncEntry| null} {
    
    const id = videoPath.split('/').pop();
    if (!id) return {allEntries: entries, newEntry: null};
    if (entries.some((entry) => entry.id === id)) return {allEntries: entries, newEntry: null}; // Avoid duplicates
  
    const newEntry: SyncEntry = {
      id,
      videoPath,
      params,
      videoUploadStatus: 'new',
      paramUploadStatus: 'new',
      inferenceStatus: 'new',
    };

    const allEntries = [...entries, newEntry];
    return {allEntries, newEntry};
  }

  function atomicUpdateEntry(
    entries: SyncEntry[],
    id: string,
    updates: Partial<SyncEntry>
  ): {allEntries: SyncEntry[], updatedEntry: SyncEntry | null, changed: Boolean} {
    
    let changed = false;
    let updatedEntry = null;
    
    const allEntries = entries.map((entry) => {
      if (entry.id !== id) return entry;
  
      let newEntry = { ...entry, ...updates };
      updatedEntry = newEntry;
  
      // If videoPath changed
      if (updates.videoPath && updates.videoPath !== entry.videoPath) {
        changed = true;
        newEntry.id = updates.videoPath.split('/').pop() || entry.id;
        newEntry.videoUploadStatus = 'new';
        newEntry.videoUploadResponse = undefined;
        newEntry.inferenceStatus = 'new';
        newEntry.inferenceResponse = undefined;
      }
  
      // If params changed
      if (updates.params && !_.isEqual(updates.params, entry.params)) {
        changed = true;
        newEntry.paramUploadStatus = 'new';
        newEntry.paramUploadResponse = undefined;
        newEntry.inferenceStatus = 'new';
        newEntry.inferenceResponse = undefined;
      }
  
      return newEntry;
    });

    return {allEntries, updatedEntry, changed};
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
    setSyncEntries((prev) => atomicAddEntry(prev, videoPath, params).allEntries);
  };
  
  const updateSyncEntry = async (
    videoPath: string,
    params: Record<string, any>
  ) => {
    setSyncEntries((prev) => atomicUpdateEntry(prev, videoPath, params).allEntries);
  };

  const removeSyncEntry = async (
    id: string,
  ) => {
    setSyncEntries((prev) => atomicRemoveEntry(prev, id));
  };

  const removeAllSyncEntry = async () => {
    setSyncEntries([]);
  };


  //////////////////////////////////////////// 
  //            Upload Functions
  ////////////////////////////////////////////

  function updateEntryById(
    entries: SyncEntry[],
    updatedEntry: SyncEntry
  ): SyncEntry[] {
    return entries.map(e => (e.id === updatedEntry.id ? updatedEntry : e));
  }  

  //////////////////////////////////////////// 
  //            Helper Functions
  ////////////////////////////////////////////
  
  const uploadVideo = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Video Upload Start: ', entry.videoPath);
    setSyncResult(`Video Upload Start: ${entry.videoPath}`);
    setTimeout(() => setSyncResult(null), 3000);
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
      setTimeout(() => setSyncResult(null), 3000);

      if (entry.videoUploadResponse?.status === "success") {
        entry.videoUploadStatus = 'uploaded';
        console.log('Video Upload Successful!');
      }
    } catch (error) {
      console.error('Sync error for video upload:', entry.videoPath, error);
      setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
      setTimeout(() => setSyncResult(null), 3000);
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
    setTimeout(() => setSyncResult(null), 3000);
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
      setTimeout(() => setSyncResult(null), 3000);

      if (entry.paramUploadResponse?.status === "success") {
        entry.paramUploadStatus = 'uploaded';
        console.log('Param Upload Successful!');
      }
    } catch (error) {
      console.error('Sync error for param upload:', entry.videoPath, error);
      setSyncResult(`Upload Failed: ${entry.id} => ${error.message}`);
      setTimeout(() => setSyncResult(null), 3000);
      entry.paramUploadStatus = 'failed';
    }
  };

  const syncUploads = async (
    serverURL: string, 
    entries: SyncEntry[], 
    toUploadIds: Set<string>,
    setSyncResult: (message: string) => void
  ) => {
    let updatedEntries = [...entries];

    for (const entry of entries) {
      if (!toUploadIds.has(entry.id)) continue;
      
      const videoAttached = entry.videoUploadStatus === 'uploaded';
      const paramsAttached = entry.paramUploadStatus === 'uploaded';

      if (videoAttached && paramsAttached) {
        console.warn(`Warning: Skipping upload: ${entry.id}`);
        setSyncResult(`Warning: skipping upload ${entry.id}, video and params previously uploaded`);
        setTimeout(() => setSyncResult(null), 3000);
        continue;
      }

      let updated = { ...entry };

      if (!videoAttached) {
        uploadVideo(serverURL, updated, setSyncResult);
        updated.videoUploadStatus = 'uploading';
      }

      if (!paramsAttached) {
        uploadParams(serverURL, updated, setSyncResult);
        updated.paramUploadStatus = 'uploading';
      }

      updatedEntries = updateEntryById(updatedEntries, updated);
      setSyncEntries(updatedEntries);
    }

    return updatedEntries;
  };
    
  //////////////////////////////////////////// 
  //            Inference Functions
  ////////////////////////////////////////////

  const inference = async (
    serverURL: string, 
    entry: SyncEntry, 
    setSyncResult: (message: string) => void
  ) => {
    console.log('Inference Start: ', entry.videoPath);
    setSyncResult(`Inference Start: ${entry.videoPath}`);
    setTimeout(() => setSyncResult(null), 3000);
    entry.inferenceStatus = 'running';
    
    try {
      const fileNameWithoutExtension = entry.id.replace(/\.[^/.]+$/, '');
      const inferenceResponse = await fetch(`${serverURL}/inference/${fileNameWithoutExtension}`);
      const inferenceJson = await inferenceResponse.json();     

      entry.inferenceResponse = inferenceJson;
      console.log('Inference Response: ', entry.inferenceResponse);
      setSyncResult(`Inference Response: ${JSON.stringify(inferenceJson)}`);
      setTimeout(() => setSyncResult(null), 3000);

      if (inferenceJson.status === 'waiting' && inferenceJson.reupload) {
        const reupload = inferenceJson.reupload;
        const videoStillUploading = entry.videoUploadStatus == 'uploading';

        if (reupload.video && !videoStillUploading) {
          entry.videoUploadStatus = 'failed';
          entry.videoUploadResponse = undefined;
        }
        if (reupload.params) {
          entry.paramUploadStatus = 'failed';
          entry.paramUploadResponse = undefined;
        }  

        if (!videoStillUploading) {
          entry.inferenceStatus = 'waiting';
          setSyncResult(`⚠️ Waiting on dependencies. Marked failed uploads: ${JSON.stringify(reupload)}`);
          setTimeout(() => setSyncResult(null), 3000);
        }
      }

      if (entry.inferenceResponse?.status === "error") {
        entry.inferenceStatus = 'failed';
      }

      if (entry.inferenceResponse?.status === "completed") {
        entry.inferenceStatus = 'completed';
        console.log('Inference Successful!');
      }

    } catch (error) {
      console.error('Sync error for inference:', entry.videoPath, error);
      setSyncResult(`Inference Failed: ${entry.id} => ${error.message}`);
      setTimeout(() => setSyncResult(null), 3000);
      entry.inferenceStatus = 'failed';
    }
  };

  const syncInference = async (
    serverURL: string,
    entries: SyncEntry[], 
    toInferIds: Set<string>,
    setSyncResult: (message: string) => void
  ) => {

    let updatedEntries = [...entries];

    for (const entry of entries) {
      if (!toInferIds.has(entry.id)) continue;

      const ready = 
        entry.videoUploadStatus === 'uploaded' &&
        entry.paramUploadStatus === 'uploaded';

      if (!ready) {
        console.warn(`Warning: Skipping inference: ${entry.id}`);
        setSyncResult(`Warning: skipping inference ${entry.id}, video or params not uploaded`);
        setTimeout(() => setSyncResult(null), 3000);
        continue;
      }

      inference(serverURL, entry, setSyncResult);

      updatedEntries = updateEntryById(updatedEntries, entry);
      setSyncEntries(updatedEntries);
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
    setTimeout(() => setSyncResult(null), 3000);

    // Step 1: Remove deprecated entries
    console.log('Removing Deprecated Sync Entries...');
    updatedEntries = atomicRemoveDeprecatedEntries(updatedEntries, mediaItems);

    // Step 2: Create new entries
    const uploadList = new Set<string>();
    const inferenceList = new Set<string>();

    console.log('Creating or Updating Sync Entries...');
    for (const item of mediaItems) {
      const id = item.path.split('/').pop();
      const existingEntry = syncEntries.find((entry) => entry.id === id);

      if (!existingEntry) {
        const {allEntries, newEntry} = atomicAddEntry(updatedEntries, item.path, item.params || {});
        updatedEntries = allEntries;
        if (newEntry) {
          uploadList.add(id)
          console.log(`NEW ENTRY ${id}`);
        };
        console.log(`Added new sync entry: ${id}`);
      } else {
        const {allEntries, updatedEntry, changed} = atomicUpdateEntry(
          updatedEntries,
          id, 
          {
            videoPath: item.path,
            params: item.params,
          }
        );
        
        updatedEntries = allEntries;
        if (updatedEntry){
          if (changed) {
            console.log(`UPDATED ENTRY ${id}`);
            uploadList.add(id);
          } else {
            console.log(`NO UPDATES ENTRY ${id}`);
            inferenceList.add(id);
          }
        }
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
    setTimeout(() => setSyncResult(null), 3000);

    // Step 3: Upload videos
    console.log('== Start Entry Upload ==');
    updatedEntries = await syncUploads(serverURL, updatedEntries, uploadList, setSyncResult);
    console.log('== End Entry Upload ==');
    
    setSyncResult("Upload Successful! Running Inference...");
    setTimeout(() => setSyncResult(null), 3000);
    
    // Step 4: Run inference
    console.log('== Start Entry Inference ==');
    updatedEntries = await syncInference(serverURL, updatedEntries, inferenceList, setSyncResult);
    console.log('== End Entry Inference ==');
    
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
        removeAllSyncEntry,
        syncAllPending,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};