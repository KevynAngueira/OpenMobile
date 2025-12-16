// hooks/useAnnotationMaps.ts
import { useMemo } from "react";
import { PlantAnnotation, LeafAnnotation } from "../types/AnnotationTypes";

export function useAnnotationMaps(
  plantAnnotations: PlantAnnotation[],
  leafAnnotations: LeafAnnotation[]
) {
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

  const plantIdToName = (plantId: string | null | undefined): string => {
    if (!plantId) return "None";
    return plantMap[plantId]?.name ?? "Unknown";
  };

  const leafIdToName = (leafId: string | null | undefined): string => {
    if (!leafId) return "None";
    return leafMap[leafId]?.name ?? "Unknown";
  };

  const listToLeaves = (leafList: string[]): LeafAnnotation[] => {
    return leafList
      .map(id => leafMap[id])
      .filter((l): l is LeafAnnotation => !!l);
  };  

  return {
    plantMap,
    leafMap,
    plantIdToName,
    leafIdToName,
    listToLeaves
  };
}
