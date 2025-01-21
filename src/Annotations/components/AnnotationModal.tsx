// AnnotationModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Button } from 'react-native';

const AnnotationModal = ({ visible, onClose, onCreateAnnotation }) => {
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');

  const handleCreate = () => {
    onCreateAnnotation(name, info);
    setName('');
    setInfo('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Annotation Group</Text>
          <TextInput
            placeholder="Enter group name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Enter group info"
            style={styles.input}
            value={info}
            onChangeText={setInfo}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Create" onPress={handleCreate} />
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
});

export default AnnotationModal;

