import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';

// Tool Extractors
import ToolClassifierView from '../../Validation/components/ToolClassifierView'
import ToolCandidateView from '../../Validation/components/ToolCandidateView'
import ToolBatchExtractorView from '../../Validation/components/ToolBatchCandidateView';


export default function DevToolExtractorSection() {
  const [show, setShow] = useState(false);

  const folderPath = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tool Batch Extractor</Text>

      <Button
        title={show ? "Hide Extractor" : "Open Extractor"}
        onPress={() => setShow(!show)}
        color="#4CAF50"
      />

      {show && (
        <View style={styles.extractorContainer}>
          <ToolBatchExtractorView folderPath={folderPath} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  extractorContainer: {
    marginTop: 15,
  },
});
