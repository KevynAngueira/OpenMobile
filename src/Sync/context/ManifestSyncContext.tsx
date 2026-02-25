import React, { createContext, useContext, useState } from 'react';
import { FieldAnnotation, PlantAnnotation, LeafAnnotation } from '../../types/AnnotationTypes';
import { apiFetch } from '../../network/ApiFetch';

interface ManifestSyncContextType {
  syncAllManifest: (
    serverURL: string,
    fields: FieldAnnotation[],
    plants: PlantAnnotation[],
    leaves: LeafAnnotation[]
  ) => Promise<void>;
  lastResult: string | null;
}

export interface PlantArtifact {
  id: string;
  name: string;
  fieldId: string;
  leaves: string[];
}

export interface FieldArtifact {
  id: string;
  name: string;
  plants: string[];
}

const ManifestSyncContext = createContext<ManifestSyncContextType | undefined>(undefined);

export const useManifestSync = () => {
  const context = useContext(ManifestSyncContext);
  if (!context) {
    throw new Error('useManifestSync must be used within ManifestSyncProvider');
  }
  return context;
};

export const ManifestSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastResult, setLastResult] = useState<string | null>(null);

  ////////////////////////////////////////////
  // BUILD ARTIFACTS
  ////////////////////////////////////////////
  
  function buildPlantArtifact(
    plant: PlantAnnotation,
    leaves: LeafAnnotation[]
  ): PlantArtifact {
  
    const leafIds = leaves
      .filter((leaf) => leaf.parentPlant === plant.id)
      .map((leaf) => {
        if (!leaf.video) return null;
  
        const filename = leaf.video.split('/').pop();
        return filename?.replace(/\.[^/.]+$/, "");
      })
      .filter(Boolean) as string[];
  
    return {
      id: plant.id,
      name: plant.name,
      fieldId: plant.parentField,
      leaves: leafIds,
    };
  }
  
  function buildFieldArtifact(
    field: FieldAnnotation,
    plantArtifacts: PlantArtifact[]
  ): FieldArtifact {
    const plantIds = plantArtifacts
      .filter((plant) => plant.fieldId === field.id)
      .map((plant) => plant.id);
  
    return {
      id: field.id,
      name: field.name,
      plants: plantIds,
    };
  }

  ////////////////////////////////////////////
  // UPLOAD ARTIFACTS
  ////////////////////////////////////////////

  async function uploadPlantArtifact(
    serverURL: string,
    artifact: PlantArtifact
  ) {
    const res = await apiFetch(`${serverURL}/send/manifest/plant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artifact),
    });
  
    if (!res.ok) {
      throw new Error(`Failed to upload plant ${artifact.id}`);
    }
  }

  async function uploadFieldArtifact(
    serverURL: string,
    artifact: FieldArtifact
  ) {
    const res = await apiFetch(`${serverURL}/send/manifest/field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artifact),
    });
  
    if (!res.ok) {
      throw new Error(`Failed to upload field ${artifact.id}`);
    }
  }

  ////////////////////////////////////////////
  // ORCHESTRATE UPLOADS
  ////////////////////////////////////////////
  
  async function uploadPlantManifest(
    serverURL: string,
    plants: PlantAnnotation[],
    leaves: LeafAnnotation[]
  ) {
    for (const plant of plants) {
      try {
        const artifact = buildPlantArtifact(plant, leaves);
        await uploadPlantArtifact(serverURL, artifact);
      } catch (err) {
        console.error(`Plant ${plant.id} failed:`, err);
        // Continue to next plant
      }
    }
  }

  async function uploadFieldManifest(
    serverURL: string,
    fields: FieldAnnotation[],
    plantArtifacts: PlantArtifact[]
  ) {
    for (const field of fields) {
      try {
        const artifact = buildFieldArtifact(field, plantArtifacts);
        await uploadFieldArtifact(serverURL, artifact);
      } catch (err) {
        console.error(`Field ${field.id} failed:`, err);
      }
    }
  }

  const syncAllManifest = async (
    serverURL: string,
    fields: FieldAnnotation[],
    plants: PlantAnnotation[],
    leaves: LeafAnnotation[]
  ) => {
    // Build all plant artifacts once
    const plantArtifacts = plants.map((plant) =>
      buildPlantArtifact(plant, leaves)
    );
  
    // Upload plants first
    for (const artifact of plantArtifacts) {
      try {
        await uploadPlantArtifact(serverURL, artifact);
      } catch (err) {
        console.error(`Plant ${artifact.id} failed:`, err);
      }
    }
  
    // Then upload fields
    for (const field of fields) {
      try {
        const artifact = buildFieldArtifact(field, plantArtifacts);
        await uploadFieldArtifact(serverURL, artifact);
      } catch (err) {
        console.error(`Field ${field.id} failed:`, err);
      }
    }
  }
  

  return (
    <ManifestSyncContext.Provider value={{ syncAllManifest, lastResult }}>
      {children}
    </ManifestSyncContext.Provider>
  );
};
