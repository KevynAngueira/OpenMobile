// Annotations.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Button, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native'; 

import AnnotationList from './AnnotationList';
import AnnotationModal from './AnnotationModal';
import { useLeafAnnotations } from '../context/LeafAnnotationsContext';
import { useSync } from '../../Sync/context/SyncContext';
import useHandleSync from '../services/AnnotationActions';
import { FLASK_URL, HUB_BASE_URL } from '../../constants/Config';

import { useServerConfig } from '../../hooks/useServerConfig';
import { TextInput } from 'react-native-gesture-handler';



interface AnnotationsProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const Annotations: React.FC<AnnotationsProps> = ({ route, navigation }) =>  {
  const { leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation } = useLeafAnnotations();
  const { syncEntries } = useSync();
  const [modalVisible, setModalVisible] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const { handleSync } = useHandleSync();
  const { removeAllSyncEntry } = useSync();


  const { ip, port, setIP, setPort, saveServerSettings, serverURL } = useServerConfig();
  const [showServerSettings, setShowServerSettings] = useState(false);

  navigation = useNavigation();

  // Creates an annotation
  const handleCreateAnnotation = (
    name: string, 
    latitude: string, 
    longitude: string, 
    info: string,
    length: string,
    leafNumber: string,
    leafWidths: string[],
    id?: number,
    video?: string
  ) => {
    const parsedLeafWidths = leafWidths.map((w) => parseFloat(w)).filter((n) => !isNaN(n))

    const newAnnotation = {
      id: id || Date.now(),
      video: video || null,
      name,
      info,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      length: parseFloat(length),
      leafNumber: parseInt(leafNumber),
      leafWidths: parsedLeafWidths,
    };

    setLeafAnnotations((prev) => {
      if (id) {
        return prev.map((ann) => (ann.id === id ? newAnnotation : ann));
      }
      return [...prev, newAnnotation];
    });

    setModalVisible(false);
  };

  // Edits an annotation
  const handleEditAnnotation = (annotation: any) => {
    setSelectedLeafAnnotation(annotation);
    setModalVisible(true);
  }


  // Deletes an annotation
  const handleDeleteAnnotation = (id: number) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this annotation group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setLeafAnnotations((prev) => prev.filter((annotation) => annotation.id !== id)),
      },
    ]);
  };

  // Prompts you to attach a video from the VideoGallery screen
  const handleAttachVideo = (annotation: any) => {
    setSelectedLeafAnnotation(annotation);
    navigation.navigate('VideoGallery')
  };
  
  // Upon video selection, attaches the video to the annotation
  const handleVideoSelect = (videoPath: string) => {
    setLeafAnnotations((prev) =>
      prev.map((ann) =>
        ann.id === selectedLeafAnnotation?.id ? { ...ann, video: videoPath } : ann
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

      {/* Reset Buttons */}
      <View style={{ flexDirection: 'row' }}>
        {/* Reset Entries */}
        <TouchableOpacity
          style={{ backgroundColor: '#f44336', padding: 8, borderRadius: 6, marginRight: 5 }}
          onPress={() => {
            Alert.alert(
              "Confirm Reset",
              "Are you sure you want to delete all entries?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", style: "destructive", onPress: () => removeAllSyncEntry() }
              ]
            );
          }}
        >
          <Text style={{ color: 'white' }}>Reset Entries</Text>
        </TouchableOpacity>

        {/* Reset Server */}
        <TouchableOpacity
          style={{ backgroundColor: '#FF9800', padding: 8, borderRadius: 6 }}
          onPress={() => {
            Alert.alert(
              "Confirm Server Reset",
              "Are you sure you want to reset the server cache?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Yes", 
                  style: "destructive", 
                  onPress: async () => {
                    try {
                      const response = await fetch(`${serverURL}/reset`);
                      const data = await response.json();
                      Alert.alert("Server Reset", data.message || "Server cache reset.");
                    } catch (err) {
                      Alert.alert("Error", `Failed to reset server: ${err.message}`);
                    }
                  } 
                }
              ]
            );
          }}
        >
          <Text style={{ color: 'white' }}>Reset Server</Text>
        </TouchableOpacity>
      </View>
      
      {/* Server IP Input */}
      <View>
        <Button
          title={showServerSettings ? 'Hide Server Settings' : 'Enter Server Settings'}
          onPress={() => setShowServerSettings(!showServerSettings)}
          color='#4CAF50'
        />
      </View>

      { showServerSettings && (
        <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Server Settings</Text>

          <TextInput
            style={{ borderWidth: 1, padding: 8, marginBottom: 5, borderRadius: 6 }}
            placeholder="IP (e.g. 192.168.1.148)"
            value={ip}
            onChangeText={setIP}
          />

          <TextInput
            style={{ borderWidth: 1, padding: 8, marginBottom: 5, borderRadius: 6 }}
            placeholder="Port (e.g. 5000)"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={{ backgroundColor: "#4CAF50", padding: 10, borderRadius: 6 }}
            onPress={() => saveServerSettings(ip, port)}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Annotation Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setSelectedLeafAnnotation({});
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>+ Add Annotation</Text>
      </TouchableOpacity>

      {/* Annotations List */}
      <AnnotationList
        annotations={leafAnnotations}
        syncEntries={syncEntries}
        onAttachVideo={handleAttachVideo}
        onEditButton={handleEditAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      {/* Modal to create annotations */}
      <AnnotationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateAnnotation={handleCreateAnnotation}
        initialValues={selectedLeafAnnotation}
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
        onPress={() => handleSync(serverURL, leafAnnotations, setSyncResult)}
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

