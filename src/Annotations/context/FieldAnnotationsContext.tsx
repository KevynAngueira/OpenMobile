// FieldAnnotationsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FieldAnnotation } from '../../types/AnnotationTypes';

interface FieldAnnotationsContextType {
  fieldAnnotations: FieldAnnotation[];
  setFieldAnnotations: React.Dispatch<React.SetStateAction<FieldAnnotation[]>>;
  selectedFieldAnnotation: FieldAnnotation | null;
  setSelectedFieldAnnotation: React.Dispatch<React.SetStateAction<FieldAnnotation | null>>;
}

const FieldAnnotationsContext = createContext<FieldAnnotationsContextType | undefined>(undefined);

export const useFieldAnnotations = () => {
  const context = useContext(FieldAnnotationsContext);
  if (!context) {
    throw new Error('useFieldAnnotations must be used within a FieldAnnotationsProvider');
  }
  return context;
};

const FIELD_ANNOTATIONS_STORAGE_KEY = '@fields';

export const FieldAnnotationsProvider: React.FC = ({ children }) => {
  const [fieldAnnotations, setFieldAnnotations] = useState<FieldAnnotation[]>([]);
  const [selectedFieldAnnotation, setSelectedFieldAnnotation] =
    useState<FieldAnnotation | null>(null);

  // Load fields from AsyncStorage
  useEffect(() => {
    const loadFieldAnnotations = async () => {
      try {
        const stored = await AsyncStorage.getItem(FIELD_ANNOTATIONS_STORAGE_KEY);
        if (stored) {
          setFieldAnnotations(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load field annotations:', error);
      }
    };

    loadFieldAnnotations();
  }, []);

  // Persist fields to AsyncStorage
  useEffect(() => {
    const saveFieldAnnotations = async () => {
      try {
        await AsyncStorage.setItem(
          FIELD_ANNOTATIONS_STORAGE_KEY,
          JSON.stringify(fieldAnnotations)
        );
      } catch (error) {
        console.error('Failed to save field annotations:', error);
      }
    };

    saveFieldAnnotations();
  }, [fieldAnnotations]);

  return (
    <FieldAnnotationsContext.Provider
      value={{
        fieldAnnotations,
        setFieldAnnotations,
        selectedFieldAnnotation,
        setSelectedFieldAnnotation
      }}
    >
      {children}
    </FieldAnnotationsContext.Provider>
  );
};
