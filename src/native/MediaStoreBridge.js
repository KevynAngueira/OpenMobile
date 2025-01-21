import { NativeModules } from 'react-native';

const { MediaStoreModule } = NativeModules;

export const getImagesFromSnapmedia = (successCallback, errorCallback) => {
  MediaStoreModule.getImagesFromSnapmedia(successCallback, errorCallback);
};

export const getVideosFromSnapmedia = (successCallback, errorCallback) => {
  MediaStoreModule.getVideosFromSnapmedia(successCallback, errorCallback);
};

