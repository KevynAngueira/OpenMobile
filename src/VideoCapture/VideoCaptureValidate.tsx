import { Alert } from 'react-native';
import { VideoCapture } from './Index'; 
import { DevFlags } from '../DevConsole/configs/DevFlagsConfig';

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
export async function validateVideoCapture(
  vc: VideoCapture | undefined,
  showFeedback: boolean = true
): Promise<ValidationResult> {
  
  let pair: ValidationPair = { status: 'Attachable', text: 'Video can be attached' };

  if (!true) {
    pair = { status: 'Location', text: 'Invalid location' };
  }

  if (vc?.toolValidation === 'pending' || vc?.leafValidation === 'pending') {
    pair = { status: 'Pending', text: 'Validation still pending, try again later' };
  } else if (vc?.toolValidation === 'fail' || vc?.leafValidation === 'fail') {
    pair = { status: 'Failed', text: 'Validation failed, you must retake the video' };
  }

  if (DevFlags.isEnabled('bypassVideoValidation') && showFeedback && pair.status === 'Failed') {
    await new Promise<void>((resolve) => {
      Alert.alert(
        `Bypass Validation?`,
        "This video failed validation.\n\nDo you want to attach it anyway?",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve() },
          {
            text: "Attach Anyway",
            style: "destructive",
            onPress: () => {
              pair = { status: 'Attachable', text: 'Video can be attached' };
              resolve();
            },
          },
        ]
      );
    });
  } else if (showFeedback && pair.status !== 'Attachable') {
    await new Promise<void>((resolve) => {
      Alert.alert(`Error: ${pair.status}`, pair.text, [{ text: 'Ok', style: 'cancel', onPress: () => resolve() }]);
    });
  }

  return { status: pair.status, isValid: pair.status === "Attachable" };
}
