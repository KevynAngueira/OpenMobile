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

  childLeaves: string[];
}

export interface LeafCallbacks {
  syncEntries: any;
  onAttachVideo: (leaf: LeafAnnotation) => void;
  onEditButton: (leaf: LeafAnnotation | null, plantId?: string) => void;
  onDeleteAnnotation: (leaf: LeafAnnotation) => void;
  getSyncEntry: (videoPath: string) => SyncEntry;
  getPlantName: (plantId?: string | null) => string;
}

export interface PlantCallbacks {
  onEditButton: (plant: PlantAnnotation | null, plantId?: string) => void;
  onDeleteAnnotation: (plant: PlantAnnotation) => void;
  getLeafName: (leafId?: string | null) => string;
  getLeaves: (leafList: string[]) => LeafAnnotation[];
}
