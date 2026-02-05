import { Location } from "../../types/AnnotationTypes";

export type ValidationState = 'pending' | 'pass' | 'fail';

export interface VideoCapture {
  id: string;
  videoPath: string;
  createdAt: number;
  location: Location

  toolValidation: ValidationState;
  leafValidation: ValidationState;
}
