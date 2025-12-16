import React from 'react';
import { Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import { SyncEntry } from '../../types/SyncTypes';

export const LeafStatusIndicator = ({ entry }: {
  entry: SyncEntry;
}) => {

  const status = entry?.inferenceStatus;
  const value = entry?.inferenceResponse?.results?.defoliation ?? 0

  if (status === 'completed') {
    return <Text style={{ fontSize: 16, color: 'green' }}>{Math.round(value ?? 0)}%</Text>;
  }

  if (status === 'running') {
    return <Ionicons name="sync" size={20} color="dodgerblue" />;
  }

  if (status === 'waiting' || status === 'failed') {
    return <Ionicons name="close" size={20} color="red" />;
  }

  return <Ionicons name="circle" size={14} color="orange" />;
};
