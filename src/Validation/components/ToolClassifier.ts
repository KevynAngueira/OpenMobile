import { NativeEventEmitter, NativeModules } from 'react-native';

const { ToolClassifier } = NativeModules;

type ClassificationResult = {
  label: string;
  ratio: number;
};

type CandidateResult = {
  numCandidates: number;
  outputDir: string;
};

export const ToolClassifierEvents =
  new NativeEventEmitter(null);

export default ToolClassifier;