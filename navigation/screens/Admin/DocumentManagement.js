import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal } from "react-native";


export default function DocumentManagement() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Project Blueprint - Floor 1",
      type: "blueprint",
      size: "2.5 MB",
      date: "2024-03-15",
      project: "Downtown Office Complex"
    },
    {
      id: 2,
      name: "Safety Compliance Report",
      type: "report",
      size: "1.2 MB",
      date: "2024-03-20",
      project: "Luxury Apartments"
    }
  ]);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const uploadDocument = () => {
    setUploadModalVisible(true);
  };

  const pickDocument = () => {
    const documentTypes = [
      { type: 'blueprint', name: 'Project Blueprint', ext: '.dwg' },
      { type: 'contract', name: 'Construction Contract', ext: '.pdf' },
      { type: 'permit', name: 'Building Permit', ext: '.pdf' },
      { type: 'safety_report', name: 'Safety Report', ext: '.pdf' },
      { type: 'progress_report', name: 'Progress Report', ext: '.pdf' },
      { type: 'invoice', name: 'Project Invoice', ext: '.pdf' }
    ];
    
    const randomDoc = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    
    const newDoc = {
      id: documents.length + 1,
      name: `${randomDoc.name} ${documents.length + 1}${randomDoc.ext}`,
      type: randomDoc.type,
      size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0],
      project: 'Admin Upload'
    };
    setDocuments([...documents, newDoc]);
    setUploadModalVisible(false);
    Alert.alert('Success', `${randomDoc.name} uploaded successfully`);
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'blueprint': return '📐';
      case 'report': return '📊';
      case 'specification': return '📋';
      case 'contract': return '📄';
      default: return '📁';
    }
  };

  const renderDocument = ({ item }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentIcon}>{getDocumentIcon(item.type)}</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentProject}>{item.project}</Text>
        </View>
      </View>
      <Text style={styles.documentDetails}>{item.size} • {item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📁 Document Management</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadDocument}>
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.length}</Text>
          <Text style={styles.statLabel}>Total Documents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.filter(d => d.type === 'blueprint').length}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
      </View>

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id.toString()}
        style={styles.documentsList}
      />

      <Modal visible={uploadModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Upload Document</Text>
          <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
            <Text style={styles.filePickerText}>📎 Click to Upload Random Document</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setUploadModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
  },
  uploadButton: {
    backgroundColor: "#004AAD",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004AAD",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  documentsList: {
    flex: 1,
  },
  documentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  documentProject: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  documentDetails: {
    fontSize: 12,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f9fc",
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 30,
    textAlign: 'center',
  },
  filePickerButton: {
    backgroundColor: "#004AAD",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});