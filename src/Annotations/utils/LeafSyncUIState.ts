import { SyncEntry } from '../../types/SyncTypes';
import { LeafAnnotation } from '../../types/AnnotationTypes';
import { isLeafAnnotationComplete } from './AnnotationValidation';

export type LeafSyncUIState =
  | 'incomplete'
  | 'ready'
  | 'uploading'
  | 'inferring'
  | 'completed'
  | 'upload_failed'
  | 'inference_failed';

export function getLeafSyncUIState(annotation: LeafAnnotation, entry?: SyncEntry): LeafSyncUIState {
  // Incomplete (cannot sync)
  if (!isLeafAnnotationComplete(annotation)) {
    return 'incomplete';
  }

  if (!entry) return 'ready';

  // Upload failure
  if (
    entry.videoUploadStatus === 'failed' ||
    entry.paramUploadStatus === 'failed'
  ) {
    return 'upload_failed';
  }

  // Inference failure
  if (entry.inferenceStatus === 'failed') {
    return 'inference_failed';
  }

  // Completed
  if (entry.inferenceStatus === 'completed') {
    return 'completed';
  }

  // Uploading
  if (
    entry.videoUploadStatus === 'uploading' ||
    entry.paramUploadStatus === 'uploading'
  ) {
    return 'uploading';
  }

  // Inferring
  if (
    entry.videoUploadStatus === 'uploaded' &&
    entry.paramUploadStatus === 'uploaded'
  ) {
    return 'inferring';
  }

  // Ready but idle
  return 'ready';
}


export const LeafSyncUIConfig: Record<
  LeafSyncUIState,
  {
    icon?: string;
    color: string;
    label: string;
    showResults: boolean;
  }
> = {
  incomplete: {
    icon: 'warning',
    color: '#999',
    label: 'Missing required data',
    showResults: false,
  },

  ready: {
    icon: 'circle',
    color: 'orange',
    label: 'Ready to sync',
    showResults: false,
  },

  uploading: {
    icon: 'cloud-upload',
    color: 'dodgerblue',
    label: 'Uploading data…',
    showResults: false,
  },

  inferring: {
    icon: 'sync',
    color: 'dodgerblue',
    label: 'Running model inference…',
    showResults: false,
  },

  completed: {
    color: 'green',
    label: 'Analysis complete',
    showResults: true,
  },

  upload_failed: {
    icon: 'close',
    color: 'red',
    label: 'Upload failed, resync to reupload',
    showResults: false,
  },

  inference_failed: {
    icon: 'close',
    color: 'red',
    label: 'Inference failed, resync to rerun',
    showResults: false,
  },
};
