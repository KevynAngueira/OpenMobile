import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { FieldAnnotation, FieldCallbacks } from '../../types/AnnotationTypes';

interface FieldAnnotationListProps {
  selectedField: FieldAnnotation | null;
  fieldAnnotations: FieldAnnotation[];
  fieldCallbacks: FieldCallbacks;
}

const FieldSelector = ({
  selectedField,
  fieldAnnotations,
  fieldCallbacks,
}: FieldAnnotationListProps) => {
  const [visible, setVisible] = useState(false);

  const fieldName =
    fieldCallbacks.getName(selectedField?.id) ?? "Select Field";

  return (
    <View style={styles.wrapper}>
      {/* Large Field Display */}
      <Text style={styles.fieldLabel}>Current Field</Text>

      <View style={styles.fieldHeaderRow}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.fieldName}>
            {fieldCallbacks.getName(selectedField?.id) ?? "Select Field"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.inlineEditButton}
          onPress={() => fieldCallbacks.onEditButton(selectedField)}
        >
          <Text style={styles.inlineEditButtonText}>Edit</Text>
        </TouchableOpacity>
      
      </View>

      {/* Dropdown Modal */}
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
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
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
  wrapper: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 12,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  fieldLabel: {
    fontSize: 18,
    color: "#777",
    marginBottom: 2,
  },

  fieldName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A5F",
  },

  chevron: {
    fontSize: 18,
    color: "#777",
  },

  editButton: {
    position: "absolute",
    right: 0,
    top: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },

  item: {
    padding: 14,
  },

  addItem: {
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  addText: {
    fontWeight: "bold",
    fontSize: 16,
  },


  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // if unsupported in your RN version, use marginLeft instead
  },

  dropdown: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },

  inlineEditButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44, // keeps good touch size
  },
  
  inlineEditButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FieldSelector;
