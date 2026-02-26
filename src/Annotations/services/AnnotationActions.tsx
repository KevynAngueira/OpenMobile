// AnnotationsActions.tsx
import { server } from '../../../metro.config';
import { useSync } from '../../Sync/context/SyncContext';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';
import { useManifestSync } from '../../Sync/context/ManifestSyncContext';
import { FieldAnnotation, LeafAnnotation, PlantAnnotation } from '../../types/AnnotationTypes';

import { DevServerConfig } from '../../DevConsole/configs/DevServerConfig';
import { DevFlags } from '../../DevConsole/configs/DevFlagsConfig';

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
      isLeafDetailsValid(leaf.length, leaf.leafNumber, leaf.leafWidths, leaf.directArea, leaf.maxLength, leaf.maxWidth)
    )
    .map((leaf) => {
      const params: any = {};

      params.length = leaf.length;
      params.leafNumber = leaf.leafNumber;
      params.leafWidths = leaf.leafWidths;

      if (DevFlags.isEnabled("altOriginalArea")){
        params.directArea = leaf.directArea;
        params.maxLength = leaf.maxLength;
        params.maxWidth = leaf.maxWidth;
      } else {
        params.directArea = "";
        params.maxLength = "";
        params.maxWidth = "";
      }

      return {
        path: leaf.video,
        params
      };
    });
   
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