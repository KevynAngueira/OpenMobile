// LeafAnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';
import { LeafAnnotation, Location } from '../../types/AnnotationTypes';


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
  
  parentPlant: "",
};

const LeafAnnotationModal = ({ visible, onClose, onCreateAnnotation, selectedLeaf, selectedPlant}) => {
  const [leaf, setLeaf] = useState<LeafAnnotation>(EMPTY_LEAF);
  
  const [latitude, setLatitude] = useState(500);
  const [longitude, setLongitude] = useState(500);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  const [leafWidthsText, setLeafWidthsText] = useState("");
  const [showLeafDetails, setShowLeafDetails] = useState(false);

  useEffect(() => {
    console.log(selectedLeaf)
    if (selectedLeaf) {
      setLeaf(selectedLeaf);
      setUseCustomLocation(selectedLeaf?.id ? true : false); 
    } else {
      setLeaf(EMPTY_LEAF);
      setUseCustomLocation(false); 
    }
    setShowLeafDetails(true);
  }, [selectedLeaf]);

  const handleCreate = () => {
    const location = {
      "latitude": latitude,
      "longitude": longitude
    };
    const updatedLeaf = {...leaf, location: location};
    setLeaf(updatedLeaf);
    onCreateAnnotation(updatedLeaf, selectedPlant?.id);
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

          {/* Leaf Details Section */}
          <View style={styles.buttonSpacing}>
            <Button
              title={showLeafDetails ? 'Hide Leaf Details' : 'Enter Leaf Details'}
              onPress={() => setShowLeafDetails(!showLeafDetails)}
              color={isLeafDetailsValid(leaf.length, leaf.leafNumber, leaf.leafWidths) ? '#4CAF50' : '#B0B0B0'}
            />
          </View>

          {showLeafDetails && (
            <View style={styles.leafSection}>
              <Text style={styles.sectionTitle}>Leaf Details</Text>

              <TextInput
                placeholder="Enter current length (in)"
                style={styles.input}
                value={leaf.length}
                onChangeText={(text) => setLeaf({ ...leaf, length: text })}
                keyboardType="numeric"
              />

              <TextInput
                placeholder="Enter leaf number (7–21)"
                style={styles.input}
                value={leaf.leafNumber}
                onChangeText={(text) => setLeaf({ ...leaf, leafNumber: text })}
                keyboardType="numeric"
              />

              <TextInput
                placeholder="Enter Leaf Widths (in, commas)"
                style={styles.input}
                value={leafWidthsText}
                onChangeText={(text) => {
                  setLeafWidthsText(text);

                  const widths = text
                    .split(',')
                    .map(w => w.trim())
                    .filter(w => w !== '' && !isNaN(Number(w)))
                    .map(String);

                  setLeaf({...leaf, leafWidths: widths});
                }}
                onBlur={() => setLeafWidthsText(leaf.leafWidths.join(', '))}
                keyboardType="numeric"
              />
            </View>
          )}
          
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
            <Button title={selectedLeaf?.id ? "Confirm" : "Create"} onPress={handleCreate} />
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

export default LeafAnnotationModal;

