// CameraScreen.tsx
import React, { useRef, useState } from 'react';
import { Text, StyleSheet, View, Button } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

const CameraScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices?.find((d) => d.position === 'back');

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      const photoUri = photo.path;  // Get the photo URI

      // Save the image to the "snapmedia/images" directory
      const savedImagePath = await saveImage(photoUri);
      console.log('Photo saved to:', savedImagePath);
    }
  };

  const recordVideo = async () => {
    if (camera.current && !isRecording) {
      setIsRecording(true);
      const video = await camera.current.startRecording({
        onRecordingFinished: async (video) => {
          const videoUri = video.path;  // Get the video URI

          // Save the video to the "snapmedia/videos" directory
          const savedVideoPath = await saveVideo(videoUri);
          console.log('Video saved to:', savedVideoPath);

          setIsRecording(false);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
        },
      });
    } else if (isRecording) {
      await camera.current.stopRecording();
      setIsRecording(false);
    }
  };

  const saveImage = async (imageUri) => {
    try {
      const imagesDir = `${RNFS.ExternalDirectoryPath}/snapmedia/images`;
      const path = `${imagesDir}/image_${Date.now()}.jpg`;

      const dirExists = await RNFS.exists(imagesDir);
      if (!dirExists) {
        await RNFS.mkdir(imagesDir);
      }

      await RNFS.copyFile(imageUri, path);
      return path;
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const saveVideo = async (videoUri) => {
    try {
      const videosDir = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;
      const path = `${videosDir}/video_${Date.now()}.mp4`;

      const dirExists = await RNFS.exists(videosDir);
      if (!dirExists) {
        await RNFS.mkdir(videosDir);
      }

      await RNFS.copyFile(videoUri, path);
      return path;
    } catch (error) {
      console.error('Failed to save video:', error);
    }
  };

  return device ? (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        video={true}
        audio={false}
      />
      <View style={styles.controls}>
        <Button title="Take Photo" onPress={takePhoto} />
        <Button title={isRecording ? 'Stop Recording' : 'Record Video'} onPress={recordVideo} />
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Loading camera...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default CameraScreen;

