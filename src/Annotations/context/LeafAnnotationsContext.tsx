// LeafAnnotationsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeafAnnotation } from '../../types/AnnotationTypes';

interface LeafAnnotationsContextType {
  leafAnnotations: LeafAnnotation[];
  setLeafAnnotations: React.Dispatch<React.SetStateAction<LeafAnnotation[]>>;
  selectedLeafAnnotation: LeafAnnotation | null;
  setSelectedLeafAnnotation: React.Dispatch<React.SetStateAction<LeafAnnotation | null>>;
}

const LeafAnnotationsContext = createContext<LeafAnnotationsContextType | undefined>(undefined);

export const useLeafAnnotations = () => {
  const context = useContext(LeafAnnotationsContext);
  if (!context) {
    throw new Error('useLeafAnnotations must be used within an LeafAnnotationsProvider');
  }
  return context;
};

const LEAF_ANNOTATIONS_STORAGE_KEY = '@annotations';

export const LeafAnnotationsProvider: React.FC = ({ children }) => {
  const [leafAnnotations, setLeafAnnotations] = useState<LeafAnnotation[]>([]);
  const [selectedLeafAnnotation, setSelectedLeafAnnotation] = useState<LeafAnnotation | null>(null);

  // Load annotations from AsyncStorage when the app starts
  useEffect(() => {
    const loadLeafAnnotations = async () => {
      try {
        const storedLeafAnnotations = await AsyncStorage.getItem(LEAF_ANNOTATIONS_STORAGE_KEY);
        if (storedLeafAnnotations) {
          setLeafAnnotations(JSON.parse(storedLeafAnnotations));
        }
      } catch (error) {
        console.error('Failed to load leaf annotations:', error);
      }
    };

    loadLeafAnnotations();
  }, []);

  // Save annotations to AsyncStorage whenever they change
  useEffect(() => {
    const saveLeafAnnotations = async () => {
      try {
        await AsyncStorage.setItem(LEAF_ANNOTATIONS_STORAGE_KEY, JSON.stringify(leafAnnotations));
      } catch (error) {
        console.error('Failed to save leaf annotations:', error);
      }
    };

    saveLeafAnnotations();
  }, [leafAnnotations]);

  return (
    <LeafAnnotationsContext.Provider value={{ leafAnnotations, setLeafAnnotations, selectedLeafAnnotation, setSelectedLeafAnnotation }}>
      {children}
    </LeafAnnotationsContext.Provider>
  );
};

