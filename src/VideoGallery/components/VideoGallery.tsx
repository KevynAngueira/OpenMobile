// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';  // Import RNFS to access local files
import { RouteProp } from '@react-navigation/native';  // Import RouteProp for route parameters

interface VideoGalleryProps {
  route: RouteProp<any, any>;  // Get route parameters
  navigation: any;  // Navigation prop
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ route, navigation }) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Fetch videos from app's local storage directory when the modal is opened
  useEffect(() => {
    const videosDirectory = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;

    // Read the files from the 'videos' directory
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

  const handleVideoSelect = (videoPath: string) => {
    route.params?.onVideoSelect?.(videoPath);
    navigation.goBack();
  };

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

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select Video</Text>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

