// Annotations.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Button, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native'; 
import { TextInput } from 'react-native-gesture-handler';

import { LeafAnnotation, PlantAnnotation, LeafCallbacks, PlantCallbacks } from '../../types/AnnotationTypes';

import { useLeafAnnotations } from '../context/LeafAnnotationsContext';
import LeafAnnotationList from '../components/LeafAnnotationList';
import LeafAnnotationModal from '../components/LeafAnnotationModal';

import { usePlantAnnotations } from '../context/PlantAnnotationsContext';
import PlantAnnotationList from '../components/PlantAnnotationList';
import PlantAnnotationModal from '../components/PlantAnnotationModal';

import { createLeaf, updateLeaf, deleteLeaf, attachVideo, setParentPlant } from '../services/LeafHandler';
import { createPlant, updatePlant, deletePlant, attachChildLeaf, removeChildLeaf } from '../services/PlantHandler';

import { useSync } from '../../Sync/context/SyncContext';
import useHandleSync from '../services/AnnotationActions';
import { useServerConfig } from '../../hooks/useServerConfig';

interface AnnotationsProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const Annotations: React.FC<AnnotationsProps> = ({ route, navigation }) =>  {
  const { leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation } = useLeafAnnotations();
  const { plantAnnotations, setPlantAnnotations, selectedPlantAnnotation, setSelectedPlantAnnotation } = usePlantAnnotations();

  const [leafModalVisible, setLeafModalVisible] = useState(false);
  const [plantModalVisible, setPlantModalVisible] = useState(false);

  const { syncEntries } = useSync();

  const [syncResult, setSyncResult] = useState<string | null>(null);
  const { handleSync } = useHandleSync();
  const { removeAllSyncEntry } = useSync();

  const { ip, port, setIP, setPort, saveServerSettings, serverURL } = useServerConfig();
  const [showServerSettings, setShowServerSettings] = useState(false);

  navigation = useNavigation();


  // Creates an annotation
  const handleCreateLeafAnnotation = (
   newLeaf: LeafAnnotation,
   plantId?: string
  ): string => {
    let leafId = newLeaf.id;
    if (leafId) {
      updateLeaf(setLeafAnnotations, newLeaf);
    } else {
      leafId = createLeaf(setLeafAnnotations, newLeaf);
    }
    setLeafModalVisible(false);

    if (plantId) {
      const prevPlantId = newLeaf.parentPlant;
      if (prevPlantId){
        removeChildLeaf(setPlantAnnotations, prevPlantId, leafId);
      }
      setParentPlant(setLeafAnnotations, leafId, plantId);
      attachChildLeaf(setPlantAnnotations, plantId, leafId);
    }

    return leafId;
  };

  // Edits an annotation
  const handleEditLeafAnnotation = (leaf: LeafAnnotation | null, plantId?: string) => {
    if (plantId) {
      const plant = plantAnnotations.find((p) => p.id === plantId) || null;
      setSelectedPlantAnnotation(plant);
    } else {
      setSelectedPlantAnnotation(null);
    }

    setSelectedLeafAnnotation(leaf);
    setLeafModalVisible(true);
  }

  // Deletes an annotation
  const handleDeleteLeafAnnotation = (leaf: LeafAnnotation) => {
    const parentPlant = leaf.parentPlant;
    deleteLeaf(setLeafAnnotations, leaf.id, () => {
      if (parentPlant) {
        removeChildLeaf(setPlantAnnotations, parentPlant, leaf.id);
      }
    });  
  };

  // Creates an annotation
  const handleCreatePlantAnnotation = (
    newPlant: PlantAnnotation  
  ): string => {
    
    let plantId = newPlant.id
    if (plantId) {
      updatePlant(setPlantAnnotations, newPlant);
    } else {
      plantId = createPlant(setPlantAnnotations, newPlant);
    }
    setPlantModalVisible(false);
    return plantId;
  };

  // Edits an annotation
  const handleEditPlantAnnotation = (plant: PlantAnnotation | null) => {
    setSelectedPlantAnnotation(plant);
    setPlantModalVisible(true);
  }

  // Deletes an annotation
  const handleDeletePlantAnnotation = (plant: PlantAnnotation) => {
    const childLeaves = plant.childLeaves;
    deletePlant(setPlantAnnotations, plant.id, () => {
      childLeaves.forEach(leafId => {
        deleteLeaf(setLeafAnnotations, leafId);
      });
    });
  };

  // Prompts you to attach a video from the VideoGallery screen
  const handleAttachVideo = (leaf: LeafAnnotation) => {
    setSelectedLeafAnnotation(leaf);
    navigation.navigate('VideoGallery')
  };
  
  // Upon video selection, attaches the video to the annotation
  const handleVideoSelect = (videoPath: string) => {
    const leafId = selectedLeafAnnotation.id;
    attachVideo(setLeafAnnotations, leafId, videoPath);
  };
  
  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
  }, [route.params?.selectedVideo]);


  const leafCallbacks : LeafCallbacks = {
    syncEntries: syncEntries,
    onAttachVideo: handleAttachVideo,
    onEditButton: handleEditLeafAnnotation,
    onDeleteAnnotation: handleDeleteLeafAnnotation
  }

  const plantCallbacks : PlantCallbacks = {
    onEditButton: handleEditPlantAnnotation,
    onDeleteAnnotation: handleDeletePlantAnnotation
  }

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

      {/* Leaf Annotations List */}
      <LeafAnnotationList
        plantId={'All'}
        leafAnnotations={leafAnnotations}
        leafCallbacks={leafCallbacks}
      />

      {/* Modal to create leaf annotations */}
      <LeafAnnotationModal
        visible={leafModalVisible}
        onClose={() => setLeafModalVisible(false)}
        onCreateAnnotation={handleCreateLeafAnnotation}
        selectedLeaf={selectedLeafAnnotation}
        selectedPlant={selectedPlantAnnotation}
      />

      {/* Plant Annotations List */}
      <PlantAnnotationList
        plantAnnotations={plantAnnotations}
        plantCallbacks={plantCallbacks}
        leafAnnotations={leafAnnotations}
        leafCallbacks={leafCallbacks}
      />

      {/* Modal to create leaf annotations */}
      <PlantAnnotationModal
        visible={plantModalVisible}
        onClose={() => setPlantModalVisible(false)}
        onCreateAnnotation={handleCreatePlantAnnotation}
        selectedPlant={selectedPlantAnnotation}
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

