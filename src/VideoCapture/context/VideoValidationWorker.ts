import ToolClassifier from '../../Validation/components/ToolClassifier';
import { VideoCapture, ValidationState } from '../types/VideoCaptureTypes';

export const runVideoValidations = async (
  video: VideoCapture
): Promise<VideoCapture> => {

  let toolValidation: ValidationState = 'fail';
  let leafValidation: ValidationState = 'fail';

  try {
    // Single native call
    const res = await ToolClassifier.classifyVideo(video.videoPath);

    /**
     * Expected shape from native:
     * {
     *   tool: { label: string, toolRatio: number },
     *   leaf: { label: string, score: number }
     * }
     */

    console.log("++++++++++")
    if ((res.tool.label == "Tool") && (res.leaf.label != "Traversing")) console.log("<--------------------- HERE")
    console.log(`Video: ${video.videoPath}`)
    console.log(res.tool)
    console.log(res.leaf)

    toolValidation =
      res.tool.label === 'Tool' ? 'pass' : 'fail';

    leafValidation =
      res.leaf.label === 'Traversing' ? 'pass' : 'fail';

  } catch (e) {
    // Explicit fallback — both fail on error
    toolValidation = 'fail';
    leafValidation = 'fail';
  }

  return {
    ...video,
    toolValidation,
    leafValidation,
  };
};