import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';

// Import Configs
import { DevServerConfig } from '../configs/DevServerConfig';

export default function DevServerSection() {
    const [isCustom, setIsCustom] = useState(
      !DevServerConfig.isUsingDefault()
    );
  
    const [ip, setIP] = useState(DevServerConfig.getIP());
    const [port, setPort] = useState(DevServerConfig.getPort());
  
    function applyDefault() {
      DevServerConfig.useDefault();
      setIP(DevServerConfig.getIP());
      setPort(DevServerConfig.getPort());
      setIsCustom(false);
  
      Alert.alert(
        "Server Updated",
        `Using default server: ${DevServerConfig.getBaseURL()}`
      );
    }
  
    function saveCustomServer() {
      DevServerConfig.setIP(ip);
      DevServerConfig.setPort(port);
      setIsCustom(true);
  
      Alert.alert(
        "Server Updated",
        `Using custom server: ${DevServerConfig.getBaseURL()}`
      );
    }
  
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>
  
        {/* Toggle Buttons */}
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !isCustom && styles.activeButton,
            ]}
            onPress={applyDefault}
          >
            <Text style={styles.whiteText}>Default Server</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isCustom && styles.activeButton,
            ]}
            onPress={() => setIsCustom(true)}
          >
            <Text style={styles.whiteText}>Custom Server</Text>
          </TouchableOpacity>
        </View>
  
        {/* Custom Inputs */}
        {isCustom && (
          <View style={styles.serverBox}>
            <TextInput
              style={styles.input}
              placeholder="IP"
              value={ip}
              onChangeText={setIP}
            />
  
            <TextInput
              style={styles.input}
              placeholder="Port"
              value={port}
              onChangeText={setPort}
              keyboardType="numeric"
            />
  
            <TouchableOpacity
              style={styles.greenButton}
              onPress={saveCustomServer}
            >
              <Text style={styles.whiteText}>Save Custom Server</Text>
            </TouchableOpacity>
          </View>
        )}
  
        <Text style={{ marginTop: 10 }}>
          Current: {DevServerConfig.getBaseURL()}
        </Text>
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
  serverBox: { marginTop: 10 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  greenButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
  },
  whiteText: { color: 'white' },
  
  toggleButton: {
    flex: 1,
    backgroundColor: "#777",
    padding: 10,
    marginRight: 5,
    borderRadius: 6,
    alignItems: "center",
  },
  
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  
});
