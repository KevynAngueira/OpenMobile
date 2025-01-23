// AnnotationsContext.tsx (or wherever your context is defined)

import React, { createContext, useState, useContext } from 'react';

interface Annotation {
  id: number;
  name: string;
  info: string;
  video: string | null;
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

export const AnnotationsProvider: React.FC = ({ children }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  return (
    <AnnotationsContext.Provider value={{ annotations, setAnnotations, selectedAnnotation, setSelectedAnnotation }}>
      {children}
    </AnnotationsContext.Provider>
  );
};

