import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ToolClassifier from './ToolClassifier';

type Props = {
  videoPath: string;
};

export default function ToolClassifierView({ videoPath }: Props) {
  const [result, setResult] = useState<null | { label: string; ratio: number }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!videoPath) return;

    let cancelled = false;

    const classifyVideo = async () => {
      setLoading(true);
      setResult(null);
      try {
        const res = await ToolClassifier.classifyVideo(videoPath);
        if (!cancelled) setResult(res);
        console.log('Video classification result:', res);
      } catch (err) {
        console.error('Error classifying video:', err);
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    classifyVideo();

    return () => {
      cancelled = true;
    };
  }, [videoPath]);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="small" color="#0000ff" />}

      {!loading && result && (
        <Text style={styles.resultText}>
          Label: {result.label}{"\n"}
          Ratio: {result.ratio.toFixed(3)}
        </Text>
      )}

      {!loading && !result && (
        <Text style={styles.resultText}>No video selected</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 5, alignItems: 'center' },
  resultText: { marginTop: 12, fontSize: 16, fontWeight: 'bold' },
});
