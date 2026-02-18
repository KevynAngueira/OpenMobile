import { NativeModules } from 'react-native';

const { BuildConfigModule } = NativeModules;

export const isDevMode = BuildConfigModule.isDevMode();
