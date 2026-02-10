// PlantAnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { FieldAnnotation, Location } from '../../types/AnnotationTypes';


const DEFAULT_LOCATION : Location = {
  'latitude': 500,
  'longitude': 500
}

const EMPTY_FIELD: FieldAnnotation = {
  id: null,
  name: "",
  info: "",
  location: DEFAULT_LOCATION,

  childPlants: []
};

const FieldAnnotationModal = ({ visible, onClose, onCreateAnnotation, selectedField}) => {
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
          <Text style={styles.modalTitle}>New Field Annotation</Text>
          <TextInput
            placeholder="Enter annotation name"
            style={styles.input}
            value={field.name}
            onChangeText={(text) => {setField({...field, name: text})}}
          />
          
          <TextInput
            placeholder="Enter annotation info"
            style={styles.input}
            value={field.info}
            onChangeText={(text) => {setField({...field, info: text})}}
          />

          {/* Location Section */}
          <View style={styles.buttonSpacing}>
            <Button 
              title={useCustomLocation ? "Use Current Location" : "Enter Custom Coordinates"} 
              onPress={() => {
                setUseCustomLocation(!useCustomLocation);
                if (!useCustomLocation) {
                  setLatitude(500);
                  setLongitude(500);
                }
            }} 
              color={
                (!useCustomLocation || (latitude && longitude)) 
                  ? '#4CAF50'  // Green
                  : '#9E9E9E'  // Grey
              }
            />
          </View>
          
          {useCustomLocation && (
            <>
              <TextInput
                placeholder="Enter latitude"
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
              />
              <TextInput
                placeholder="Enter longitude"
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
              />
            </>
          )}
          
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
  }
});

export default FieldAnnotationModal;

