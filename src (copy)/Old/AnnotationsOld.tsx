// AnnotationsOld.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VideoGallery from './VideoGallery'; 
import { sendMedia } from '../utils/MediaUploader';
import { FLASK_URL } from '../constants/Config';


const Annotations = () => {
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAnnotationName, setNewAnnotationName] = useState('');
  const [newAnnotationInfo, setNewAnnotationInfo] = useState('');
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [videoGalleryVisible, setVideoGalleryVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null); 

  const handleCreateAnnotation = () => {
    const newAnnotation = {
      id: Date.now(),
      name: newAnnotationName,
      info: newAnnotationInfo,
      video: selectedVideo, // Attach selected video to annotation
    };
    setAnnotations((prevAnnotations) => [...prevAnnotations, newAnnotation]);
    setNewAnnotationName('');
    setNewAnnotationInfo('');
    setModalVisible(false);
  };
  
  const handleDeleteAnnotation = (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this annotation group?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
            setAnnotations((prevAnnotations) =>
              prevAnnotations.filter((annotation) => annotation.id !== id)
            );
        }},
      ]
    );
  };

  const handleAttachVideo = (annotation: any) => {
    setSelectedAnnotation(annotation);
    setVideoGalleryVisible(true); // Open video gallery
  };

  const handleVideoSelect = (videoPath: string) => {
    setSelectedVideo(videoPath); // Store selected video path
    if (selectedAnnotation) {
      selectedAnnotation.video = videoPath; // Attach video to the selected annotation
    }
  };
  
  const handleToggleDropdown = (annotation: any) => {
    setSelectedAnnotation(selectedAnnotation?.id === annotation.id ? null : annotation);
  };

  const handleSync = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/test`);
      const data = await response.json();
      console.log(data)
      setSyncResult(`Sync Successful: ${JSON.stringify(data)}`);
      setTimeout(() => setSyncResult(null), 3000); // Clear result after 3 seconds
    } catch (error) {
      console.error(error)
      setSyncResult("Sync Failed: Unable to connect to the server.");
      setTimeout(() => setSyncResult(null), 3000); // Clear result after 3 seconds
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Annotations</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Annotation Group</Text>
      </TouchableOpacity>

      {annotations.map((annotation) => (
        <View key={annotation.id} style={styles.annotationContainer}>
          <TouchableOpacity
            onPress={() => handleToggleDropdown(annotation)}
            style={styles.annotationHeader}
          >
            <Text style={styles.annotationTitle}>{annotation.name}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>      
          
          {selectedAnnotation?.id === annotation.id && (
            <View style={styles.dropdown}>
              <Text style={styles.videoText}>Info: {annotation.info}</Text>
              
              {annotation.video ? (
                <View style={styles.videoContainer}>
                  <Text style={styles.videoText}>Attached Video: {annotation.video}</Text>
                  <Video
                    source={{ uri: annotation.video }} // Display the attached video
                    style={styles.videoPlayer}
                    controls={true} // Show controls (play, pause, volume)
                    resizeMode="contain"
                    paused={false} // Auto-play
                  />
                </View>
              ) : null}
              
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => handleAttachVideo(annotation)}
              >
                <Text style={styles.attachButtonText}>Attach Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAnnotation(annotation.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          
        </View>
      ))}      

      {/* Annotation Modal */}
      <Modal 
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Annotation Group</Text>
            
            <TextInput
              placeholder="Enter group name"
              style={styles.input}
              value={newAnnotationName}
              onChangeText={setNewAnnotationName}
            />
            
            <TextInput
              placeholder="Enter group info"
              style={styles.input}
              value={newAnnotationInfo}
              onChangeText={setNewAnnotationInfo}
            />
            
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Create Annotation Group" onPress={handleCreateAnnotation} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Gallery Modal */}
      <VideoGallery
        visible={videoGalleryVisible}
        onVideoSelect={handleVideoSelect}
        onClose={() => setVideoGalleryVisible(false)}
      />
      
      {/* Sync Result Display */}
      {syncResult && (
        <View style={styles.syncResultContainer}>
          <Text style={styles.syncResultText}>{syncResult}</Text>
        </View>
      )}
      
      {/* Sync Button */}
      <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
        <Text style={styles.syncButtonText}>Sync</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
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
  annotationContainer: {
    marginBottom: 10,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
  },
  annotationTitle: {
    fontSize: 18,
    flex: 1,
  },
  attachButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  attachButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  videoText: {
    marginTop: 5,
    fontSize: 16,
  },
  videoContainer: {
    marginTop: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  }, syncButton: {
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
});

export default Annotations;

