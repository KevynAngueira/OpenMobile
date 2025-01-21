// AnnotationActions.tsx
import { sendMedia } from '../../utils/MediaUploader';

export const handleSync = async (FLASK_URL: string, setSyncResult: (message: string) => void) => {
  try {
    const response = await fetch(`${FLASK_URL}/test`);
    const data = await response.json();
    setSyncResult(`Sync Successful: ${JSON.stringify(data)}`);
    setTimeout(() => setSyncResult(null), 3000);
  } catch (error) {
    setSyncResult("Sync Failed: Unable to connect to the server.");
    setTimeout(() => setSyncResult(null), 3000);
  }
};

export const handleSendAnnotationsVideos = async (
  annotations: any[],
  endpoint: string,
  setSyncResult: (message: string) => void
) => {
  const videosToSend: string[] = annotations
      .map((annotation) => annotation.video) // Extract videos
      .filter((video) => video !== null && video !== undefined); // Remove null/undefined entries

  if (videosToSend.length === 0) {
    setSyncResult("No videos attached to annotations.");
    return;
  }

  try {
    const responses = await sendMedia('video', videosToSend, endpoint);
    setSyncResult(`Sync Successful: ${JSON.stringify(responses)}`);
    setTimeout(() => setSyncResult(null), 3000);
    
  } catch (error) {
    setSyncResult("Sync Failed: Unable to connect to the server.");
    setTimeout(() => setSyncResult(null), 3000);
  }
};

