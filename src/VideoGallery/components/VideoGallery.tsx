// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { RouteProp } from '@react-navigation/native';

interface VideoGalleryProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ route, navigation }) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [hoveredDelete, setHoveredDelete] = useState<string | null>(null);
  const [deleteAllHovered, setDeleteAllHovered] = useState(false);

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
    console.log('Video selected:', videoPath);
    navigation.navigate('Annotations', { selectedVideo: videoPath });
  };

  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
  }, [route.params?.selectedVideo]);

  // Handle delete video
  const handleDeleteVideo = (videoPath: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            RNFS.unlink(videoPath)
              .then(() => {
                setVideos((prevVideos) => prevVideos.filter((video) => video !== videoPath));
                console.log('Video deleted:', videoPath);
              })
              .catch((error) => {
                console.error('Error deleting video:', error);
              });
          },
        },
      ]
    );
  };

  // Handle delete all videos
  const handleDeleteAllVideos = () => {
    Alert.alert(
      'Delete All Videos',
      'Are you sure you want to delete all videos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            Promise.all(videos.map((videoPath) => RNFS.unlink(videoPath)))
              .then(() => {
                setVideos([]);
                console.log('All videos deleted');
              })
              .catch((error) => {
                console.error('Error deleting all videos:', error);
              });
          },
        },
      ]
    );
  };

  // Renders video item
  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.videoItem}>
        <Video source={{ uri: item }} style={styles.videoPreview} paused={true} controls />

        {/* Delete Button */}
        <TouchableOpacity
          onPressIn={() => setHoveredDelete(item)}
          onPressOut={() => setHoveredDelete(null)}
          onPress={() => handleDeleteVideo(item)}
          style={[
            styles.deleteButton,
            hoveredDelete === item && styles.deleteButtonHovered,
          ]}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>

        {/* Select Button */}
        <TouchableOpacity
          onPress={() => handleVideoSelect(item)}
          style={styles.selectButton}
        >
          <Text style={styles.selectButtonText}>Select Video</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Displays a list of selectable videos and offers the ability to record a new one
  return (
    <View style={styles.modalContent}>
      {/* Header with Select Video and Delete All */}
      <View style={styles.headerRow}>
        <Text style={styles.modalHeader}>Select Video</Text>
        <TouchableOpacity
          onPressIn={() => setDeleteAllHovered(true)}
          onPressOut={() => setDeleteAllHovered(false)}
          onPress={handleDeleteAllVideos}
          style={[
            styles.deleteAllButton,
            deleteAllHovered && styles.deleteAllButtonHovered,
          ]}
        >
          <Text style={styles.deleteAllButtonText}>Delete All</Text>
        </TouchableOpacity>
      </View>

      {/* Selectable Video List */}
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Open Camera Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CameraScreen')}
        style={styles.openCameraButton}
      >
        <Text style={styles.openCameraButtonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Close Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
      >
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

  // Header Row styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Video styles
  videoItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  
  // Delete All Button
  deleteAllButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
  },
  deleteAllButtonHovered: {
    backgroundColor: 'red',
  },
  deleteAllButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },

  // Delete Button styles
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonHovered: {
    backgroundColor: 'red',
  },
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
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

