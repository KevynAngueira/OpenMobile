// MediaUploader.tsx
interface MediaUploadItem {
  path: String;
  params?: Record<string, any>;
}

type uploadType = 'image' | 'video';

export const sendMedia = async (
  type: uploadType,
  mediaItems: MediaUploadItem[],
  endpoint: string
) => {

  const responses: {path: string; success: boolean; data?: any; error?: any}[] = [];

  for (const item of mediaItems) {
    const { path, params ={} } = item;
    const fileName = path.split('/').pop(); 

    try {
      let response;
       
      const formData = new FormData();
      formData.append(type, {
        uri: `file://${path}`,
        name: fileName,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
      });

      if (Object.keys(params).length > 0) {
        formData.append('params', JSON.stringify(params));
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      //console.log(`${type} upload response:`, result);
      responses.push({ path, success: true, data: result });
   
    } catch (error) {
      console.error(`❌ Error uploading ${type}:`, error);
      responses.push({ path, success: false, error });
    }
  }

  return responses;
};

export const sendParams = async (
  mediaItems: MediaUploadItem[],
  endpoint: string
) => {
 
  const responses: {path: string; success: boolean; data?: any; error?: any}[] = [];

  for (const item of mediaItems) {
    const { path, params ={} } = item;
    const fileName = path.split('/').pop(); 

    try {
      let response;

      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          params: params,
        }),
      });

      const result = await response.json();
      //console.log('Param upload response:', result);
      responses.push({ path, success: true, data: result });

    } catch (error) {
      console.error('❌ Error uploading params:', error);
      responses.push({ path, success: false, error });
    }
  }

  return responses;
};