// types/AnnotationTypes.ts
import { SyncEntry } from "./SyncTypes";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface LeafAnnotation {
  id: string | null;
  name: string;
  info: string;
  video: string | null;
  location: Location | null;
  length: string;
  leafNumber: string;
  leafWidths: string[];

  parentPlant: string;
}

export interface PlantAnnotation {
  id: string | null;
  name: string;
  info: string;
  location: Location | null;

  parentField: string;
  childLeaves: string[];
}

export interface FieldAnnotation {
  id: string | null;
  name: string;
  
  childPlants: string[];
}

export interface LeafCallbacks {
  syncEntries: any;
  onAttachVideo: (leaf: LeafAnnotation) => void;
  onEditButton: (leaf: LeafAnnotation | null, plantId?: string) => void;
  onDeleteAnnotation: (leaf: LeafAnnotation) => void;
  getSyncEntry: (videoPath: string) => SyncEntry;
  getName: (leafId: string | null) => string;
}

export interface PlantCallbacks {
  onEditButton: (plant: PlantAnnotation | null, plantId?: string) => void;
  onDeleteAnnotation: (plant: PlantAnnotation) => void;
  getLeaves: (leafList: string[]) => LeafAnnotation[];
  getName: (plantId: string | null) => string;
}

export interface FieldCallbacks {
  onSelectButton: (filed: FieldAnnotation) => void;
  onEditButton: (field: FieldAnnotation | null, fieldId?: string) => void;
  onDeleteAnnotation: (field: FieldAnnotation) => void;
  getPlants: (plantList: string[]) => PlantAnnotation[];
  getName: (fieldId: string | null) => string;
}
