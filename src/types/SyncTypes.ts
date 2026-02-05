// types/SyncTypes.ts
export interface SyncEntry {
  id: string;
  videoPath: string;
  params?: Record<string, any>;

  videoUploadStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  paramUploadStatus: 'new' | 'uploading' | 'uploaded' | 'failed';
  videoUploadResponse?: any;
  paramUploadResponse?: any;
  
  inferenceStatus: 'new' | 'waiting' | 'running' | 'completed' | 'failed';  
  inferenceResponse?: any;
}