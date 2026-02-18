import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Import Essentials
import { useSync } from '../../Sync/context/SyncContext';
import { useVideoCapture } from '../../VideoCapture/Index';

// Import Configs
import { DevServerConfig } from '../configs/DevServerConfig';

export default function DevResetSection() {
    const { resetAllVideoCaptures } = useVideoCapture();
    const { removeAllSyncEntry } = useSync();

    const handleResetClient = () => {
        Alert.alert(
          "Confirm Reset",
          "Are you sure you want to delete all entries?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", style: "destructive", onPress: () => removeAllSyncEntry() }
          ]
        );
      };
    
    const handleResetCaptures = () => {
        Alert.alert(
          "Confirm Reset",
          "Are you sure you want to delete all validation captures?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", style: "destructive", onPress: () => resetAllVideoCaptures() }
          ]
        );
      };
    
    const handleResetServer = () => {
        const baseURL = DevServerConfig.getBaseURL();
        Alert.alert(
          "Confirm Server Reset",
          "Are you sure you want to reset the server cache?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Yes", 
              style: "destructive", 
              onPress: async () => {
                try {
                  const response = await fetch(`${baseURL}/reset`, {method: "POST"});
                  const data = await response.json();
                  Alert.alert("Server Reset", data.message || "Server cache reset.");
                } catch (err) {
                  Alert.alert("Error", `Failed to reset server: ${err.message}`);
                }
              } 
            }
          ]
        );
      };
      

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reset Tools</Text>

            <View style={styles.row}>
              <TouchableOpacity style={styles.greenButton} onPress={handleResetCaptures}>
                  <Text style={styles.whiteText}>Reset Captures</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.orangeButton} onPress={handleResetClient}>
                  <Text style={styles.whiteText}>Reset Uploads</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.redButton} onPress={handleResetServer}>
                  <Text style={styles.whiteText}>Reset Server</Text>
              </TouchableOpacity>
            </View>
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
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  
  redButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  orangeButton: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  greenButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },

  whiteText: { color: 'white' },
});
