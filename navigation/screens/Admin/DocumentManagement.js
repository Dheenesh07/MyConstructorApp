import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, ScrollView } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { projectAPI } from '../../../utils/api';


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
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        const fileSizeInMB = file.size / 1024 / 1024;
        const fileSizeInKB = file.size / 1024;
        
        if (fileSizeInKB < 500) {
          Alert.alert('File Too Small', 'File size must be at least 500 KB');
          return;
        }
        if (fileSizeInMB > 3) {
          Alert.alert('File Too Large', 'File size must not exceed 3 MB');
          return;
        }
        
        setSelectedFile(file);
        if (!documentName.trim()) {
          setDocumentName(file.name.split('.')[0]);
        }
        Alert.alert('File Selected', `${file.name} (${fileSizeInMB.toFixed(2)} MB)`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadDocument = () => {
    setUploadModalVisible(true);
  };

  const saveDocument = () => {
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }
    if (!documentName.trim()) {
      Alert.alert('Error', 'Please enter document name');
      return;
    }

    const selectedProj = projects.find(p => p.id === selectedProject);
    
    const newDoc = {
      id: documents.length + 1,
      name: documentName,
      type: selectedFile.mimeType?.includes('pdf') ? 'report' : 'blueprint',
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      date: new Date().toISOString().split('T')[0],
      project: selectedProj?.name || 'Unknown Project',
      filePath: selectedFile.uri
    };
    setDocuments([...documents, newDoc]);
    setUploadModalVisible(false);
    setDocumentName('');
    setSelectedProject('');
    setSelectedFile(null);
    Alert.alert('Success', 'Document uploaded successfully');
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
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            
            <Text style={styles.label}>Document Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter document name"
              value={documentName}
              onChangeText={setDocumentName}
            />

            <Text style={styles.label}>Select Project *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.projectOption, selectedProject === project.id && styles.selectedProject]}
                  onPress={() => setSelectedProject(project.id)}
                >
                  <Text style={[styles.projectText, selectedProject === project.id && styles.selectedProjectText]}>
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
              <Text style={styles.filePickerText}>📎 {selectedFile ? selectedFile.name : 'Pick File'}</Text>
            </TouchableOpacity>
            <Text style={styles.fileSizeHint}>File size: 500 KB - 3 MB</Text>

            <TouchableOpacity 
              style={[styles.uploadButton, !selectedFile && styles.disabledButton]} 
              onPress={saveDocument}
              disabled={!selectedFile}
            >
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setUploadModalVisible(false);
                setDocumentName('');
                setSelectedProject('');
                setSelectedFile(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: "#f5f9fc",
  },
  modalContent: {
    padding: 20,
    paddingTop: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dce3f0",
    fontSize: 16,
  },
  projectScroll: {
    maxHeight: 30,
    marginBottom: 15,
  },
  projectOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 6,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedProject: {
    backgroundColor: "#004AAD",
    borderColor: "#004AAD",
  },
  projectText: {
    fontSize: 12,
    color: "#666",
  },
  selectedProjectText: {
    color: "#fff",
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 30,
    textAlign: 'center',
  },
  filePickerButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: "#004AAD",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
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
  fileSizeHint: {
    fontSize: 12,
    color: "#666",
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 15,
  },
});