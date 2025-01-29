// AnnotationActions.tsx
import { sendMedia } from '../../utils/MediaUploader';
import { HUB_BASE_URL } from '../../constants/Config';

export const handleSendAnnotationsVideos = async (
  annotations: any[],
  setSyncResult: (message: string) => void
) => {

  const videosToSend: string[] = annotations
      .map((annotation) => annotation.video)
      .filter((video) => video !== null && video !== undefined);

  if (videosToSend.length === 0) {
    setSyncResult("No videos attached to annotations.");
    return;
  }

  try {
    
    // Step 1: Send the videos
    console.log('== Start Video Upload ==');
    for (const videoPath of videosToSend) {
      const uploadResponse = await sendMedia('video', [videoPath], `${HUB_BASE_URL}upload.py`);
      setSyncResult(`Video Upload Response: ${JSON.stringify(uploadResponse[0].data)}`);
    }
    console.log('== End Video Upload ==');
    setSyncResult("Upload Successful! Running Inference...");
    setTimeout(() => setSyncResult(null), 3000);
    
    // Step 2: Run Inference
    console.log('== Start Video Inference ==');
    for (const videoPath of videosToSend) {
      const fileName = videoPath.split('/').pop();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');
      const fileNameWithoutExtension = sanitizedFileName.replace(/\.[^/.]+$/, "");
      
      const inferenceResponse = await fetch(`${HUB_BASE_URL}/inferenceVid.py?p1=${fileNameWithoutExtension}&p2=json`);
      const inferenceJson = await inferenceResponse.json();
      setSyncResult(`Inference Response: ${JSON.stringify(inferenceJson)}`);
      console.log('Inference Response:', inferenceJson);
    }
    console.log('== End Video Inference ==');
    setSyncResult("Sync Successful!");
    setTimeout(() => setSyncResult(null), 3000);
    
      /*
      // Log success or failure
      await logSyncResult(videoPath, 'success', uploadResponse, inferenceJson);
      */
  } catch (error) {
    setSyncResult("Sync Failed: " + error.message);
    console.error('Sync error:', error);
  }
};
