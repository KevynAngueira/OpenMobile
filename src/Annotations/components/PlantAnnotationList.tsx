// PlantAnnotationList.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import LeafAnnotationList from './LeafAnnotationList';

import { LeafAnnotation, PlantAnnotation, LeafCallbacks, PlantCallbacks } from '../../types/AnnotationTypes';

interface PlantAnnotationListProps {
  plantAnnotations: PlantAnnotation[];
  plantCallbacks: PlantCallbacks;
  leafAnnotations: LeafAnnotation[];
  leafCallbacks: LeafCallbacks;
}

const PlantAnnotationList = (props : PlantAnnotationListProps ) => {
  const { plantAnnotations, plantCallbacks, leafAnnotations, leafCallbacks } = props;
  const [expandedAnnotation, setExpandedAnnotation] = React.useState<any>(null);

  const handleToggleDropdown = (annotation: any) => {
    setExpandedAnnotation(expandedAnnotation?.id === annotation.id ? null : annotation);
  };

  return (
    <ScrollView>
      {/* Create Leaf Annotation Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => {
        plantCallbacks.onEditButton(null);
        }}>
        <Text style={styles.addButtonText}>+ Add Plant Annotation</Text>
      </TouchableOpacity>

      {plantAnnotations.map((plant) => {
        const leavesForPlant = leafAnnotations.filter(l => l.parentPlant === plant.id);

        return (
          <View key={plant.id} style={styles.annotationContainer}>
            <TouchableOpacity
              onPress={() => handleToggleDropdown(plant)}
              style={styles.annotationHeader}
            >
              <Text style={styles.annotationTitle}>{plant.name}</Text>
            </TouchableOpacity>

            {expandedAnnotation?.id === plant.id && (
              <View style={styles.dropdown}>
                <Text style={styles.videoText}>Info: {plant.info}</Text>
                <Text style={styles.videoText}>Location: {plant.location?.latitude ?? ' __ '}, {plant.location?.longitude ?? ' __ '}</Text>
                <Text style={styles.videoText}>Attached Leaves: {plant.childLeaves.join(', ')}</Text>

                <LeafAnnotationList
                  plantId={plant.id ?? 'All'}
                  leafAnnotations={leavesForPlant}
                  leafCallbacks={leafCallbacks}
                />

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>  plantCallbacks.onEditButton(plant)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => plantCallbacks.onDeleteAnnotation(plant)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

  // Annotation Container + Annotations
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
  
  // Dropdown Container
  dropdown: {
    backgroundColor: '#F0F4F8',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Attach Video Button
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

  // Edit Annotation Button
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  
  // Delete Annotation Button
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
  
  // Attached Video
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
});

export default PlantAnnotationList;

