// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { RouteProp } from '@react-navigation/native';
import { useLeafAnnotations } from '../../Annotations/context/LeafAnnotationsContext';

interface VideoGalleryProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ route, navigation }) => {
  const { leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation } = useLeafAnnotations();	
  const [videos, setVideos] = useState<string[]>([]);  
  const [attachedDropdownOpen, setAttachedDropdownOpen] = useState(false);
  const [unattachedDropdownOpen, setUnattachedDropdownOpen] = useState(true);
  const [hoveredDelete, setHoveredDelete] = useState<string | null>(null);
  const [deleteAllHovered, setDeleteAllHovered] = useState(false);

  // Fetch videos from app's local storage directory when the modal is opened
  useEffect(() => {
    const videosDirectory = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;

    RNFS.readDir(videosDirectory)
      .then((files) => {
        const videoPaths = files
          .filter((file) => file.isFile() && file.name.endsWith('.mp4'))
          .map((file) => file.path);

        setVideos(videoPaths);
      })
      .catch((error) => {
        console.error('Error reading videos directory:', error);
      });
  }, [])
  
  // Split videos into attached and unattached
  const attachedVideos = videos.filter((video) =>
    leafAnnotations.some((leafAnnotation) => leafAnnotation.video === video)
  );
  
  const unattachedVideos = videos.filter(
    (video) => !leafAnnotations.some((leafAnnotation) => leafAnnotation.video === video)
  );      


  // Validates video location matches annotation location
  const validateLocation = (videoName: string) => {
    if (selectedLeafAnnotation.location.latitude === 100 && selectedLeafAnnotation.location.longitude === 100) {
      if (!(videoName === "corn1" || videoName === "notcorn1")) {
        console.log("Skipping video selection due to location constraint 1.");
        return false;
      }
    }
    
    else if (selectedLeafAnnotation.location.latitude === 200 && selectedLeafAnnotation.location.longitude === 200) {
      if (!(videoName === "corn2" || videoName === "notcorn2")) {
        console.log("Skipping video selection due to location constraint 2.");
        return false;
      }
    }
    
    else if (!(selectedLeafAnnotation.location.latitude === 500 && selectedLeafAnnotation.location.longitude === 500)) {
      console.log("Skipping video selection due to location constraint 3.");
      return false;
    }
    
    else if (videoName === "corn1" || videoName === "notcorn1" || videoName === "corn2" || videoName === "notcorn2") {
      	console.log("Skipping video selection due to location constraint 4.");
      	return false;
    }
    return true;
  }

