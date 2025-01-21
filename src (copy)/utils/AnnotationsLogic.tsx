// AnnotationLogic.tsx
import { useState } from 'react';
import { Alert } from 'react-native';

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const createAnnotation = (name: string, info: string, video: string | null) => {
    const newAnnotation = {
      id: Date.now(),
      name,
      info,
      video,
    };
    setAnnotations((prevAnnotations) => [...prevAnnotations, newAnnotation]);
  };

  const deleteAnnotation = (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this annotation?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
            setAnnotations((prevAnnotations) =>
              prevAnnotations.filter((annotation) => annotation.id !== id)
            );
        }},
      ]
    );
  };

  const toggleAnnotationDetails = (annotation: any) => {
    setSelectedAnnotation(selectedAnnotation?.id === annotation.id ? null : annotation);
  };

  const attachVideo = (videoPath: string) => {
    setSelectedVideo(videoPath);
    if (selectedAnnotation) {
      selectedAnnotation.video = videoPath;
    }
  };

  return {
    annotations,
    selectedAnnotation,
    selectedVideo,
    createAnnotation,
    deleteAnnotation,
    toggleAnnotationDetails,
    attachVideo,
  };
};

