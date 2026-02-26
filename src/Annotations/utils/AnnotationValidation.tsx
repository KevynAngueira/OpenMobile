import { LeafAnnotation } from "../../types/AnnotationTypes";
import { DevFlags } from "../../DevConsole/configs/DevFlagsConfig";

export const isLeafDetailsValid = (length: string, leafNumber: string, leafWidths: string[], directArea?: string, maxLength?: string, maxWidth?: string) => {
    
    const altOriginalArea = DevFlags.isEnabled("altOriginalArea");
    
    const validLength = !!length && !isNaN(parseFloat(length));
    if (!validLength) return false;

    if (!altOriginalArea) {
        // ─────────────────────────────
        // STANDARD MODE
        // ─────────────────────────────
        if (
          leafNumber == null ||
          leafWidths == null ||
          !Array.isArray(leafWidths)
        ) {
          return false;
        }
    
        const validLeafNumber = !!leafNumber && !isNaN(parseInt(leafNumber)) && parseInt(leafNumber) >= 7 && parseInt(leafNumber) <= 21;
        const validWidths = leafWidths.every((w) => w !== '' && !isNaN(parseFloat(w)));
        return validLength && validLeafNumber && validWidths;
    
    } else {
        // ─────────────────────────────
        // ALTERNATIVE MODE
        // ─────────────────────────────

        const validDirect =
        !!directArea && !isNaN(parseFloat(directArea));

        const validMaxLength =
            !!maxLength && !isNaN(parseFloat(maxLength));

        const validMaxWidth =
            !!maxWidth && !isNaN(parseFloat(maxWidth));

        const validLengthWidth =
            validMaxLength && validMaxWidth;

        return validDirect || validLengthWidth;
    }
};

export const isLeafAnnotationComplete = (annotation: LeafAnnotation) => {    
    const validVideo = !!annotation.video;
  
    const validLeaf = isLeafDetailsValid(
      annotation.length,
      annotation.leafNumber,
      annotation.leafWidths,
      annotation.directArea,
      annotation.maxLength,
      annotation.maxWidth
    );
  
    return validVideo && validLeaf;
  };
  