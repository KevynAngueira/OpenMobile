// AnnotationsModal.tsx
import React from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Text } from 'react-native';

const AnnotationModal = ({
  visible,
  onClose,
  onCreate,
  name,
  info,
  setName,
  setInfo,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  name: string;
  info: string;
  setName: (name: string) => void;
  setInfo: (info: string) => void;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Annotation</Text>
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
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Create Annotation" onPress={onCreate} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default AnnotationModal;

