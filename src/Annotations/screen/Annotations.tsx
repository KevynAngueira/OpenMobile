// Annotations.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native'; 

import { LeafAnnotation, PlantAnnotation, FieldAnnotation, LeafCallbacks, PlantCallbacks, FieldCallbacks } from '../../types/AnnotationTypes';

import { useLeafAnnotations } from '../context/LeafAnnotationsContext';
import LeafAnnotationList from '../components/LeafAnnotationList';
import LeafAnnotationModal from '../components/LeafAnnotationModal';

import { usePlantAnnotations } from '../context/PlantAnnotationsContext';
import PlantAnnotationList from '../components/PlantAnnotationList';
import PlantAnnotationModal from '../components/PlantAnnotationModal';

import { useFieldAnnotations } from '../context/FieldAnnotationsContext';
import FieldSelector from '../components/FieldSelector';
import FieldAnnotationModal from '../components/FieldAnnotationModal';

import { createLeaf, updateLeaf, deleteLeaf, attachVideo, setParentPlant } from '../services/LeafHandler';
import { createPlant, updatePlant, deletePlant, attachChildLeaf, removeChildLeaf, setParentField } from '../services/PlantHandler';
import { createField, updateField, deleteField, attachChildPlant, removeChildPlant } from '../services/FieldHandler';

import { useSync } from '../../Sync/context/SyncContext';
import useHandleSync from '../services/AnnotationActions';

import { useAnnotationMaps } from '../../hooks/useAnnotationMaps';
import { useSyncMaps } from '../../hooks/useSyncMaps';

import { canUseDevFlags } from '../../DevConsole/configs/DevFlagsConfig';
import { resetEntry } from '../../network/ResetEntry';

interface AnnotationsProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const Annotations: React.FC<AnnotationsProps> = ({ route, navigation }) =>  {
  const { leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation } = useLeafAnnotations();
  const { plantAnnotations, setPlantAnnotations, selectedPlantAnnotation, setSelectedPlantAnnotation } = usePlantAnnotations();
  const { fieldAnnotations, setFieldAnnotations, selectedFieldAnnotation, setSelectedFieldAnnotation } = useFieldAnnotations();

  const { listToLeaves, listToPlants, getHierarchyName } = useAnnotationMaps(fieldAnnotations, plantAnnotations, leafAnnotations);

  const [leafModalVisible, setLeafModalVisible] = useState(false);
  const [plantModalVisible, setPlantModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  
  const { syncEntries, removeSyncEntry } = useSync();
  const { videoToSync } = useSyncMaps(syncEntries);

  const { handleSync } = useHandleSync();
  const [syncResult, setSyncResult] = useState<string | null>(null);
 
  const [viewMode, setViewMode] = useState<'field' | 'plant' | 'leaf'>('field');

  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);

  const plantsForSelectedField = React.useMemo(() => {
    if (!selectedFieldAnnotation) return [];

    const freshField = fieldAnnotations.find(f => f.id === selectedFieldAnnotation.id);
    if (!freshField) return [];
  
    return listToPlants(freshField.childPlants);
  }, [selectedFieldAnnotation?.id, fieldAnnotations, plantAnnotations]);
  
  navigation = useNavigation();


  // Creates a leaf annotation
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

  // Edits a leaf annotation
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

  // Deletes a leaf annotation
  const handleDeleteLeafAnnotation = (leaf: LeafAnnotation) => {
    const parentPlant = leaf.parentPlant;
    deleteLeaf(setLeafAnnotations, leaf.id, () => {
      if (parentPlant) {
        removeChildLeaf(setPlantAnnotations, parentPlant, leaf.id);
      }
    });  
  };

