// PlantAnnotationList.tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import LeafAnnotationList from './LeafAnnotationList';

import { PlantStatusIndicator } from './PlantStatusIndicator';
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

      {plantAnnotations
        .slice()   // avoid mutating props
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((plant) => {
          
        const leavesForPlant = plantCallbacks.getLeaves(plant.childLeaves);
        const syncEntriesForPlant = leavesForPlant.map(leaf => leafCallbacks.getSyncEntry(leaf.video)).filter(Boolean);

        return (
          <View key={plant.id} style={styles.annotationContainer}>
            <TouchableOpacity
              onPress={() => handleToggleDropdown(plant)}
              style={styles.annotationHeader}
            >
              <Text style={styles.annotationTitle}>{plantCallbacks.getName(plant?.id)}</Text>
              <PlantStatusIndicator 
                entries={syncEntriesForPlant}
              />
            </TouchableOpacity>

            {expandedAnnotation?.id === plant.id && (
              <View style={styles.dropdown}>
                 <Text style={styles.tabTitle}>Plant Information</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Info:</Text>
                  <Text style={styles.infoValue}>{plant.info || "—"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>
                    {plant.location?.latitude ?? "—"}, {plant.location?.longitude ?? "—"}
                  </Text>
                </View>

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
  // Add Plant Button
  addButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 6,
    marginBottom: 18,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  // Plant Container
  annotationContainer: {
    marginBottom: 14,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D6D6D6',
    padding: 12,
    borderRadius: 6,

    // visual distinction
    borderLeftWidth: 5,
    borderLeftColor: '#1E3A5F',
  },
  annotationTitle: {
    fontSize: 19,
    fontWeight: '600',
    flex: 1,
    color: '#222',
  },

  // Plant Dropdown
  dropdown: {
    backgroundColor: '#F3F7FB',
    padding: 12,
    borderRadius: 6,
    marginTop: 6,
    borderColor: '#B8C6D1',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  videoText: {
    marginTop: 4,
    fontSize: 15,
  },

  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },

  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },

  // NEW -----------------
  tabTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: "800",
    color: "#444",
    fontSize: 18,
    width: 120,
  },
  infoValue: {
    flex: 1,
    color: "#222",
    fontSize: 18,
  },

});

export default PlantAnnotationList;