// PlantAnnotationsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlantAnnotation } from '../../types/AnnotationTypes';

interface PlantAnnotationsContextType {
  plantAnnotations: PlantAnnotation[];
  setPlantAnnotations: React.Dispatch<React.SetStateAction<PlantAnnotation[]>>;

  selectedPlantAnnotation: PlantAnnotation | null;
  setSelectedPlantAnnotation: React.Dispatch<React.SetStateAction<PlantAnnotation | null>>;
}

const PlantAnnotationsContext = createContext<PlantAnnotationsContextType | undefined>(undefined);

export const usePlantAnnotations = () => {
  const ctx = useContext(PlantAnnotationsContext);
  if (!ctx) throw new Error("usePlantAnnotations must be used inside a PlantAnnotationsProvider");
  return ctx;
};

const STORAGE_KEY = '@plant_annotations';

export const PlantAnnotationsProvider: React.FC = ({ children }) => {
  const [plantAnnotations, setPlantAnnotations] = useState<PlantAnnotation[]>([]);
  const [selectedPlantAnnotation, setSelectedPlantAnnotation] = useState<PlantAnnotation | null>(null);

  // Load on start
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setPlantAnnotations(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to load plant annotations:", err);
      }
    };
    load();
  }, []);

  // Save on change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plantAnnotations));
      } catch (err) {
        console.error("Failed to save plant annotations:", err);
      }
    };
    save();
  }, [plantAnnotations]);

  return (
    <PlantAnnotationsContext.Provider
      value={{ plantAnnotations, setPlantAnnotations, selectedPlantAnnotation, setSelectedPlantAnnotation }}
    >
      {children}
    </PlantAnnotationsContext.Provider>
  );
};
