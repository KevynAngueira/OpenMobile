import { useState } from "react";
import { VideoCapture } from "../VideoCapture/Index";
import { LeafAnnotation } from "../types/AnnotationTypes";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Video from "react-native-video";

interface VideoItemProps {
    videoPath: string;
    videoCaptures: VideoCapture[];
    leafAnnotations: LeafAnnotation[];
    handleVideoSelect: (videoPath: string) => void;
    handleDeselectVideo: (videoPath: string) => void;
    handleDeleteVideo: (videoPath: string) => void;
}
  
const VideoItem: React.FC<VideoItemProps> = ({
    videoPath,
    videoCaptures,
    leafAnnotations,
    handleVideoSelect,
    handleDeselectVideo,
    handleDeleteVideo,
}) => {
    const [playing, setPlaying] = useState(false);
    const [hoveredDelete, setHoveredDelete] = useState<string | null>(null);

    const annotationUsingVideo = leafAnnotations.find((leafAnnotation) => leafAnnotation.video === videoPath);
    const vc = videoCaptures.find(v => v.videoPath === videoPath);

    // Determine tag
    let statusTag: { text: string; color: string } | null = null;
    let sameLocation = true;

    const COLORS = {
        attachable: '#4CAF50',   // green
        location: '#9E9E9E',         // gray
        pending: '#FF9800',      // orange
        fail: '#F44336',      // red
    };

    if (sameLocation) {
      statusTag = { text: 'Attachable', color: COLORS.attachable };
    } else if (!sameLocation) {
      statusTag = { text: 'Location', color: COLORS.location };
    }

    if (vc?.toolValidation === 'pending' || vc?.leafValidation === 'pending') {
      statusTag = { text: 'Pending', color: COLORS.pending };
    } else if (vc?.toolValidation === 'fail' || vc?.leafValidation === 'fail') {
      statusTag = { text: 'Fail', color: COLORS.fail };
    }

    const videoName = videoPath.split('/').pop() ?? videoPath;


    return (
      <View style={styles.videoItem}>
        
        {/*
        <Video source={{ uri: videoPath }} style={styles.videoPreview} paused={true} controls />
        */}

        {playing ? (
          <Video
            source={{ uri: videoPath }}
            style={styles.videoPreview}
            controls
          />
        ) : (
          <View style={[styles.videoPreview, styles.videoPlaceholder]}>
            <Text style={styles.videoNameText}>{videoName}</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => setPlaying(!playing)} style={styles.selectButton}>
                <Text style={styles.selectButtonText}>{playing ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        {/* Status Tag */}
        {statusTag && (
        <View style={[styles.statusTag, { backgroundColor: statusTag.color }]}>
            <Text style={styles.tagButtonText}>{statusTag.text}</Text>
          </View>
        )}

        {/* Tag or Delete Button */}  
        {annotationUsingVideo ? (
          <TouchableOpacity
            onPress={() => handleDeselectVideo(videoPath)}
            style={styles.tagButton}
          >
            <Text style={styles.tagButtonText}>{annotationUsingVideo.name}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={() => setHoveredDelete(videoPath)}
            onPressOut={() => setHoveredDelete(null)}
            onPress={() => handleDeleteVideo(videoPath)}
            style={[
              styles.deleteButton,
              hoveredDelete === videoPath && styles.deleteButtonHovered,
            ]}
          >
            <Text style={styles.deleteButtonText}>X</Text>
          </TouchableOpacity>
        )}
        
        {/* Select Button */}
        <TouchableOpacity
          onPress={() => handleVideoSelect(videoPath)}
          style={styles.selectButton}
        >
          <Text style={styles.selectButtonText}>Select Video</Text>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({  
  
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

  // Video Styles
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  
  videoNameText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default VideoItem;