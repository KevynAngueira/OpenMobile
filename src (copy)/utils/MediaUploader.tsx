export const sendMedia = async (type: 'image' | 'video', mediaList: string[], endpoint: string) => {
  const responses = []; // Array to store responses

  for (const mediaPath of mediaList) {
    const fileName = mediaPath.split('/').pop(); // Extract file name
    const formData = new FormData();
    formData.append(type, {
      uri: `file://${mediaPath}`,
      name: fileName,
      type: type === 'image' ? 'image/jpeg' : 'video/mp4',
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      console.log(`${type} upload response:`, result);

      responses.push({ mediaPath, success: true, data: result });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      responses.push({ mediaPath, success: false, error });
    }
  }

  return responses; // Return collected responses
};

