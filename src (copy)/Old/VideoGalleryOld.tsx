// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { getVideosFromSnapmedia } from '../native/MediaStoreBridge';
import Video from 'react-native-video';

interface VideoGalleryProps {
  visible: boolean;
  onVideoSelect: (videoPath: string) => void;
  onClose: () => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ visible, onVideoSelect, onClose }) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Fetch videos from MediaStore when the modal is opened
  useEffect(() => {
    if (visible) {
      getVideosFromSnapmedia(
        (videoPaths: any) => {
          setVideos(videoPaths);
        },
        (error: string) => {
          console.error('Error fetching videos:', error);
        }
      );
    }
  }, [visible]);

  const handleVideoSelect = (videoPath: string) => {
    setSelectedVideo(videoPath);
    onVideoSelect(videoPath); // Pass selected video path to parent component
    onClose(); // Close gallery modal
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
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalHeader}>Select Video</Text>
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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

