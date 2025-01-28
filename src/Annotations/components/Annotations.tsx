// Annotations.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation } from '@react-navigation/native'; 

import AnnotationList from './AnnotationList';
import AnnotationModal from './AnnotationModal';
import { useAnnotations } from '../context/AnnotationsContext';
import { handleSync, handleSendAnnotationsVideos } from '../services/AnnotationActions';
import { FLASK_URL, HUB_BASE_URL } from '../../constants/Config';

interface AnnotationsProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const Annotations: React.FC<AnnotationsProps> = ({ route, navigation }) =>  {
  const { annotations, setAnnotations, selectedAnnotation, setSelectedAnnotation } = useAnnotations();
  const [modalVisible, setModalVisible] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  navigation = useNavigation();

  // Creates an annotation
  const handleCreateAnnotation = (name: string, info: string) => {
    const newAnnotation = {
      id: Date.now(),
      name,
      info,
      video: null,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setModalVisible(false);
  };

  // Deletes an annotation
  const handleDeleteAnnotation = (id: number) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this annotation group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id)),
      },
    ]);
  };

  // Prompts you to attach a video from the VideoGallery screen
  const handleAttachVideo = (annotation: any) => {
    setSelectedAnnotation(annotation);
    navigation.navigate('VideoGallery')
  };
  
  // Upon video selection, attaches the video to the annotation
  const handleVideoSelect = (videoPath: string) => {
    setAnnotations((prev) =>
      prev.map((ann) =>
        ann.id === selectedAnnotation.id ? { ...ann, video: videoPath } : ann
      )
    );
  };
  
  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
  }, [route.params?.selectedVideo]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Annotations</Text>
      
      {/* Create Annotation Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Annotation</Text>
      </TouchableOpacity>

      {/* Annotations List */}
      <AnnotationList
        annotations={annotations}
        onAttachVideo={handleAttachVideo}
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      {/* Modal to create annotations */}
      <AnnotationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateAnnotation={handleCreateAnnotation}
      />

      {/* Sync Results Display */}
      {syncResult && (
        <View style={styles.syncResultContainer}>
          <Text style={styles.syncResultText}>{syncResult}</Text>
        </View>
      )}

      {/* Sync Button */}
      <TouchableOpacity
        style={styles.syncButton}
        onPress={() =>
          handleSendAnnotationsVideos(annotations, `${HUB_BASE_URL}upload.py`, setSyncResult)
        }
      >
        <Text style={styles.syncButtonText}>Sync</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container + Header
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  // Add Annotation Button
  addButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  
  // Sync Button
  syncButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Sync Results Container
  syncResultContainer: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: '#F0F4F8',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  syncResultText: {
    fontSize: 16,
    textAlign: 'center',
  },
  
});

export default Annotations;

