// VideoGallery.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, FlatList, Alert, SectionList } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { RouteProp } from '@react-navigation/native';
import { useLeafAnnotations } from '../../Annotations/context/LeafAnnotationsContext';
import { useVideoCapture } from '../../VideoCapture/Index';
import { validateVideoCapture } from '../../VideoCapture/VideoCaptureValidate';
import VideoItem from './VideoItem';

interface VideoGalleryProps {
  route: RouteProp<any, any>; 
  navigation: any;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ route, navigation }) => {
  const { leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation } = useLeafAnnotations();	
  const [attachedDropdownOpen, setAttachedDropdownOpen] = useState(false);
  const [unattachedDropdownOpen, setUnattachedDropdownOpen] = useState(true);
  const [deleteAllHovered, setDeleteAllHovered] = useState(false);
  const { videoCaptures, reconcileDirectory } = useVideoCapture();

  // Fetch videos from app's local storage directory when the modal is opened
  useEffect(() => {
    reconcileDirectory();
  }, [])

  useEffect(() => {
    console.log('[VideoGallery] MOUNT');
    return () => {
      console.log('[VideoGallery] UNMOUNT');
    };
  }, []);
  

  const videos = videoCaptures.map(vc => vc.videoPath);
  
  // Split videos into attached and unattached
  const attachedVideos = videos.filter((video) =>
    leafAnnotations.some((leafAnnotation) => leafAnnotation.video === video)
  );
  
  const unattachedVideos = videos.filter(
    (video) => !leafAnnotations.some((leafAnnotation) => leafAnnotation.video === video)
  );      

  const unattachedPassVideos = unattachedVideos.filter(videoPath => {
    const vc = videoCaptures.find(v => v.videoPath === videoPath);
    return vc?.toolValidation === 'pass' && vc?.leafValidation === 'pass';
  });
  
  const unattachedPendingVideos = unattachedVideos.filter(videoPath => {
    const vc = videoCaptures.find(v => v.videoPath === videoPath);
    return vc?.toolValidation === 'pending' || vc?.leafValidation === 'pending';
  });
  
  const unattachedFailVideos = unattachedVideos.filter(videoPath => {
    const vc = videoCaptures.find(v => v.videoPath === videoPath);
    return vc?.toolValidation === 'fail' || vc?.leafValidation === 'fail';
  }); 

  const COLORS = {
    attachable: '#4CAF50',   // green
    location: '#9E9E9E',         // gray
    pending: '#FF9800',      // orange
    fail: '#F44336',      // red
  };

  // Handles callback to Annotations screen
  const handleVideoSelect = async (videoPath: string) => { 
  
    const vc = videoCaptures.find(v => v.videoPath === videoPath);
    const statusResult = vc ? await validateVideoCapture(vc) : null;

    if (!vc || !statusResult?.isValid) {
      return;
    }

    const videoName = videoPath.split('/').pop()?.split('.')[0]; // Extracts the name without path or extension
    const annotationUsingVideo = leafAnnotations.find((leafAnnotation) => leafAnnotation.video === videoPath);

    if (annotationUsingVideo) {
      Alert.alert(
        'Video Already Attached',
        `This video is already attached to "${annotationUsingVideo.name}". Do you want to remove it and attach it to "${selectedLeafAnnotation?.name}"?`,
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
              navigation.replace('Annotations', { selectedVideo: videoPath });
            },
          },
        ]
      );
    } else {
      console.log('Video selected:', videoPath);
      navigation.replace('Annotations', { selectedVideo: videoPath });
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
              reconcileDirectory(); // re-sync context with filesystem
              console.log('Video deleted:', videoPath);
            })
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
            Promise.all(unattachedVideos.map(RNFS.unlink))
              .then(() => {
                reconcileDirectory();
              })
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


  const unattachedSections = [
    {
      title: `Pass (${unattachedPassVideos.length})`,
      data: unattachedPassVideos,
    },
    {
      title: `Pending (${unattachedPendingVideos.length})`,
      data: unattachedPendingVideos,
    },
    {
      title: `Fail (${unattachedFailVideos.length})`,
      data: unattachedFailVideos,
    },
  ].filter(section => section.data.length > 0);

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
      
      {/* Attached Videos */}
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
            renderItem={({item})=> (
              <VideoItem
              videoPath={item}
              videoCaptures={videoCaptures}
              leafAnnotations={leafAnnotations}
              handleVideoSelect={handleVideoSelect}
              handleDeselectVideo={handleDeselectVideo}
              handleDeleteVideo={handleDeleteVideo}
              />
            )}
          keyExtractor={(item) => item}
          style={styles.dropdownList}
        />
      )}

      {/* Unattached Videos */}
      <TouchableOpacity
        onPress={() => toggleDropdown('unattached')}
        style={styles.dropdownHeader}
      >
        <Text style={styles.dropdownHeaderText}>
          {unattachedDropdownOpen ? '▼' : '▶'} Unattached Videos
        </Text>
      </TouchableOpacity>
      {unattachedDropdownOpen && (
        <SectionList
          sections={unattachedSections}
          keyExtractor={(item) => item}
          renderItem={({item})=> (
            <VideoItem
            videoPath={item}
            videoCaptures={videoCaptures}
            leafAnnotations={leafAnnotations}
            handleVideoSelect={handleVideoSelect}
            handleDeselectVideo={handleDeselectVideo}
            handleDeleteVideo={handleDeleteVideo}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.statusHeader}>{title}</Text>
          )}
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
    marginVertical: 10
  },
  statusHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
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
  
  // Status Tag styles
  statusTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
    borderRadius: 5,
    minWidth: 50,
    alignItems: 'center',
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

