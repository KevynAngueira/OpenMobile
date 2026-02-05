import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoCapture } from '../types/VideoCaptureTypes';

const STORAGE_KEY = '@videoCaptures';

export const loadVideoCaptures = async (): Promise<VideoCapture[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load video captures:', error);
    return [];
  }
};

export const saveVideoCaptures = async (captures: VideoCapture[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
  } catch (error) {
    console.error('Failed to save video captures:', error);
  }
};
