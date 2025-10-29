// AnnotationsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Location {
  latitude: number;
  longitude: number;
}

interface Annotation {
  id: number;
  name: string;
  info: string;
  video: string | null;
  location: Location | null;
  length: string;
  leafNumber: string;
  leafWidths: String[];
}

interface AnnotationsContextType {
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  selectedAnnotation: Annotation | null;
  setSelectedAnnotation: React.Dispatch<React.SetStateAction<Annotation | null>>;
}

const AnnotationsContext = createContext<AnnotationsContextType | undefined>(undefined);

export const useAnnotations = () => {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationsProvider');
  }
  return context;
};

const ANNOTATIONS_STORAGE_KEY = '@annotations';

export const AnnotationsProvider: React.FC = ({ children }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  // Load annotations from AsyncStorage when the app starts
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const storedAnnotations = await AsyncStorage.getItem(ANNOTATIONS_STORAGE_KEY);
        if (storedAnnotations) {
          setAnnotations(JSON.parse(storedAnnotations));
        }
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    };

    loadAnnotations();
  }, []);

  // Save annotations to AsyncStorage whenever they change
  useEffect(() => {
    const saveAnnotations = async () => {
      try {
        await AsyncStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
      } catch (error) {
        console.error('Failed to save annotations:', error);
      }
    };

    saveAnnotations();
  }, [annotations]);

  return (
    <AnnotationsContext.Provider value={{ annotations, setAnnotations, selectedAnnotation, setSelectedAnnotation }}>
      {children}
    </AnnotationsContext.Provider>
  );
};

