// PermissionsHelper.tsx
import { PermissionsAndroid, Platform } from 'react-native';

export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const permissions =
      Platform.Version >= 33
        ? [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          ]
        : [
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          ];

    try {
      const granted = await PermissionsAndroid.requestMultiple(permissions, {
        title: 'Media Permission',
        message: 'App needs access to your camera and media files (images and videos)',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      const allGranted = Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );

      return allGranted;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  }

  return true; // Assume true for iOS or other platforms
};
