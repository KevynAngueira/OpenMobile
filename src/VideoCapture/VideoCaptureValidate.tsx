import { Alert } from 'react-native';
import { VideoCapture } from './Index'; 
import { Location } from '../types/AnnotationTypes';

type ValidationPair = {
  status: 'Attachable' | 'Pending' | 'Failed' | 'Location';
  text: string;
};

type ValidationResult = {
  status: 'Attachable' | 'Pending' | 'Failed' | 'Location';
  isValid: boolean
}


/**
 * Validates a video capture and optionally shows an alert/toast
 */
export function validateVideoCapture(
  vc: VideoCapture | undefined,
  location: Location,
  showFeedback: boolean = true
): ValidationResult {
  let pair: ValidationPair = { status: 'Attachable', text: 'Video can be attached' };

  if (!true) {
    pair = { status: 'Location', text: 'Invalid location' };
  }

  if (vc?.toolValidation === 'pending' || vc?.leafValidation === 'pending') {
    pair = { status: 'Pending', text: 'Validation still pending, try again later' };
  } else if (vc?.toolValidation === 'fail' || vc?.leafValidation === 'fail') {
    pair = { status: 'Failed', text: 'Validation failed, you must retake the video' };
  }

  if (showFeedback && pair.status !== 'Attachable') {
    Alert.alert(`Error: ${pair.status}`, pair.text, [{ text: 'Ok', style: 'cancel' }]);
  }

  let result:ValidationResult = { status: pair.status, isValid: (pair.status === "Attachable")}

  return result;
}
