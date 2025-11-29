import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal, TextInput } from "react-native";


export default function DocumentManagement({ navigation }) {
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
    },
    {
      id: 3,
      name: "Material Specifications",
      type: "specification",
      size: "800 KB",
      date: "2024-03-18",
      project: "Downtown Office Complex"
    },
    {
      id: 4,
      name: "Electrical Drawings",
      type: "blueprint",
      size: "3.1 MB",
      date: "2024-03-22",
      project: "Luxury Apartments"
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'blueprint': return '📐';
      case 'report': return '📊';
      case 'specification': return '📋';
      case 'contract': return '📄';
      default: return '📁';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'blueprint': return '#007bff';
      case 'report': return '#28a745';
      case 'specification': return '#ffc107';
      case 'contract': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === activeTab);

  const uploadDocument = () => {
    setUploadModalVisible(true);
  };

  const pickDocument = () => {
    const documentTypes = [
      { type: 'blueprint', name: 'Construction Blueprint', ext: '.dwg' },
      { type: 'contract', name: 'Project Contract', ext: '.pdf' },
      { type: 'permit', name: 'Building Permit', ext: '.pdf' },
      { type: 'inspection_report', name: 'Safety Inspection Report', ext: '.pdf' },
      { type: 'specification', name: 'Material Specification', ext: '.pdf' }
    ];
    
    const randomDoc = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    
    const newDoc = {
      id: documents.length + 1,
      name: `${randomDoc.name} ${documents.length + 1}${randomDoc.ext}`,
      type: randomDoc.type,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0],
      project: 'General'
    };
    setDocuments([...documents, newDoc]);
    setUploadModalVisible(false);
    Alert.alert('Success', `${randomDoc.name} uploaded successfully`);
  };

  const downloadDocument = (docName) => {
    Alert.alert("Download", `Downloading ${docName}...`);
  };

  const renderDocument = ({ item }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentIcon}>{getDocumentIcon(item.type)}</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentProject}>{item.project}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.documentFooter}>
        <Text style={styles.documentDetails}>{item.size} • {item.date}</Text>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => downloadDocument(item.name)}
        >
          <Text style={styles.downloadText}>📥 Download</Text>
        </TouchableOpacity>
      </View>
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['all', 'blueprint', 'report', 'specification'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Document Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.length}</Text>
          <Text style={styles.statLabel}>Total Documents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.filter(d => d.type === 'blueprint').length}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.filter(d => d.type === 'report').length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
      </View>

      {/* Documents List */}
      <FlatList
        data={filteredDocuments}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#004AAD",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentDetails: {
    fontSize: 12,
    color: "#666",
  },
  downloadButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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