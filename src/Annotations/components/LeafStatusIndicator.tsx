import React from 'react';
import { Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import { LeafAnnotation } from '../../types/AnnotationTypes';
import { SyncEntry } from '../../types/SyncTypes';
import {
  getLeafSyncUIState,
  LeafSyncUIConfig
} from '../utils/LeafSyncUIState';

export const LeafStatusIndicator = ({ annotation, entry }: { annotation: LeafAnnotation, entry?: SyncEntry }) => {
  const uiState = getLeafSyncUIState(annotation, entry);
  const config = LeafSyncUIConfig[uiState];

  if (uiState === 'completed') {
    const value =
      entry?.inferenceResponse?.results?.defoliation ?? 0;

    return (
      <Text style={{ fontSize: 16, color: config.color }}>
        {Math.round(value)}%
      </Text>
    );
  }

  return (
    <Ionicons
      name={config.icon!}
      size={18}
      color={config.color}
    />
  );
};