  // Creates a plant annotation
  const handleCreatePlantAnnotation = (
    newPlant: PlantAnnotation,
    fieldId?: string
  ): string => {
    
    let plantId = newPlant.id
    if (plantId) {
      updatePlant(setPlantAnnotations, newPlant);
    } else {
      plantId = createPlant(setPlantAnnotations, newPlant);
    }

    if (fieldId) {
      const prevFieldId = newPlant.parentField;
      if (prevFieldId){
        removeChildPlant(setFieldAnnotations, prevFieldId, plantId);
      }
      setParentField(setPlantAnnotations, plantId, fieldId);
      attachChildPlant(setFieldAnnotations, fieldId, plantId);
      
      console.log(`<<== Create Plant: \n ${plantId} \n ${fieldId} \n ${newPlant.parentField} \n ${selectedFieldAnnotation?.childPlants} \n ${plantsForSelectedField}`);
    }

    setPlantModalVisible(false);
    return plantId;
  };

  // Edits a plant annotation
  const handleEditPlantAnnotation = (plant: PlantAnnotation | null) => {
   
    if (!selectedFieldAnnotation?.id) {
      Alert.alert("Select a Field", "Please select or create a field first.");
      return "";
    }

    setSelectedPlantAnnotation(plant);
    setPlantModalVisible(true);
  }

  // Deletes a plant annotation
  const handleDeletePlantAnnotation = (plant: PlantAnnotation) => {
    const childLeaves = plant.childLeaves;
    deletePlant(setPlantAnnotations, plant.id, () => {
      childLeaves.forEach(leafId => {
        deleteLeaf(setLeafAnnotations, leafId);
      });
    });
  };

  // Creates a field annotation
  const handleCreateFieldAnnotation = (
    newField: FieldAnnotation  
  ): string => {
    
    let fieldId = newField.id
    if (fieldId) {
      updateField(setFieldAnnotations, newField);
    } else {
      fieldId = createField(setFieldAnnotations, newField);
    }

    setSelectedFieldAnnotation({
      ...newField,
      id: fieldId,
    });

    setFieldModalVisible(false);
    return fieldId;
  };

  // Edits a plant annotation
  const handleEditFieldAnnotation = (field: FieldAnnotation | null) => {
    setSelectedFieldAnnotation(field);
    setFieldModalVisible(true);
  }

  // Deletes a plant annotation
  const handleDeleteFieldAnnotation = (field: FieldAnnotation) => {
    const childPlants = field.childPlants;
    deleteField(setFieldAnnotations, field.id, () => {
      childPlants.forEach(plantId => {
        deletePlant(setPlantAnnotations, plantId);
      });
    });
    setSelectedFieldAnnotation(null);
  };

  // Prompts you to attach a video from the VideoGallery screen
  const handleAttachVideo = (leaf: LeafAnnotation) => {
    setSelectedLeafAnnotation(leaf);
    navigation.navigate({
      name: 'VideoGallery',
      merge: true,
    });
  };
  
  // Upon video selection, attaches the video to the annotation
  const handleVideoSelect = (videoPath: string) => {
    if (!selectedLeafAnnotation) {
      console.warn('No selected leaf annotation when attaching video');
      return;
    }
    const leafId = selectedLeafAnnotation.id;
    attachVideo(setLeafAnnotations, leafId, videoPath);
    setSelectedVideoPath(videoPath);
  };
  
