// AnnotationsActions.tsx
import { useSync } from '../../Sync/context/SyncContext';

const useHandleSync = () => {
  const { syncAllPending } = useSync();
  
  const handleSync = async (
    annotations: any[],
    setSyncResult: (message: string) => void
  ) => {

    console.log('Inside handleSendAnnotationsVideos'); // Debug log
  
    const videosToSend: string[] = annotations
      .map((annotation) => annotation.video)
      .filter((video) => video !== null && video !== undefined);
  
    if (videosToSend.length === 0) {
      setSyncResult("No videos attached to annotations.");
      setTimeout(() => setSyncResult(null), 3000);
      return;
    }
   
    // Run sync process
    try {
      await syncAllPending(videosToSend, setSyncResult);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult("Sync Failed: " + error.message);
      setTimeout(() => setSyncResult(null), 3000);
    }
  };
  
  return { handleSync };
}

export default useHandleSync;

