// PlantAnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { FieldAnnotation, Location } from '../../types/AnnotationTypes';

const EMPTY_FIELD: FieldAnnotation = {
  id: null,
  name: "",
  childPlants: []
};

const FieldAnnotationModal = ({ visible, onClose, onCreateAnnotation, onDeleteAnnotation, selectedField}) => {
  const [field, setField] = useState<FieldAnnotation>(EMPTY_FIELD);
  
  const [latitude, setLatitude] = useState(500);
  const [longitude, setLongitude] = useState(500);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  useEffect(() => {
    if (selectedField) {
      setField(selectedField);
      setUseCustomLocation(selectedField?.id ? true : false); 
    } else {
      setField(EMPTY_FIELD);
      setUseCustomLocation(false); 
    }
  }, [selectedField]);

  const handleCreate = () => {
    const location = {
      "latitude": latitude,
      "longitude": longitude
    };
    const updatedField = {...field, location: location};
    setField(updatedField)
    onCreateAnnotation(updatedField);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {selectedField?.id && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => {
                onClose();
                onDeleteAnnotation(selectedField);
              }}
            >
              <Text style={styles.deleteIconText}>✕</Text>
            </TouchableOpacity>
          )}


          <Text style={styles.modalTitle}>New Field Annotation</Text>
          <TextInput
            placeholder="Enter annotation name"
            style={styles.input}
            value={field.name}
            onChangeText={(text) => {setField({...field, name: text})}}
          />    
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title={selectedField?.id ? "Confirm" : "Create"} onPress={handleCreate} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Container
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

  // Delete Button
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 5,
    zIndex: 10,
  },
  deleteIconText: {
    fontSize: 20,
    color: '#D32F2F', // red
    fontWeight: 'bold',
  },
});

export default FieldAnnotationModal;

