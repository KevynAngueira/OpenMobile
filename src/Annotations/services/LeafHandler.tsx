// services/leafHandlers.ts
import { Alert } from "react-native";
import { LeafAnnotation } from "../../types/AnnotationTypes";
import uuid from 'react-native-uuid';

// -------------------
// HANDLER FUNCTIONS
// -------------------

// CREATE
export function createLeaf(
  setLeafAnnotations: (a: LeafAnnotation[]) => void,
  newLeaf: LeafAnnotation
): string {

    const nextId = uuid.v4();
    setLeafAnnotations((prev) => {
        const leaf: LeafAnnotation = {
            ...newLeaf,
            id: nextId,
        };
        return [...prev, leaf];
    });
    return nextId;
}


// UPDATE
export function updateLeaf(
  setLeafAnnotations: (a: LeafAnnotation[]) => void,
  newLeaf: LeafAnnotation
){  
    setLeafAnnotations((prev) => {
        const updated = prev.map((ann) => (ann.id === newLeaf.id ? newLeaf : ann));
        return updated;
    });
}


// DELETE
export function deleteLeaf(
  setLeafAnnotations: (a: LeafAnnotation[]) => void,
  leafId: string | null,
  onConfirmed?: () => void
) {
    Alert.alert(
        "Delete Leaf",
        "Are you sure you want to delete this leaf annotation?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    setLeafAnnotations((prev) => {
                        const updated = prev.filter((a) => a.id !== leafId);
                        return updated;
                    });
                    if (onConfirmed) onConfirmed();
                }
            }
        ]
    );
}


// ATTACH VIDEO
export function attachVideo(
    setLeafAnnotations: (a: LeafAnnotation[]) => void,
    leafId: string | null,
    videoPath: string | null
) {
    
    setLeafAnnotations((prev) => {
        return prev.map((ann) => ann.id === leafId ? {...ann, video: videoPath} : ann)
    });
}

// SET PLANT
export function setParentPlant( 
    setLeafAnnotations: (a: LeafAnnotation[]) => void,
    leafId: string | null,
    plantId: string | null
) {
    setLeafAnnotations((prev) => {
        return prev.map((ann) => ann.id === leafId ? {...ann, parentPlant: plantId} : ann)
    });
}