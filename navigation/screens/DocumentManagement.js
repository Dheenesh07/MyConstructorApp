import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal, TextInput, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { documentAPI, projectAPI } from "../../utils/api";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DocumentManagement({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    project: '',
    document_type: 'blueprint',
    description: ''
  });

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getAll();
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'blueprint': return 'document-text';
      case 'report': return 'stats-chart';
      case 'specification': return 'clipboard';
      case 'contract': return 'document';
      default: return 'folder';
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
    : documents.filter(doc => (doc.document_type || doc.type) === activeTab);

  const uploadDocument = () => {
    setUploadModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.type === 'success' || !result.canceled) {
        setSelectedFile(result);
        Alert.alert('File Selected', `${result.name || result.assets?.[0]?.name} ready to upload`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!uploadForm.project) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    setLoading(true);
    try {
      const file = selectedFile.assets ? selectedFile.assets[0] : selectedFile;
      const formData = new FormData();
      
      // Get current user ID from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?.user_id || 1;
      
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name
      });
      formData.append('project', String(uploadForm.project));
      formData.append('document_type', uploadForm.document_type);
      formData.append('title', file.name.split('.')[0]);
      formData.append('filename', file.name);
      formData.append('description', uploadForm.description || file.name);
      formData.append('version', '1.0');
      formData.append('uploaded_by', String(userId));

      console.log('Uploading with data:', {
        project: uploadForm.project,
        document_type: uploadForm.document_type,
        filename: file.name,
        uploaded_by: userId
      });

      const response = await documentAPI.upload(formData);
      
      Alert.alert('Success', 'Document uploaded successfully!');
      setUploadModalVisible(false);
      setSelectedFile(null);
      setUploadForm({ project: '', document_type: 'blueprint', description: '' });
      loadDocuments();
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMsg = 'Failed to upload document';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          errorMsg = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join('\n');
        } else {
          errorMsg = String(data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('Upload Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = (doc) => {
    Alert.alert("Download", `Downloading ${doc.file_name || doc.name}...\n\nFile URL: ${doc.file}`);
  };

  const renderDocument = ({ item }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Ionicons name={getDocumentIcon(item.document_type || item.type)} size={24} color="#003366" style={styles.documentIcon} />
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.file_name || item.description || item.name}</Text>
          <Text style={styles.documentProject}>{item.project_name || item.project}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.document_type || item.type) }]}>
          <Text style={styles.typeText}>{(item.document_type || item.type).toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.documentFooter}>
        <Text style={styles.documentDetails}>{item.file_size || item.size} • {item.uploaded_at?.split('T')[0] || item.date}</Text>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => downloadDocument(item)}
        >
          <Text style={styles.downloadText}>📥 Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="folder" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Document Management</Text>
        </View>
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
          <Text style={styles.statNumber}>{documents.filter(d => (d.document_type || d.type) === 'blueprint').length}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents.filter(d => (d.document_type || d.type) === 'report').length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
      </View>

      {/* Documents List */}
      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id.toString()}
        style={styles.documentsList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDocuments} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No documents found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDocuments}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={uploadModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Upload Document</Text>
          
          <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
            <Text style={styles.filePickerText}>
              {selectedFile ? `📎 ${selectedFile.name || selectedFile.assets?.[0]?.name}` : '📎 Select File'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Select Project *</Text>
          <View style={styles.projectList}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectItem,
                  uploadForm.project === project.id && styles.selectedProjectItem
                ]}
                onPress={() => setUploadForm({...uploadForm, project: project.id})}
              >
                <View style={styles.projectItemContent}>
                  <Text style={[
                    styles.projectItemText,
                    uploadForm.project === project.id && styles.selectedProjectItemText
                  ]}>
                    {project.name}
                  </Text>
                  {uploadForm.project === project.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#004AAD" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>



          <Text style={styles.inputLabel}>Document Type *</Text>
          <View style={styles.typeContainer}>
            {['blueprint', 'report', 'specification', 'contract'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  uploadForm.document_type === type && styles.selectedType
                ]}
                onPress={() => setUploadForm({...uploadForm, document_type: type})}
              >
                <Text style={[
                  styles.typeOptionText,
                  uploadForm.document_type === type && styles.selectedTypeText
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={uploadForm.description}
            onChangeText={(text) => setUploadForm({...uploadForm, description: text})}
            multiline
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setUploadModalVisible(false);
                setSelectedFile(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.uploadBtn, loading && styles.disabledButton]} 
              onPress={handleUpload}
              disabled={loading}
            >
              <Text style={styles.uploadBtnText}>{loading ? 'Uploading...' : 'Upload'}</Text>
            </TouchableOpacity>
          </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#004AAD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 10,
    marginTop: 15,
  },
  projectList: {
    marginBottom: 20,
    maxHeight: 200,
  },
  projectItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  selectedProjectItem: {
    borderColor: '#004AAD',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },
  projectItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  projectItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  selectedProjectItemText: {
    color: '#004AAD',
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedType: {
    backgroundColor: '#004AAD',
    borderColor: '#004AAD',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});