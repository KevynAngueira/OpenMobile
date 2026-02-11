// hooks/useAnnotationMaps.ts
import { useMemo } from "react";
import { PlantAnnotation, LeafAnnotation, FieldAnnotation } from "../types/AnnotationTypes";

export function useAnnotationMaps(
  fieldAnnotations: FieldAnnotation[],
  plantAnnotations: PlantAnnotation[],
  leafAnnotations: LeafAnnotation[]
) {
  const fieldMap = useMemo(() => {
    const map: Record<string, FieldAnnotation> = {};
    for (const f of fieldAnnotations) map[f.id] = f;
    return map;
  }, [fieldAnnotations]);
  
  const plantMap = useMemo(() => {
    const map: Record<string, PlantAnnotation> = {};
    for (const p of plantAnnotations) map[p.id] = p;
    return map;
  }, [plantAnnotations]);

  const leafMap = useMemo(() => {
    const map: Record<string, LeafAnnotation> = {};
    for (const l of leafAnnotations) map[l.id] = l;
    return map;
  }, [leafAnnotations]);


  const fieldIdToName = (fieldId: string | undefined): string => {
    if (!fieldId) return "Unkown";
    return fieldMap[fieldId]?.name ?? "Unknown";
  }

  const plantIdToName = (plantId: string): string => {
    if (!plantId) return "Unkown";
    return plantMap[plantId]?.name ?? "Unknown";
  };

  const leafIdToName = (leafId: string): string => {
    if (!leafId) return "Unkown";
    return leafMap[leafId]?.name ?? "Unknown";
  };

  const listToFields = (fieldList: string[]): FieldAnnotation[] => {
    return fieldList
      .map(id => fieldMap[id])
      .filter((f): f is FieldAnnotation => !!f);
  }

  const listToPlants = (plantList: string[]): PlantAnnotation[] => {
    return plantList
      .map(id => plantMap[id])
      .filter((p): p is PlantAnnotation => !!p);
  };  


  const listToLeaves = (leafList: string[]): LeafAnnotation[] => {
    return leafList
      .map(id => leafMap[id])
      .filter((l): l is LeafAnnotation => !!l);
  };
  
  const getHierarchyName = (
    id: string | null,
    type: "field" | "plant" | "leaf",
    viewMode: "field" | "plant" | "leaf"
  ): string => {
    
    if (!id) return "Unknown";
    
    const annMaps = { 'field': fieldMap, 'plant': plantMap, 'leaf': leafMap } as const;
    const parentMap = { 'field': null, 'plant': 'field', 'leaf': 'plant'} as const;
    const attMaps = { 'plant': 'parentField', 'leaf': 'parentPlant' } as const;

    const curr = annMaps[type][id];
    const name = curr?.name ?? "Unknown";

    if (
      (type === "field") || 
      (type === "plant" && viewMode === "field") ||
      (type === "leaf" && (viewMode === "field" || viewMode === "plant"))
    ) {
      return name;
    }

    const parentType = parentMap[type];
    if (!parentType) return name; 

    const parentAtt = attMaps[type as keyof typeof attMaps];
    const parentId = parentAtt ? (curr as any)[parentAtt] : undefined;

    if (!parentId) return name;

    const parentName = getHierarchyName(parentId, parentType, viewMode);
    return `${parentName} > ${name}`;
  }
  
  return {
    fieldMap,
    plantMap,
    leafMap,
    fieldIdToName,
    plantIdToName,
    leafIdToName,
    listToFields,
    listToPlants,
    listToLeaves,
    getHierarchyName
  };
}
