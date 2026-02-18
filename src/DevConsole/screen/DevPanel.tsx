// DevPanel.tsx
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

// Import Configs
import { canUseDevFlags } from '../configs/DevFlagsConfig';

// Import Sections
import DevExtractorSection from '../components/DevExtractorSection';
import DevFlagsSection from '../components/DevFlagsSection';
import DevServerSection from '../components/DevServerSection';
import DevResetSection from '../components/DevResetSection';

export default function DevPanel() {
  if (!canUseDevFlags) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Developer Panel</Text>

      <DevServerSection/>
      <DevResetSection/>
      <DevFlagsSection/>
      <DevExtractorSection/>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
