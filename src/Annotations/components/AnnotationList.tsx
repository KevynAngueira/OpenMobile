// AnnotationList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const AnnotationList = ({ annotations, onAttachVideo, onDeleteAnnotation }) => {
  const [expandedAnnotation, setExpandedAnnotation] = React.useState<any>(null);

  const handleToggleDropdown = (annotation: any) => {
    setExpandedAnnotation(expandedAnnotation?.id === annotation.id ? null : annotation);
  };

  return (
    <>
      {annotations.map((annotation) => (
        <View key={annotation.id} style={styles.annotationContainer}>
          <TouchableOpacity
            onPress={() => handleToggleDropdown(annotation)}
            style={styles.annotationHeader}
          >
            <Text style={styles.annotationTitle}>{annotation.name}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>

          {expandedAnnotation?.id === annotation.id && (
            <View style={styles.dropdown}>
              <Text style={styles.videoText}>Info: {annotation.info}</Text>
              
              {annotation.video ? (
                <View style={styles.videoContainer}>
                  <Text style={styles.videoText}>Attached Video: {annotation.video}</Text>
                  <Video
                    source={{ uri: annotation.video }} // Display the attached video
                    style={styles.videoPlayer}
                    controls={true} // Show controls (play, pause, volume)
                    resizeMode="contain"
                    paused={false} // Auto-play
                  />
                </View>
              ) : null}
              
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => onAttachVideo(annotation)}
              >
                <Text style={styles.attachButtonText}>Attach Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDeleteAnnotation(annotation.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  // Annotation Container + Annotations
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
  
  // Dropdown Container
  dropdown: {
    backgroundColor: '#F0F4F8',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Attach Video Button
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
  
  // Delete Annotation Button
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
  
  // Attached Video
  videoText: {
    marginTop: 5,
    fontSize: 16,
  },
  videoContainer: {
    marginTop: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
});

export default AnnotationList;

