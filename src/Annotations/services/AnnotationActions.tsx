// AnnotationsActions.tsx
import { server } from '../../../metro.config';
import { useSync } from '../../Sync/context/SyncContext';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';
import { useManifestSync } from '../../Sync/context/ManifestSyncContext';
import { FieldAnnotation, LeafAnnotation, PlantAnnotation } from '../../types/AnnotationTypes';

import { DevServerConfig } from '../../DevConsole/configs/DevServerConfig';

const useHandleSync = () => {
  const { syncAllPending } = useSync();
  const { syncAllManifest } = useManifestSync();
  
  const handleSync = async (
    fieldAnnotations: FieldAnnotation[],
    plantAnnotations: PlantAnnotation[],
    leafAnnotations: LeafAnnotation[],
    setSyncResult: (message: string) => void
  ) => {

    let serverURL = DevServerConfig.getBaseURL(); 

    const entriesToSend = leafAnnotations
    .filter((leaf) =>
      leaf.video &&
      isLeafDetailsValid(leaf.length, leaf.leafNumber, leaf.leafWidths)
    )
    .map((leaf) => ({
      path: leaf.video,
      params: {
        length: leaf.length,
        leafNumber: leaf.leafNumber,
        leafWidths: leaf.leafWidths
      }
    }));
   
    // Run Sync Inference
    try {
      await syncAllPending(serverURL, entriesToSend, setSyncResult);
    } catch (error: any) {
      console.error('Inference Sync error:', error);
      setSyncResult("Inference Sync Failed: " + error.message);
      setTimeout(() => setSyncResult(null), 3000);
    }

    // Run Sync Manifests
    try {
      await syncAllManifest(serverURL, fieldAnnotations, plantAnnotations, leafAnnotations);
    } catch (error: any) {
      console.error("Manifest Sync error:", error);
      setSyncResult("Manifest Sync Failed: " + error.message);
      setTimeout(() => setSyncResult(null), 3000);
    }
  };
  
  return { handleSync };
}

export default useHandleSync;