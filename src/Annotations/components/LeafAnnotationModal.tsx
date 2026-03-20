// LeafAnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button, ScrollView, KeyboardAvoidingView } from 'react-native';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';
import { LeafAnnotation, Location } from '../../types/AnnotationTypes';
import { DevFlags } from '../../DevConsole/configs/DevFlagsConfig';


const DEFAULT_LOCATION : Location = {
  'latitude': 500,
  'longitude': 500
}

const EMPTY_LEAF: LeafAnnotation = {
  id: null,
  name: "",
  info: "",
  location: DEFAULT_LOCATION,
  leafNumber: "",
  leafWidths: [],
  length: "",
  video: null,

  directArea: "",
  maxLength: "",
  maxWidth: "",
  
  parentPlant: "",
};

const LeafAnnotationModal = ({ visible, onClose, onCreateAnnotation, selectedLeaf, selectedPlant}) => {
  const [leaf, setLeaf] = useState<LeafAnnotation>(EMPTY_LEAF);
  const [leafValid, setLeafValid] = useState(false);

  useEffect(() => {
    console.log(selectedLeaf)
    if (selectedLeaf) {
      setLeaf(selectedLeaf);
    } else {
      setLeaf(EMPTY_LEAF);
    }
  }, [selectedLeaf]);

  useEffect(() => {
    setLeafValid(
      isLeafDetailsValid(
        leaf.length,
        leaf.leafNumber,
        leaf.directArea,
        leaf.maxLength,
        leaf.maxWidth
      )
    );
  }, [leaf]);

  const handleCreate = () => {
    setLeaf(leaf);
    onCreateAnnotation(leaf, selectedPlant?.id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Leaf Annotation</Text>
          <TextInput
            placeholder="Enter annotation name"
            style={styles.input}
            value={leaf.name}
            onChangeText={(text) => {setLeaf({...leaf, name: text})}}
          />
          
          <TextInput
            placeholder="Enter annotation info"
            style={styles.input}
            value={leaf.info}
            onChangeText={(text) => {setLeaf({...leaf, info: text})}}
          />

          {/* 
          <View style={styles.buttonSpacing}>
            <Button
              title={showLeafDetails ? 'Hide Leaf Details' : 'Enter Leaf Details'}
              onPress={() => setShowLeafDetails(!showLeafDetails)}
              color={leafValid ? '#4CAF50' : '#B0B0B0'}
            />
          </View>
          */}

          {/* Leaf Details Section */}
          <View style={styles.leafSection}>
            <Text style={styles.sectionHeader}>Leaf Details</Text>

            <TextInput
              placeholder="Enter leaf number (7–21)"
              style={styles.input}
              value={leaf.leafNumber}
              onChangeText={(text) => setLeaf({ ...leaf, leafNumber: text })}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Enter current length (in)"
              style={styles.input}
              value={leaf.length}
              onChangeText={(text) => setLeaf({ ...leaf, length: text })}
              keyboardType="numeric"
            />

            {DevFlags.isEnabled("altOriginalArea") && (
              <>
                <Text style={styles.sectionHeader}>Alternate Leaf Details</Text>
                <TextInput
                  placeholder="Enter Direct Area"
                  style={styles.input}
                  value={leaf.directArea}
                  onChangeText={(text) => setLeaf({ ...leaf, directArea: text })}
                  keyboardType="numeric"
                />

                <Text style={styles.sectionHeader}>Or</Text>

                <TextInput
                  placeholder="Enter Max Length"
                  style={styles.input}
                  value={leaf.maxLength}
                  onChangeText={(text) => setLeaf({ ...leaf, maxLength: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Enter Max Width"
                  style={styles.input}
                  value={leaf.maxWidth}
                  onChangeText={(text) => setLeaf({ ...leaf, maxWidth: text })}
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
          
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button 
              title={selectedLeaf?.id ? "Confirm" : "Create"}
              onPress={handleCreate}
              disabled={!leafValid}
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Container
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
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
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Modal Text Input
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  
   // Space between buttons
  buttonSpacing: {
    marginVertical: 10,
  },

  // Sections
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 10,
  },
});

export default LeafAnnotationModal;

