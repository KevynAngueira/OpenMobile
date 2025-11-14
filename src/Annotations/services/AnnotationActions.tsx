// AnnotationsActions.tsx
import { server } from '../../../metro.config';
import { useSync } from '../../Sync/context/SyncContext';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';

const useHandleSync = () => {
  const { syncAllPending } = useSync();
  
  const handleSync = async (
    serverURL: string,
    leafAnnotations: any[],
    setSyncResult: (message: string) => void
  ) => {

    //console.log('Inside handleSendAnnotationsVideos'); // Debug log
    if (!serverURL) {
      setSyncResult("⚠️ Configure server IP & port first");
      return;
    }

    const entriesToSend = leafAnnotations
      .filter((leafAnnotation) => {
        const validVideo = leafAnnotation.video;
        const validLeaf = isLeafDetailsValid(leafAnnotation.length, leafAnnotation.leafNumber, leafAnnotation.leafWidths);
        return validVideo && validLeaf
      })
      .map((leafAnnotation) => ({
        path: leafAnnotation.video,
        params: {
          length: leafAnnotation.length,
          leafNumber: leafAnnotation.leafNumber,
          leafWidths: leafAnnotation.leafWidths
        }
      }));
   
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

