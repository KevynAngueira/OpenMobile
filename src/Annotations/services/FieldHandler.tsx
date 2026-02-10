import { Alert } from "react-native";
import { FieldAnnotation } from "../../types/AnnotationTypes";
import uuid from 'react-native-uuid';

// -------------------
// HANDLER FUNCTIONS
// -------------------


// CREATE
export function createField(
  setFieldAnnotations: (a: FieldAnnotation[]) => void,
  newField: FieldAnnotation
): string {

    const nextId = uuid.v4();
    setFieldAnnotations((prev) => {
        const field: FieldAnnotation = {
            ...newField,
            id: nextId,
        };
        return [...prev, field];
    });
    return nextId;
}

// UPDATE
export function updateField(
  setFieldAnnotations: (a: FieldAnnotation[]) => void,
  newField: FieldAnnotation
) {
    setFieldAnnotations((prev) => {
        const updated = prev.map((ann) => (ann.id === newField.id ? newField : ann));
        return updated;
    });
}

// DELETE
export function deleteField(
  setFieldAnnotations: (a: FieldAnnotation[]) => void,
  fieldId: string | null,
  onConfirmed?: () => void
) {
    Alert.alert(
        "Delete Field",
        "Are you sure you want to delete this field annotation?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    setFieldAnnotations((prev) => {
                        const updated = prev.filter((a) => a.id !== fieldId);
                        return updated;
                    });
                    if (onConfirmed) onConfirmed();
                }
            }
        ]
    );
}

// ATTACH PLANT
export async function attachChildPlant(
  setFieldAnnotations: (f: FieldAnnotation[]) => void,
  fieldId: string | null,
  plantId: string | null
) {
    
    setFieldAnnotations((prev) => {
        const updated = prev.map((f) => {
            if (f.id === fieldId) {
                const updatedPlants = f.childPlants.includes(plantId)
                    ? f.childPlants
                    : [...f.childPlants, plantId];
                return {...f, childPlants: updatedPlants }
            }
            return f;
        })
        return updated;
    });
}

// REMOVE PLANT
export async function removeChildPlant(
    setFieldAnnotations: (a: FieldAnnotation[]) => void,
    fieldId: string | null,
    plantId: string | null
) {
    setFieldAnnotations((prev) => {
        const updated = prev.map((f) => {
            if (f.id === fieldId) {
                console.log(f);
                const updatedPlants = f.childPlants.filter((id) => id !== plantId);
                return {...f, childPlants: updatedPlants }
            }
            return f;
        })
        return updated;
    });
}