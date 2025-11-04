// AnnotationsActions.tsx
import { server } from '../../../metro.config';
import { useSync } from '../../Sync/context/SyncContext';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';

const useHandleSync = () => {
  const { syncAllPending } = useSync();
  
  const handleSync = async (
    serverURL: string,
    annotations: any[],
    setSyncResult: (message: string) => void
  ) => {

    //console.log('Inside handleSendAnnotationsVideos'); // Debug log
    if (!serverURL) {
      setSyncResult("⚠️ Configure server IP & port first");
      return;
    }

    const entriesToSend = annotations
      .filter((annotation) => {
        const validVideo = annotation.video;
        const validLeaf = isLeafDetailsValid(annotation.length, annotation.leafNumber, annotation.leafWidths);
        return validVideo && validLeaf
      })
      .map((annotation) => ({
        path: annotation.video,
        params: {
          length: annotation.length,
          leafNumber: annotation.leafNumber,
          leafWidths: annotation.leafWidths
        }
      }));
    
    if (entriesToSend.length === 0) {
      setSyncResult("No videos attached to annotations.");
      setTimeout(() => setSyncResult(null), 3000);
      return;
    }
   
    // Run sync process
    try {
      await syncAllPending(serverURL, entriesToSend, setSyncResult);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult("Sync Failed: " + error.message);
      setTimeout(() => setSyncResult(null), 3000);
    }
  };
  
  return { handleSync };
}

export default useHandleSync;

