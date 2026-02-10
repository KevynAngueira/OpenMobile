import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet
} from 'react-native';
import { FieldAnnotation } from '../../types/AnnotationTypes';

interface Props {
  fields: FieldAnnotation[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onAddField: () => void;
  onEditField: () => void;
}

const FieldSelector = ({
  fields,
  selectedFieldId,
  onSelectField,
  onAddField,
  onEditField
}: Props) => {
  const [visible, setVisible] = useState(false);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>
          Field: {selectedField?.name ?? "Select Field"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gear}
        onPress={onEditField}
        disabled={!selectedFieldId}
      >
        <Text style={styles.gearText}>⚙️</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={fields}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelectField(item.id!);
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
                    onAddField();
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

export default FieldSelector;
