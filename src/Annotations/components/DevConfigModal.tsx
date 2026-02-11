import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Button,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;

  handleResetClient: () => void;
  handleResetServer: () => void;
  handleResetCaptures: () => void;

  showServerSettings: boolean;
  setShowServerSettings: (v: boolean) => void;

  ip: string;
  port: string;
  setIP: (v: string) => void;
  setPort: (v: string) => void;
  saveServerSettings: (ip: string, port: string) => void;

  extractorComponent: React.ReactNode;
}

const DevConfigModal: React.FC<Props> = ({
  visible,
  onClose,
  handleResetClient,
  handleResetServer,
  handleResetCaptures,
  showServerSettings,
  setShowServerSettings,
  ip,
  port,
  setIP,
  setPort,
  saveServerSettings,
  extractorComponent,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Developer Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Reset Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              <TouchableOpacity style={styles.redButton} onPress={handleResetClient}>
                <Text style={styles.whiteText}>Reset Entries</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.orangeButton} onPress={handleResetServer}>
                <Text style={styles.whiteText}>Reset Server</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.redButton} onPress={handleResetCaptures}>
                <Text style={styles.whiteText}>Reset Captures</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={showServerSettings ? 'Hide Server Settings' : 'Enter Server Settings'}
              onPress={() => setShowServerSettings(!showServerSettings)}
              color="#4CAF50"
            />

            {showServerSettings && (
              <View style={styles.serverBox}>
                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                  Server Settings
                </Text>

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
                  onPress={() => saveServerSettings(ip, port)}
                >
                  <Text style={styles.whiteText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Batch Extractor */}
            <View style={styles.extractorContainer}>
              {extractorComponent}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DevConfigModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginTop: 60,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  serverBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  extractorContainer: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 5,
    borderRadius: 6,
  },
  redButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  orangeButton: {
    backgroundColor: "#FF9800",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  greenButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  whiteText: {
    color: "white",
  },
});
