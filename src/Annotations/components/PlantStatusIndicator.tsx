import React from 'react';
import { Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import { SyncEntry } from '../../types/SyncTypes';

export const PlantStatusIndicator = ({ entries }: {
  entries: SyncEntry[];
}) => {
  if (entries.length === 0) {
    return <Ionicons name="circle" size={14} color="orange" />;
  }

  const statuses = entries.map(e => e.inferenceStatus);

  const hasWaiting = statuses.some(s => s === "waiting" || s === "pending");
  const hasRunning = statuses.some(s => s === "running");
  const allCompleted = statuses.every(s => s === "completed");

  if (hasWaiting) return <Ionicons name="close" size={20} color="red" />;
  if (hasRunning) return <Ionicons name="sync" size={20} color="dodgerblue" />;

  if (allCompleted) {
    const values = entries
      .map(e => e.inferenceResponse?.results?.defoliation)
      .filter(v => typeof v === "number");

    const avg = values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;

    return <Text style={{ fontSize: 16, color: 'green' }}>{avg}%</Text>;
  }

  return <Ionicons name="circle" size={14} color="orange" />;
};
