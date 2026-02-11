import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { FieldAnnotation, FieldCallbacks } from '../../types/AnnotationTypes';

interface FieldAnnotationListProps {
  selectedField: FieldAnnotation | null;
  fieldAnnotations: FieldAnnotation[];
  fieldCallbacks: FieldCallbacks;
}

const FieldSelector = ({selectedField, fieldAnnotations, fieldCallbacks}: FieldAnnotationListProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>
          Field: {fieldCallbacks.getName(selectedField?.id) ?? "Select Field"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gear}
        onPress={() => fieldCallbacks.onEditButton(selectedField)}
        disabled={!selectedField?.id}
      >
        <Text style={styles.gearText}>⚙️</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={fieldAnnotations}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    fieldCallbacks.onSelectButton(item);
                    setVisible(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.item, styles.addItem]}
                  onPress={() => {
                    setVisible(false);
                    fieldCallbacks.onEditButton(null);
                  }}
                >
                  <Text style={styles.addText}>+ Add Field</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  dropdownText: {
    fontSize: 16,
  },
  gear: {
    marginLeft: 8,
    padding: 8,
  },
  gearText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  item: {
    padding: 12,
  },
  addItem: {
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  addText: {
    fontWeight: 'bold',
  },
});

export default FieldSelector;
