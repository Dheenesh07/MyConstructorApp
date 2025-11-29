import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProjectManagement() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏗️ Project Management</Text>
      <Text style={styles.text}>
        Manage ongoing construction projects, milestones, and progress tracking.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
