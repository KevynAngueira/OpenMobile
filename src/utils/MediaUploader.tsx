// MediaUploader.tsx
interface MediaUploadItem {
  path: String;
  params?: object;
}

export const sendMedia = async (type: 'image' | 'video', mediaItems: MediaUploadItem[], endpoint: string) => {
  const responses = []; // Array to store responses

  for (const item of mediaItems) {
    const { path, params ={} } = item;
    const fileName = path.split('/').pop(); // Extract file name
    const formData = new FormData();
   
    formData.append(type, {
      uri: `file://${path}`,
      name: fileName,
      type: type === 'image' ? 'image/jpeg' : 'video/mp4',
    });

    formData.append('params', JSON.stringify(params));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      console.log(`${type} upload response:`, result);

      responses.push({ path, success: true, data: result });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      responses.push({ path, success: false, error });
    }
  }

  return responses;
};