  // Handles callback to Annotations screen
  const handleVideoSelect = (videoPath: string) => { 
  
    const videoName = videoPath.split('/').pop()?.split('.')[0]; // Extracts the name without path or extension

    // TODO: Finish location validation service
    //if (!validateLocation(videoName)){
    //  return;
    //}

    const annotationUsingVideo = leafAnnotations.find((leafAnnotation) => leafAnnotation.video === videoPath);

    if (annotationUsingVideo) {
      Alert.alert(
        'Video Already Attached',
        `This video is already attached to "${annotationUsingVideo.name}". Do you want to remove it and attach it to "${selectedLeafAnnotation.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: () => {
              // Remove the video from the old annotation
              const updatedAnnotations = leafAnnotations.map((leafAnnotation) =>
                leafAnnotation.video === videoPath ? { ...leafAnnotation, video: null } : leafAnnotation
              );
              setLeafAnnotations(updatedAnnotations);

              // Navigate back with the selected video
              console.log('Video selected:', videoPath);
              navigation.navigate('Annotations', { selectedVideo: videoPath });
            },
          },
        ]
      );
    } else {
      console.log('Video selected:', videoPath);
      navigation.navigate('Annotations', { selectedVideo: videoPath });
    }
  };

  // If videoUri is passed via params, auto-select that video
  useEffect(() => {
    if (route.params?.selectedVideo) {
      handleVideoSelect(route.params.selectedVideo);
    }
  }, [route.params?.selectedVideo]);

  // Handle delete video
  const handleDeleteVideo = (videoPath: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            RNFS.unlink(videoPath)
              .then(() => {
                setVideos((prevVideos) => prevVideos.filter((video) => video !== videoPath));
                console.log('Video deleted:', videoPath);
              })
              .catch((error) => {
                console.error('Error deleting video:', error);
              });
          },
        },
      ]
    );
  };

  // Handle delete all unattached videos
  const handleDeleteAllVideos = () => {
    Alert.alert(
      'Delete All Unattached Videos',
      'Are you sure you want to delete all unattached videos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // Delete only unattached videos
            Promise.all(unattachedVideos.map((videoPath) => RNFS.unlink(videoPath)))
              .then(() => {
                setVideos((prevVideos) => prevVideos.filter((video) => !unattachedVideos.includes(video)));
                console.log('Deleted All Unattached Videos');
              })
              .catch((error) => {
                console.error('Error deleting unattached videos:', error);
              });
          },
        },
      ]
    );
  };
  
  // Handle deselecting a video from its annotation
  const handleDeselectVideo = (videoPath: string) => {
    const annotationUsingVideo = leafAnnotations.find((leafAnnotation) => leafAnnotation.video === videoPath);

    if (annotationUsingVideo) {
      Alert.alert(
        'Deselect Video',
        `Are you sure you want to deselect this video from "${annotationUsingVideo.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deselect',
            style: 'destructive',
            onPress: () => {
              const updatedAnnotations = leafAnnotations.map((leafAnnotation) =>
                leafAnnotation.video === videoPath ? { ...leafAnnotation, video: null } : leafAnnotation
              );
              setLeafAnnotations(updatedAnnotations);
            },
          },
        ]
      );
    }
  };
  
  const toggleDropdown = (dropdown: 'attached' | 'unattached') => {
    if (dropdown === 'attached') {
      setAttachedDropdownOpen(!attachedDropdownOpen);
      if (unattachedDropdownOpen) setUnattachedDropdownOpen(false);
    } else {
      setUnattachedDropdownOpen(!unattachedDropdownOpen);
      if (attachedDropdownOpen) setAttachedDropdownOpen(false);
    }
  };

  // Renders video item
  const renderItem = ({ item }: { item: string }) => {
    const annotationUsingVideo = leafAnnotations.find((leafAnnotation) => leafAnnotation.video === item);
    const videoName = item.split('/').pop()?.split('.')[0]; // Extracts the name without path or extension
    let sameLocation = false;

    if (selectedLeafAnnotation?.location?.latitude === 100 && selectedLeafAnnotation?.location?.longitude === 100) {
      if (videoName === "corn1" || videoName === "notcorn1") {
        sameLocation = true;
      }
    } else if (selectedLeafAnnotation?.location?.latitude === 200 && selectedLeafAnnotation?.location?.longitude === 200) {
      if (videoName === "corn2" || videoName === "notcorn2") {
        sameLocation = true;
      }
    } else if (selectedLeafAnnotation?.location?.latitude === 500 && selectedLeafAnnotation?.location?.longitude === 500) {
      if (!(videoName === "corn1" || videoName === "notcorn1" || videoName === "corn2" || videoName === "notcorn2")) {
        sameLocation = true;
      }
    }
  
    return (
      <View style={styles.videoItem}>
        <Video source={{ uri: item }} style={styles.videoPreview} paused={true} controls />
	

      {/* Location Tag */}
      {sameLocation && (
        <View style={styles.locationTag}>
          <Text style={styles.tagButtonText}>Attachable</Text>
        </View>
      )}

      {/* Tag or Delete Button */}  
      {annotationUsingVideo ? (
          <TouchableOpacity
            onPress={() => handleDeselectVideo(item)}
            style={styles.tagButton}
          >
            <Text style={styles.tagButtonText}>{annotationUsingVideo.name}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={() => setHoveredDelete(item)}
            onPressOut={() => setHoveredDelete(null)}
            onPress={() => handleDeleteVideo(item)}
            style={[
              styles.deleteButton,
              hoveredDelete === item && styles.deleteButtonHovered,
            ]}
          >
            <Text style={styles.deleteButtonText}>X</Text>
          </TouchableOpacity>
        )}
        
        {/* Select Button */}
        <TouchableOpacity
          onPress={() => handleVideoSelect(item)}
          style={styles.selectButton}
        >
          <Text style={styles.selectButtonText}>Select Video</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Displays a list of selectable videos and offers the ability to record a new one
  return (
    <View style={styles.modalContent}>
      {/* Header with Select Video and Delete All */}
      <View style={styles.headerRow}>
        <Text style={styles.modalHeader}>Select Video</Text>
        <TouchableOpacity
          onPressIn={() => setDeleteAllHovered(true)}
          onPressOut={() => setDeleteAllHovered(false)}
          onPress={handleDeleteAllVideos}
          style={[
            styles.deleteAllButton,
            deleteAllHovered && styles.deleteAllButtonHovered,
          ]}
        >
          <Text style={styles.deleteAllButtonText}>Delete All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Attached Videos Section */}
      <TouchableOpacity
        onPress={() => toggleDropdown('attached')}
        style={styles.dropdownHeader}
      >
        <Text style={styles.dropdownHeaderText}>
          {attachedDropdownOpen ? '▼' : '▶'} Attached Videos
        </Text>
      </TouchableOpacity>
      {attachedDropdownOpen && (
        <FlatList
          data={attachedVideos}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          style={styles.dropdownList}
        />
      )}

      {/* Unattached Videos Section */}
      <TouchableOpacity
        onPress={() => toggleDropdown('unattached')}
        style={styles.dropdownHeader}
      >
        <Text style={styles.dropdownHeaderText}>
          {unattachedDropdownOpen ? '▼' : '▶'} Unattached Videos
        </Text>
      </TouchableOpacity>
      {unattachedDropdownOpen && (
        <FlatList
          data={unattachedVideos}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          style={styles.dropdownList}
        />
      )}

      {/* Open Camera Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('CameraScreen')}
        style={styles.openCameraButton}
      >
        <Text style={styles.openCameraButtonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Close Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },

  // Header Row styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Dropdown styles
  dropdownHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownList: {
    marginVertical: 10,
  },
  
  // Video styles
  videoItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  
  // Delete All Button styles
  deleteAllButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
  },
  deleteAllButtonHovered: {
    backgroundColor: 'red',
  },
  deleteAllButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },

  // Delete Button styles
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonHovered: {
    backgroundColor: 'red',
  },
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Tag Button styles
  tagButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1E3A5F',
    padding: 5,
    borderRadius: 5,
  },
  tagButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Location Tag styles
  locationTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
  },
  locationTagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Select Button styles
  selectButton: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  selectButtonText: {
    color: 'white',
    textAlign: 'center',
  },

  // Open Camera Button styles
  openCameraButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openCameraButtonText: {
    color: 'white',
    textAlign: 'center',
  },

  // Close Button styles
  closeButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default VideoGallery;