  const handleSelectFieldAnnotation = (field: FieldAnnotation) => {
    setSelectedFieldAnnotation(field);
  }

  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
    navigation.setParams({ selectedVideo: undefined });
  }, [route.params?.selectedVideo]);

  const leafCallbacks : LeafCallbacks = {
    syncEntries: syncEntries,
    onAttachVideo: handleAttachVideo,
    onEditButton: handleEditLeafAnnotation,
    onDeleteAnnotation: handleDeleteLeafAnnotation,
    getSyncEntry: videoToSync,
    getName: (leafId) => getHierarchyName(leafId, "leaf", viewMode),
    resetEntry: (leaf) => resetEntry(leaf, removeSyncEntry),
  }

  const plantCallbacks : PlantCallbacks = {
    onEditButton: handleEditPlantAnnotation,
    onDeleteAnnotation: handleDeletePlantAnnotation,
    getLeaves: listToLeaves,
    getName: (plantId) => getHierarchyName(plantId, "plant", viewMode),
  }

  const fieldCallbacks : FieldCallbacks = {
    onSelectButton: handleSelectFieldAnnotation,
    onEditButton: handleEditFieldAnnotation,
    onDeleteAnnotation: handleDeleteFieldAnnotation,
    getPlants: listToPlants,
    getName: (fieldId) => getHierarchyName(fieldId, "field", viewMode),
  }

  return (
    <SafeAreaView style={styles.screen}>

      {/* Static Header Container */}
      <View style={styles.topContainer}>
        {/* Toggle Switch: Plant / Leaf view */}
        <View style={styles.toggleContainer}>
          {/* Left side (view controls) */}
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleLabel}>View Mode:</Text>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'field' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('field')}
            >
              <Text style={styles.toggleButtonText}>Field</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'plant' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('plant')}
            >
              <Text style={styles.toggleButtonText}>Plant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'leaf' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('leaf')}
            >
              <Text style={styles.toggleButtonText}>Leaf</Text>
            </TouchableOpacity>
          </View>

          {/* Right side (gear icon) */}
          { canUseDevFlags ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("DevPanel")}
              style={styles.gearButton}
            >
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 22 }}>Prod</Text>
          )}          
        </View>

        {/* Select the current field */}
        <FieldSelector 
          selectedField={selectedFieldAnnotation} 
          fieldAnnotations={fieldAnnotations} 
          fieldCallbacks={fieldCallbacks}
        />
      </View>

      {/* Scrollable Body Container */}
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={true}
      >

        {/* Modal to create leaf annotations */}
        <LeafAnnotationModal
          visible={leafModalVisible}
          onClose={() => setLeafModalVisible(false)}
          onCreateAnnotation={handleCreateLeafAnnotation}
          selectedLeaf={selectedLeafAnnotation}
          selectedPlant={selectedPlantAnnotation}
        />

        {/* Modal to create plant annotations */}
        <PlantAnnotationModal
          visible={plantModalVisible}
          onClose={() => setPlantModalVisible(false)}
          onCreateAnnotation={handleCreatePlantAnnotation}
          selectedPlant={selectedPlantAnnotation}
          selectedField={selectedFieldAnnotation}
        />      

        {/* Modal to create field annotations */}
        <FieldAnnotationModal
          visible={fieldModalVisible}
          onClose={() => setFieldModalVisible(false)}
          onCreateAnnotation={handleCreateFieldAnnotation}
          onDeleteAnnotation={handleDeleteFieldAnnotation}
          selectedField={selectedFieldAnnotation}
        />

        {/* Conditional Rendering */}
        {viewMode === 'field' && (
          <PlantAnnotationList
            plantAnnotations={plantsForSelectedField}
            plantCallbacks={plantCallbacks}
            leafAnnotations={leafAnnotations}
            leafCallbacks={leafCallbacks}
          />
        )}

        {viewMode === 'plant' && (
          <PlantAnnotationList
            plantAnnotations={plantAnnotations}
            plantCallbacks={plantCallbacks}
            leafAnnotations={leafAnnotations}
            leafCallbacks={leafCallbacks}
          />
        )}

        {viewMode === 'leaf' && (
          <LeafAnnotationList
            plantId="All"
            leafAnnotations={leafAnnotations}
            leafCallbacks={{
              ...leafCallbacks,
              onEditButton: () => {},
              onAttachVideo: () => {},
              syncEntries: leafCallbacks.syncEntries
            }}
          />
        )}
      </ScrollView>

      {/* Static Footer Container */}
      <View style={styles.bottomContainer}>
        {/* Sync Results Display */}
        {syncResult && (
          <View style={styles.syncResultContainer}>
            <Text style={styles.syncResultText}>{syncResult}</Text>
          </View>
        )}

        {/* Sync Button */}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => handleSync(fieldAnnotations, plantAnnotations, leafAnnotations, setSyncResult)}
        >
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  // Main Containers
  screen: {
    flex: 1,
  },

  topContainer: {
    padding: 12,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40, 
  },

  bottomContainer: {
    padding: 12,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Toggle Switch
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  toggleButton: {
    backgroundColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginRight: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#1E3A5F',
  },
  toggleButtonText: {
    color: 'white',
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

  
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  gearButton: {
    padding: 8,
  },
});

export default Annotations;

