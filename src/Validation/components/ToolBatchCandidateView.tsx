import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ToolClassifier, { ToolClassifierEvents } from './ToolClassifier';

type Props = {
  folderPath: string;
};

export default function ToolBatchExtractorView({ folderPath }: Props) {
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const progressSub = ToolClassifierEvents.addListener(
      'ToolCandidateProgress',
      (e) => {
        setProcessed(e.processed);
        setTotal(e.total);
        setCurrent(e.current);
      }
    );

    const doneSub = ToolClassifierEvents.addListener(
      'ToolCandidateDone',
      (e) => {
        setDone(true);
        console.log('Extraction complete:', e);
      }
    );

    return () => {
      progressSub.remove();
      doneSub.remove();
    };
  }, []);

  const start = () => {
    setProcessed(0);
    setTotal(0);
    setCurrent(null);
    setDone(false);
    ToolClassifier.extractCandidatesFromFolder(folderPath);
  };

  return (
    <View style={styles.container}>
      <Button title="Extract Candidates (Batch)" onPress={start} />

      {total > 0 && (
        <Text style={styles.text}>
          {processed} / {total} videos
        </Text>
      )}

      {current && (
        <Text style={styles.subtext}>
          Current: {current}
        </Text>
      )}

      {done && (
        <Text style={styles.done}>✅ Extraction complete</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  text: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  subtext: { marginTop: 6, fontSize: 14 },
  done: { marginTop: 12, fontSize: 16, color: 'green' }
});
