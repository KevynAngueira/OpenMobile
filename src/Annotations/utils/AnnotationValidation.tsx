import { LeafAnnotation } from "../../types/AnnotationTypes";

export const isLeafDetailsValid = (length: string, leafNumber: string, leafWidths: string[]) => {
    if (
        length == null ||
        leafNumber == null ||
        leafWidths == null ||
        !Array.isArray(leafWidths)
    ) {
        return false;
    }

    const validLength = !!length && !isNaN(parseFloat(length));
    const validLeafNumber = !!leafNumber && !isNaN(parseInt(leafNumber)) && parseInt(leafNumber) >= 7 && parseInt(leafNumber) <= 21;
    const validWidths = leafWidths.every((w) => w !== '' && !isNaN(parseFloat(w)));
    return validLength && validLeafNumber && validWidths;
};

export const isLeafAnnotationComplete = (annotation: LeafAnnotation) => {    
    const validVideo = !!annotation.video;
    const validLeaf = isLeafDetailsValid(
      annotation.length,
      annotation.leafNumber,
      annotation.leafWidths
    );
    return validVideo && validLeaf;
  };
  