// AnnotationItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AnnotationItem = ({
  annotation,
  onToggleDetails,
  onDelete,
  onAttachVideo,
}: {
  annotation: any;
  onToggleDetails: () => void;
  onDelete: () => void;
  onAttachVideo: () => void;
}) => {
  return (
    <View style={styles.annotationContainer}>
      <TouchableOpacity onPress={onToggleDetails} style={styles.annotationHeader}>
        <Text style={styles.annotationTitle}>{annotation.name}</Text>
        <Ionicons name="chevron-down" size={20} color="black" />
      </TouchableOpacity>

      {annotation.video && <Text style={styles.videoText}>Attached Video: {annotation.video}</Text>}

      <TouchableOpacity style={styles.attachButton} onPress={onAttachVideo}>
        <Text style={styles.attachButtonText}>Attach Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
      
      {selectedAnnotation?.id === annotation.id && (
            <View style={styles.dropdown}>
           
              <Text style={styles.annotationInfo}>{annotation.info}</Text>
              
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => handleAttachVideo(annotation)}
              >
                <Text style={styles.attachButtonText}>Attach Video</Text>
              </TouchableOpacity>
              
              {annotation.video && (
                <Text style={styles.videoText}>Attached Video: {annotation.video}</Text>
              )}
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAnnotation(annotation.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              
            </View>
          )}
      
      
      
    </View>
  );
};

const styles = StyleSheet.create({
  annotationContainer: {
    marginBottom: 10,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
  },
  annotationTitle: {
    fontSize: 18,
    flex: 1,
  },
  attachButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  attachButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  videoText: {
    marginTop: 5,
    fontSize: 16,
  },
});

export default AnnotationItem;

