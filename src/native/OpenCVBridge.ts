import { NativeModules } from 'react-native';
export const { OpenCV } = NativeModules;

export function ping(message: string) {
  return OpenCV.ping(message);
}

export function loadVideoFrames(path: string): Promise<string[]> {
  return OpenCV.loadVideoFrames(path);
}
