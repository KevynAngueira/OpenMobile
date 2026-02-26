// LeafAnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button } from 'react-native';
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
  
  const [latitude, setLatitude] = useState(500);
  const [longitude, setLongitude] = useState(500);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  const [leafWidthsText, setLeafWidthsText] = useState("");
  const [showLeafDetails, setShowLeafDetails] = useState(false);

  useEffect(() => {
    console.log(selectedLeaf)
    if (selectedLeaf) {
      setLeaf(selectedLeaf);
      setLeafWidthsText(selectedLeaf?.leafWidths?.join(', ') ?? "");
      setUseCustomLocation(selectedLeaf?.id ? true : false); 
    } else {
      setLeaf(EMPTY_LEAF);
      setLeafWidthsText("");
      setUseCustomLocation(false); 
    }
    setShowLeafDetails(true);
  }, [selectedLeaf]);

  useEffect(() => {
    setLeafValid(
      isLeafDetailsValid(
        leaf.length,
        leaf.leafNumber,
        leaf.leafWidths,
        leaf.directArea,
        leaf.maxLength,
        leaf.maxWidth
      )
    );
  }, [leaf]);

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
              color={leafValid ? '#4CAF50' : '#B0B0B0'}
            />
          </View>

          {showLeafDetails && (
            <View style={styles.leafSection}>

              {/* Remaining Area */}
              <Text style={styles.sectionHeader}>Remaining Area</Text>
              <TextInput
                placeholder="Enter current length (in)"
                style={styles.input}
                value={leaf.length}
                onChangeText={(text) => setLeaf({ ...leaf, length: text })}
                keyboardType="numeric"
              />

              {/* Original Area */}
              {!DevFlags.isEnabled("altOriginalArea") ? (
                <>
                  <Text style={styles.sectionHeader}>Original Area</Text>
                  <TextInput
                    placeholder="Enter leaf number (7–21)"
                    style={styles.input}
                    value={leaf.leafNumber}
                    onChangeText={(text) => setLeaf({ ...leaf, leafNumber: text })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Enter Base Widths (in, comma-separated)"
                    style={styles.input}
                    value={leafWidthsText}
                    onChangeText={(text) => {
                      setLeafWidthsText(text);
                      const widths = text
                        .split(',')
                        .map((w) => w.trim())
                        .filter((w) => w !== '' && !isNaN(Number(w)))
                        .map(String);
                      setLeaf({ ...leaf, leafWidths: widths });
                    }}
                    onBlur={() => setLeafWidthsText(leaf.leafWidths.join(', '))}
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.sectionHeader}>Alternate Original Area</Text>
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
          )}
          
          {/* Location Section }
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
          */}
          
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

