// CameraScreen.tsx
import React, { useRef, useState } from 'react';
import { Text, StyleSheet, View, Button, Modal, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import CircleTimer from './CircleTimer';

const CameraScreen = ({ navigation }) => {
  // Video and Recording
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  // Select, Save, and Discard Modal
  const [modalVisible, setModalVisible] = useState(false);
  //Camera and Device
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices?.find((d) => d.position === 'back');

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      const photoUri = photo.path; 

      // Save the image to the "snapmedia/images" directory
      const savedImagePath = await saveImage(photoUri);
      console.log('Photo saved to:', savedImagePath);
    }
  };

  // Records a 10second or less video, then prompts user to select, save, or discard the video
  const recordVideo = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };
  
  const startRecording = async() => {
    if(camera.current) {
      stopRecording()
      setIsRecording(true);
      const video = await camera.current.startRecording({
        onRecordingFinished: async (video) => {
          const videoUri = video.path; 
          setVideoUri(videoUri); 
          setIsRecording(false);
          setModalVisible(true);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
        },
      });
    }
  };
  
  const stopRecording = async() => {
    if (camera.current) {
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
      const savedPath = await saveVideo(videoUri);
      console.log('Video selected from Camera:', savedPath)
      navigation.navigate('VideoGallery', { selectedVideo: savedPath }); 
    }
    setModalVisible(false);  // Close the modal after selection
  };

  const handleSaveVideo = async () => {
    // Save the video for later and continue recording
    if (videoUri) {
      const savedPath = await saveVideo(videoUri);
      console.log('Video saved for later:', savedPath);
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
        <Button title={isRecording ? 'Stop Recording' : 'Record Video'} onPress={recordVideo} />
      </View>

      {/* Circle Countdown */}
      {true && (
        <CircleTimer
          duration={10}
          isRecording={isRecording}
          onFinish = {stopRecording}
        />
      )}

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
            <TouchableOpacity style={styles.discardModalButton} onPress={handleDiscardVideo}>
              <Text style={styles.discardModalButtonText}>Discard</Text>
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
  discardModalButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  discardModalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default CameraScreen;

