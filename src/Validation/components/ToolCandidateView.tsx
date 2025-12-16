import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ToolClassifier } from './ToolClassifier';

type Props = {
  videoPath: string;
};

type ExtractionResult = {
  numCandidates: number;
  outputDir: string;
};

export default function ToolCandidateView({ videoPath }: Props) {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoPath) return;

    let cancelled = false;

    const extractCandidates = async () => {
      setLoading(true);
      setResult(null);
      setError(null);

      try {
        const res = await ToolClassifier.extractCandidates(videoPath);
        if (!cancelled) {
          setResult(res);
          console.log('Candidate extraction result:', res);
        }
      } catch (err: any) {
        console.error('Error extracting candidates:', err);
        if (!cancelled) {
          setError(err?.message ?? 'Extraction failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    extractCandidates();

    return () => {
      cancelled = true;
    };
  }, [videoPath]);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="small" color="#0000ff" />}

      {!loading && result && (
        <Text style={styles.resultText}>
          Candidates saved: {result.numCandidates}
          {"\n"}
          Output directory:
          {"\n"}
          {result.outputDir}
        </Text>
      )}

      {!loading && error && (
        <Text style={styles.errorText}>
          Error: {error}
        </Text>
      )}

      {!loading && !result && !error && (
        <Text style={styles.resultText}>No video selected</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 5,
    alignItems: 'center',
  },
  resultText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
});
