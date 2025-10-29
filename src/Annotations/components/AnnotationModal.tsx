// AnnotationModal.tsx
import React, { useState,  useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { isLeafDetailsValid } from '../utils/AnnotationValidation';

const AnnotationModal = ({ visible, onClose, onCreateAnnotation, initialValues}) => {
  const [id, setId] = useState('')
  const [video, setVideo] = useState('')
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  
  const [length, setLength] = useState('');
  const [leafNumber, setLeafNumber] = useState('');
  const [leafWidths, setLeafWidths] = useState(Array(8).fill(''));
  const [leafWidthsText, setLeafWidthsText] = useState("");
  const [showLeafDetails, setShowLeafDetails] = useState(false);

   useEffect(() => {
    const fetchLocation = async () => {
      setLatitude(500);
      setLongitude(500);
    };

    if (!useCustomLocation) {
      fetchLocation();
    }
  }, [useCustomLocation]);

  useEffect(() => {
    if (initialValues) {
      setId(initialValues.id || '');
      setVideo(initialValues.video || '');
      
      setName(initialValues.name || '');
      setInfo(initialValues.info || '');
      
      setLatitude(initialValues.location?.latitude?.toString() || '');
      setLongitude(initialValues.location?.longitude?.toString() || '');
      setLength(initialValues.length?.toString() || '');
      
      setLeafNumber(initialValues.leafNumber?.toString() || '');
      setLeafWidths(initialValues.leafWidths || Array(8).fill(''));
      setLeafWidthsText(initialValues.leafWidths?.join(', ') || '');
      
      setShowLeafDetails(true);
      setUseCustomLocation(initialValues?.id ? true : false); 
    }
  }, [initialValues]);

  const handleCreate = () => {
    onCreateAnnotation(name, latitude, longitude, info, length, leafNumber, leafWidths, id, video);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Annotation Group</Text>
          <TextInput
            placeholder="Enter annotation name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            placeholder="Enter annotation info"
            style={styles.input}
            value={info}
            onChangeText={setInfo}
          />

          {/* Leaf Details Section */}
          <View style={styles.buttonSpacing}>
            <Button
              title={showLeafDetails ? 'Hide Leaf Details' : 'Enter Leaf Details'}
              onPress={() => setShowLeafDetails(!showLeafDetails)}
              color={isLeafDetailsValid(length, leafNumber, leafWidths) ? '#4CAF50' : '#B0B0B0'}
            />
          </View>

          {showLeafDetails && (
            <View style={styles.leafSection}>
              <Text style={styles.sectionTitle}>Leaf Details</Text>

              <TextInput
                placeholder="Enter current length (in)"
                style={styles.input}
                value={length}
                onChangeText={setLength}
                keyboardType="numeric"
              />

              <TextInput
                placeholder="Enter leaf number (7–21)"
                style={styles.input}
                value={leafNumber}
                onChangeText={setLeafNumber}
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
                    .map(Number);
                  setLeafWidths(widths);
                }}
                onBlur={() => setLeafWidthsText(leafWidths.join(', '))}
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
                  setLatitude('');
                  setLongitude('');
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
            <Button title={initialValues?.id ? "Confirm" : "Create"} onPress={handleCreate} />
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

export default AnnotationModal;

