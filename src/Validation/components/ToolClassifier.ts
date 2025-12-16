import { NativeModules } from 'react-native';

type ClassificationResult = {
  label: string;
  ratio: number;
};

type CandidateResult = {
  numCandidates: number;
  outputDir: string;
};

type ToolClassifierType = {
  extractCandidates(videoPath: string): Promise<CandidateResult>;
  classifyVideo(videoPath: string): Promise<ClassificationResult>;
};

export const ToolClassifier = NativeModules.ToolClassifier as ToolClassifierType;
