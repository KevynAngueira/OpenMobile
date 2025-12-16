// LeafAnnotationList.tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/material-icons';
import Video from 'react-native-video';

import { LeafStatusIndicator } from './LeafStatusIndicator';
import { LeafAnnotation, LeafCallbacks } from '../../types/AnnotationTypes';

interface LeafAnnotationListProps {
  plantId: string;
  leafAnnotations: LeafAnnotation[];
  leafCallbacks: LeafCallbacks;
}

const LeafAnnotationList = (props: LeafAnnotationListProps) => {
  const { plantId, leafAnnotations, leafCallbacks } = props;
  const [expandedAnnotation, setExpandedAnnotation] = useState<any>(null);
  const [activeView, setActiveView] = useState<"video" | "info" | "results">("video");

  const handleToggleDropdown = (annotation: any) => {
    setExpandedAnnotation(expandedAnnotation?.id === annotation.id ? null : annotation);
  };
  
  return (
    <ScrollView>

      {/* Create Leaf Annotation Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => {
          leafCallbacks.onEditButton(null, plantId);
        }}>
        <Text style={styles.addButtonText}>+ Add Leaf Annotation</Text>
      </TouchableOpacity>

      {leafAnnotations
        .slice()
        .sort((a, b) => Number(a.leafNumber) - Number(b.leafNumber))
        .map((leaf) => {

        const syncEntry = leafCallbacks.getSyncEntry(leaf.video);
        
        return (
          <View key={leaf.id} style={styles.annotationContainer}>
            <TouchableOpacity
              onPress={() => handleToggleDropdown(leaf)}
              style={styles.annotationHeader}
            >
              <Text style={styles.annotationTitle}>{leaf.name}</Text>
              <LeafStatusIndicator
                  entry={syncEntry}
                />
            </TouchableOpacity>

            {expandedAnnotation?.id === leaf.id && (
              <View style={styles.dropdown}>
               
                <View style={styles.toggleRow}>
                  {["video", "info", "results"].map(key => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.toggleButton,
                        activeView === key && styles.toggleButtonActive
                      ]}
                      onPress={() => setActiveView(key)}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          activeView === key && styles.toggleButtonTextActive
                        ]}
                      >
                        {key.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.segmentCard}>
                  {/* VIDEO TAB */}
                  {activeView === "video" && (
                    <View>
                      <View style={styles.tabContent}>
                        <Text style={styles.tabTitle}>Video</Text>
                        {leaf.video ? (
                          <Video
                            source={{ uri: leaf.video }} 
                            style={styles.videoPlayer}
                            controls={true}
                            resizeMode="contain"
                            paused={false}
                          />
                        ) : (
                          <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderText}>Video Not Chosen</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.attachButton}
                        onPress={() => leafCallbacks.onAttachVideo(leaf)}
                        >
                        <Text style={styles.attachButtonText}>Attach Video</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* INFO TAB */}
                  {activeView === "info" && (
                    <View>
                      <View style={styles.tabContent}>
                        <Text style={styles.tabTitle}>Leaf Information</Text>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Info:</Text>
                          <Text style={styles.infoValue}>{leaf.info || "—"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Location:</Text>
                          <Text style={styles.infoValue}>
                            {leaf.location?.latitude ?? "—"}, {leaf.location?.longitude ?? "—"}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Length:</Text>
                          <Text style={styles.infoValue}>{leaf.length}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Leaf Number:</Text>
                          <Text style={styles.infoValue}>{leaf.leafNumber}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Widths:</Text>
                          <Text style={styles.infoValue}>{leaf.leafWidths?.join(", ")}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>  leafCallbacks.onEditButton(leaf, plantId)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* RESULTS TAB */}
                  {activeView === "results" && (
                    <View>
                      <View style={styles.tabContent}>
                        <Text style={styles.tabTitle}>Results</Text>
                        {syncEntry ? (
                          <View style={styles.placeholderContainer}>
                            <Text style={styles.resultValue}>{JSON.stringify(syncEntry.inferenceResponse)}</Text>
                          </View>
                        ): (
                          <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderText}>Results Unavailable</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => leafCallbacks.onDeleteAnnotation(leaf)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};


const styles = StyleSheet.create({

  // Add Annotation Button
  addButton: {
    backgroundColor: '#1E3A5F',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },

  // Annotation Container + Annotations
  annotationContainer: {
    marginBottom: 10,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  annotationTitle: {
    fontSize: 18,
    flex: 1,
    color: '#333',
    fontWeight: '800',
  },

  dropdown: {
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    borderColor: '#DDDDDD',
    borderWidth: 1,
  },

  // Delete Annotation Button
  attachButton: {
    backgroundColor: '#1E3A5F',
    padding: 9,
    borderRadius: 5,
    marginTop: 8,
  },
  attachButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  // Edit Annotation Button
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 9,
    borderRadius: 5,
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  // Delete Annotation Button
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 9,
    borderRadius: 5,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  // Attached Video
  videoText: {
    marginTop: 5,
    fontSize: 16,
  },
  videoContainer: {
    marginTop: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#e5e5e5",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#1E3A5F",
  },
  toggleButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },

  // Placehoder 
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 160, 
  },
  
  placeholderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
  },

  // Tab Managers
  segmentCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
  },

  tabContent: {
    minHeight: 240,
    paddingVertical: 4,
  },

  tabTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },

  resultValue: {
    fontWeight: "500",
    color: "#222",
    fontSize: 18,
    textAlign: "center",
  },

  // Info
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: "800",
    color: "#444",
    fontSize: 18,
    width: 120,
  },
  infoValue: {
    flex: 1,
    color: "#222",
    fontSize: 18,
  },
});

export default LeafAnnotationList;

