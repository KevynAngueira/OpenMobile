// services/leafHandlers.ts
import { Alert } from "react-native";
import { PlantAnnotation } from "../../types/AnnotationTypes";
import uuid from 'react-native-uuid';

// -------------------
// HANDLER FUNCTIONS
// -------------------

// CREATE
export function createPlant(
  setPlantAnnotations: (a: PlantAnnotation[]) => void,
  newPlant: PlantAnnotation
): string {

    const nextId = uuid.v4();
    setPlantAnnotations((prev) => {
        const plant: PlantAnnotation = {
            ...newPlant,
            id: nextId,
        };
        return [...prev, plant];
    });
    return nextId;
}

// UPDATE
export function updatePlant(
  setPlantAnnotations: (a: PlantAnnotation[]) => void,
  newPlant: PlantAnnotation
) {
    setPlantAnnotations((prev) => {
        const updated = prev.map((ann) => (ann.id === newPlant.id ? newPlant : ann));
        return updated;
    });
}

// DELETE
export function deletePlant(
  setPlantAnnotations: (a: PlantAnnotation[]) => void,
  plantId: string | null,
  onConfirmed?: () => void
) {
    Alert.alert(
        "Delete Plant",
        "Are you sure you want to delete this plant annotation?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    setPlantAnnotations((prev) => {
                        const updated = prev.filter((a) => a.id !== plantId);
                        return updated;
                    });
                    if (onConfirmed) onConfirmed();
                }
            }
        ]
    );
}

// ATTACH LEAF
export async function attachChildLeaf(
  setPlantAnnotations: (a: PlantAnnotation[]) => void,
  plantId: string | null,
  leafId: string | null
) {
    
    setPlantAnnotations((prev) => {
        const updated = prev.map((p) => {
            if (p.id === plantId) {
                const updatedLeaves = p.childLeaves.includes(leafId)
                    ? p.childLeaves
                    : [...p.childLeaves, leafId];
                return {...p, childLeaves: updatedLeaves }
            }
            return p;
        })
        return updated;
    });
}

// REMOVE LEAF
export async function removeChildLeaf(
    setPlantAnnotations: (a: PlantAnnotation[]) => void,
    plantId: string | null,
    leafId: string | null
) {
    setPlantAnnotations((prev) => {
        const updated = prev.map((p) => {
            if (p.id === plantId) {
                console.log(p);
                const updatedLeaves = p.childLeaves.filter((id) => id !== leafId);
                return {...p, childLeaves: updatedLeaves }
            }
            return p;
        })
        return updated;
    });
}
