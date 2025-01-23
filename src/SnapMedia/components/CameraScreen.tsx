// CameraScreen.tsx
import React, { useRef, useState } from 'react';
import { Text, StyleSheet, View, Button, Modal, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

const CameraScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);  // To show options after recording
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
          setVideoUri(videoUri); // Set the video URI for later options
          setIsRecording(false);
          setModalVisible(true); // Show modal with options
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

  const handleSelectVideo = async () => {
    // Pass the video URI to VideoGallery for selection
    if (videoUri) {
      await saveVideo(videoUri);
      console.log('Video selected from Camera:', videoUri)
      navigation.navigate('VideoGallery', { selectedVideo: videoUri }); 
    }
    setModalVisible(false);  // Close the modal after selection
  };

  const handleSaveVideo = async () => {
    // Save the video for later and continue recording
    if (videoUri) {
      await saveVideo(videoUri);
      console.log('Video saved for later:', videoUri);
    }
    setModalVisible(false);  // Close the modal after saving
  };

  const handleDiscardVideo = () => {
    // Discard the video and continue recording
    setVideoUri(null);
    setModalVisible(false);  // Close the modal after discard
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

      {/* Modal for options after video recording */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an option</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSelectVideo}>
              <Text style={styles.modalButtonText}>Select</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveVideo}>
              <Text style={styles.modalButtonText}>Save for Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDiscardVideo}>
              <Text style={styles.modalButtonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  closeModalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default CameraScreen;

