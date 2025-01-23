// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { RouteProp } from '@react-navigation/native';

interface VideoGalleryProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ route, navigation }) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Fetch videos from app's local storage directory when the modal is opened
  useEffect(() => {
    const videosDirectory = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;

    RNFS.readDir(videosDirectory)
      .then((files) => {
        const videoPaths = files
          .filter((file) => file.isFile() && file.name.endsWith('.mp4'))
          .map((file) => file.path);

        setVideos(videoPaths);
      })
      .catch((error) => {
        console.error('Error reading videos directory:', error);
      });
  }, []);

  // Handles callback to Annotations screen
  const handleVideoSelect = (videoPath: string) => {
    console.log('Video selected:', videoPath)
    navigation.navigate('Annotations', { selectedVideo: videoPath});
  };

  // Renders video item
  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.videoItem}>
        <Video source={{ uri: item }} style={styles.videoPreview} paused={true} controls />
        <TouchableOpacity onPress={() => handleVideoSelect(item)} style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select Video</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
  }, [route.params?.selectedVideo]);

  // Displays a list of selectable videos and offers the ability to record a new one
  return (
    <View style={styles.modalContent}>
      
      {/* Selectable Video List */}
      <Text style={styles.modalHeader}>Select Video</Text>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      
      {/* Open Camera Button */}
      <TouchableOpacity onPress={() => navigation.navigate('CameraScreen')} style={styles.openCameraButton}>
        <Text style={styles.openCameraButtonText}>Open Camera</Text>
      </TouchableOpacity>
      
      {/* Close Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  
  // Modal styles
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  // Video styles
  videoItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  
  // Select Button styles
  selectButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  selectButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  
  // Open Camera Button styles
  openCameraButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openCameraButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  
  // Close Button styles
  closeButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default VideoGallery;

