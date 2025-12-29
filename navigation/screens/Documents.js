import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { documentAPI, projectAPI, taskAPI, userAPI } from '../../utils/api';

export default function Documents({ route }) {
  const { projectId } = route?.params || {};
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docForm, setDocForm] = useState({
    project: '',
    task: '',
    document_type: 'blueprint',
    title: '',
    filename: '',
    file_path: '',
    version: '1.0',
    description: '',
    uploaded_by: '',
    selectedFile: null
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        setDocForm({...docForm, filename: file.name, selectedFile: file, title: docForm.title || file.name.split('.')[0]});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  useEffect(() => {
    loadData();
    if (projectId) {
      setDocForm(prev => ({ ...prev, project: projectId }));
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      const [docsRes, projectsRes, tasksRes, usersRes] = await Promise.all([
        documentAPI.getAll(),
        projectAPI.getAll(),
        taskAPI.getAll(),
        userAPI.getAll()
      ]);
      console.log('Documents loaded:', docsRes.data?.length || 0);
      const validDocs = (docsRes.data || []).filter(doc => doc && doc.id);
      setDocuments(validDocs);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents. Please check your connection.');
    }
  };

  const createDocument = async () => {
    if (!docForm.project || !docForm.title || !docForm.filename || !docForm.uploaded_by) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        project: parseInt(docForm.project),
        task: docForm.task ? parseInt(docForm.task) : null,
        document_type: docForm.document_type,
        title: docForm.title,
        filename: docForm.filename,
        file_path: docForm.file_path || `/documents/${docForm.document_type}/${docForm.filename}`,
        version: docForm.version,
        description: docForm.description,
        uploaded_by: parseInt(docForm.uploaded_by)
      };
      const response = await documentAPI.create(payload);
      setDocuments([response.data, ...documents]);
      setModalVisible(false);
      setDocForm({
        project: projectId || '',
        task: '',
        document_type: 'blueprint',
        title: '',
        filename: '',
        file_path: '',
        version: '1.0',
        description: '',
        uploaded_by: ''
      });
      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error) {
      console.error('Error creating document:', error);
      Alert.alert('Error', `Failed to upload: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'blueprint': return 'document-text';
      case 'safety_report': return 'shield-checkmark';
      case 'contract': return 'document-attach';
      case 'permit': return 'checkmark-circle';
      default: return 'document';
    }
  };

  const handleDownload = async (document) => {
    try {
      const fileUrl = `https://construct.velandev.in${document.file_path}`;
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const renderDocument = ({ item }) => {
    if (!item || !item.id) return null;
    return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getDocIcon(item.document_type)} size={24} color="#004AAD" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.filename}>{item.filename}</Text>
          <Text style={styles.type}>{item.document_type?.replace('_', ' ').toUpperCase()}</Text>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
          <Text style={styles.version}>Version: {item.version}</Text>
        </View>
        <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item)}>
          <Ionicons name="download-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📄 Documents</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents?.length || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents?.filter(d => d?.document_type === 'blueprint').length || 0}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documents?.filter(d => d?.document_type === 'safety_report').length || 0}</Text>
          <Text style={styles.statLabel}>Safety</Text>
        </View>
      </View>

      <FlatList
        data={projectId ? documents.filter(d => d.project === projectId) : documents}
        renderItem={renderDocument}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Upload Document</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
              <Ionicons name="cloud-upload-outline" size={24} color="#004AAD" />
              <Text style={styles.filePickerText}>{docForm.selectedFile ? docForm.selectedFile.name : 'Pick a file'}</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Document Title *"
              value={docForm.title}
              onChangeText={(text) => setDocForm({...docForm, title: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Filename *"
              value={docForm.filename}
              editable={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="File Path (optional)"
              value={docForm.file_path}
              onChangeText={(text) => setDocForm({...docForm, file_path: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Version"
              value={docForm.version}
              onChangeText={(text) => setDocForm({...docForm, version: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={docForm.description}
              onChangeText={(text) => setDocForm({...docForm, description: text})}
              multiline
            />
            
            <Text style={styles.label}>Document Type *</Text>
            <View style={styles.typeContainer}>
              {['blueprint', 'safety_report', 'contract', 'permit'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, docForm.document_type === type && styles.selectedType]}
                  onPress={() => setDocForm({...docForm, document_type: type})}
                >
                  <Text style={[styles.typeText, docForm.document_type === type && styles.selectedTypeText]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Select Project *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.selectOption, docForm.project === project.id && styles.selectedOption]}
                  onPress={() => setDocForm({...docForm, project: project.id})}
                >
                  <Text style={[styles.selectText, docForm.project === project.id && styles.selectedText]}>
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.label}>Select Task (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.selectOption, docForm.task === task.id && styles.selectedOption]}
                  onPress={() => setDocForm({...docForm, task: task.id})}
                >
                  <Text style={[styles.selectText, docForm.task === task.id && styles.selectedText]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.label}>Uploaded By *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.selectOption, docForm.uploaded_by === user.id && styles.selectedOption]}
                  onPress={() => setDocForm({...docForm, uploaded_by: user.id})}
                >
                  <Text style={[styles.selectText, docForm.uploaded_by === user.id && styles.selectedText]}>
                    {user.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, isSubmitting && { opacity: 0.6 }]} 
              onPress={createDocument}
              disabled={isSubmitting}
            >
              <Text style={styles.createButtonText}>{isSubmitting ? 'Uploading...' : 'Upload'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9fc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  addButton: { backgroundColor: '#004AAD', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#004AAD' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  list: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row' },
  iconContainer: { marginRight: 15, justifyContent: 'center' },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#003366', marginBottom: 4 },
  filename: { fontSize: 12, color: '#666', marginBottom: 4 },
  type: { fontSize: 10, color: '#004AAD', fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 12, color: '#333', marginBottom: 4 },
  version: { fontSize: 11, color: '#999' },
  downloadButton: { backgroundColor: '#004AAD', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#666' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#f5f9fc' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 16, fontWeight: '600', color: '#003366', marginBottom: 10 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  typeOption: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  selectedType: { backgroundColor: '#004AAD', borderColor: '#004AAD' },
  typeText: { fontSize: 12, color: '#666' },
  selectedTypeText: { color: '#fff' },
  horizontalScroll: { flexGrow: 0, marginBottom: 15 },
  selectOption: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  selectedOption: { backgroundColor: '#004AAD', borderColor: '#004AAD' },
  selectText: { fontSize: 14, color: '#666' },
  selectedText: { color: '#fff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: '#6c757d', padding: 15, borderRadius: 8, marginRight: 10, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: '600' },
  createButton: { flex: 1, backgroundColor: '#004AAD', padding: 15, borderRadius: 8, marginLeft: 10, alignItems: 'center' },
  createButtonText: { color: '#fff', fontWeight: '600' },
  filePickerButton: { backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#004AAD', borderStyle: 'dashed', borderRadius: 8, padding: 20, marginBottom: 15, alignItems: 'center' },
  filePickerText: { color: '#004AAD', fontSize: 14, fontWeight: '600', marginTop: 8 }
});
