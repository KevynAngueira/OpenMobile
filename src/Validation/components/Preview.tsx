import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, ScrollView } from 'react-native';
import { loadVideoFrames } from '../../native/OpenCVBridge';

type FrameData = {
  image: string;
  error: number;
};

export default function VideoPreview({ videoPath }: { videoPath: string }) {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadVideoFrames(videoPath)
      .then((res) => {
        // res is now an array of objects { image, error }
        setFrames(res as FrameData[]);
        setIndex(0);
      })
      .catch(console.error);
  }, [videoPath]);

  if (frames.length === 0) {
    return <Text>Loading frames...</Text>;
  }

  const frame = frames[index];

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <Image
        source={{ uri: frame.image }}
        style={{ width: 300, height: 200, marginBottom: 10 }}
        resizeMode="contain"
      />
      <Text style={{ marginBottom: 10 }}>Reconstruction Error: {frame.error.toFixed(4)}</Text>
      <Button
        title={`Next Frame (${index + 1}/${frames.length})`}
        onPress={() => setIndex((prev) => (prev + 1) % frames.length)}
      />
    </View>
  );
}
