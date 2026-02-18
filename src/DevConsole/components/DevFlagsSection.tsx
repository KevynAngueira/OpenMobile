import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { DevFlags } from '../configs/DevFlagsConfig';

export default function DevFlagsSection() {

  const [flagsState, setFlagsState] = useState(() => DevFlags.get());

  const toggleFlag = (
    key: keyof ReturnType<typeof DevFlags.get>,
    value: boolean
  ) => {
    DevFlags.set(key, value);

    setFlagsState(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Feature Flags</Text>

      {DevFlags.getKeys().map((key) => (
        <View style={styles.toggleRow} key={key}>
          <Text style={styles.toggleLabel}>
            {formatFlagName(key)}
          </Text>
          <Switch
            value={flagsState[key]}
            onValueChange={(val) => toggleFlag(key, val)}
          />
        </View>
      ))}
    </View>
  );
}

function formatFlagName(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLabel: { fontSize: 15 },
});
