import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { materialAPI, projectAPI, taskAPI, userAPI } from '../../utils/api';

export default function MaterialRequests({ route }) {
  const { projectId } = route?.params || {};
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    material_description: '',
    quantity: '',
    unit: '',
    estimated_cost: '',
    urgency: 'medium',
    required_date: '',
    project: '',
    task: '',
    requested_by: ''
  });

  useEffect(() => {
    loadData();
    if (projectId) {
      setRequestForm(prev => ({ ...prev, project: projectId }));
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      const [requestsRes, projectsRes, tasksRes, usersRes] = await Promise.all([
        materialAPI.getRequests(),
        projectAPI.getAll(),
        taskAPI.getAll(),
        userAPI.getAll()
      ]);
      setRequests(requestsRes.data || []);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load material requests');
    }
  };

  const createRequest = async () => {
    if (!requestForm.material_description || !requestForm.quantity || !requestForm.unit || !requestForm.project || !requestForm.requested_by) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        project: parseInt(requestForm.project),
        task: requestForm.task ? parseInt(requestForm.task) : null,
        requested_by: parseInt(requestForm.requested_by),
        material_description: requestForm.material_description,
        quantity: parseFloat(requestForm.quantity),
        unit: requestForm.unit,
        estimated_cost: requestForm.estimated_cost ? parseFloat(requestForm.estimated_cost) : null,
        urgency: requestForm.urgency,
        required_date: requestForm.required_date || null
      };
      const response = await materialAPI.createRequest(payload);
      setRequests([response.data, ...requests]);
      setModalVisible(false);
      setRequestForm({
        material_description: '',
        quantity: '',
        unit: '',
        estimated_cost: '',
        urgency: 'medium',
        required_date: '',
        project: '',
        task: '',
        requested_by: ''
      });
      Alert.alert('Success', `Material request ${response.data.request_id} created successfully!`);
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', `Failed to create request: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveRequest = async (request) => {
    try {
      const payload = {
        status: 'approved',
        approved_by: 1
      };
      const response = await materialAPI.updateRequest(request.id, payload);
      setRequests(requests.map(r => r.id === request.id ? response.data : r));
      Alert.alert('Success', `Request ${request.request_id} approved!`);
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.requestId}>{item.request_id}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
            <Text style={styles.badgeText}>{item.urgency?.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.description}>{item.material_description}</Text>
      <View style={styles.details}>
        <Text style={styles.detailText}>📦 Quantity: {item.quantity} {item.unit}</Text>
        {item.estimated_cost && <Text style={styles.detailText}>💰 Est. Cost: ${item.estimated_cost}</Text>}
        {item.required_date && <Text style={styles.detailText}>📅 Required: {item.required_date}</Text>}
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity style={styles.approveButton} onPress={() => approveRequest(item)}>
          <Text style={styles.approveButtonText}>Approve Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cube" size={24} color="#003366" />
          <Text style={styles.title}>Material Requests</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{requests.length}</Text>
          <Text style={styles.statLabel}>Total Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{requests.filter(r => r.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{requests.filter(r => r.status === 'approved').length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      <FlatList
        data={projectId ? requests.filter(r => r.project === projectId) : requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No material requests found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create Material Request</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.input}
              placeholder="Material Description *"
              value={requestForm.material_description}
              onChangeText={(text) => setRequestForm({...requestForm, material_description: text})}
              multiline
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Quantity *"
                value={requestForm.quantity}
                onChangeText={(text) => setRequestForm({...requestForm, quantity: text})}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Unit *"
                value={requestForm.unit}
                onChangeText={(text) => setRequestForm({...requestForm, unit: text})}
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Estimated Cost"
              value={requestForm.estimated_cost}
              onChangeText={(text) => setRequestForm({...requestForm, estimated_cost: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Required Date (YYYY-MM-DD)"
              value={requestForm.required_date}
              onChangeText={(text) => setRequestForm({...requestForm, required_date: text})}
            />
            
            <Text style={styles.label}>Urgency *</Text>
            <View style={styles.urgencyContainer}>
              {['low', 'medium', 'high'].map((urgency) => (
                <TouchableOpacity
                  key={urgency}
                  style={[styles.urgencyOption, requestForm.urgency === urgency && styles.selectedUrgency]}
                  onPress={() => setRequestForm({...requestForm, urgency})}
                >
                  <Text style={[styles.urgencyText, requestForm.urgency === urgency && styles.selectedUrgencyText]}>
                    {urgency.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Select Project *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.selectOption, requestForm.project === project.id && styles.selectedOption]}
                  onPress={() => setRequestForm({...requestForm, project: project.id})}
                >
                  <Text style={[styles.selectText, requestForm.project === project.id && styles.selectedText]}>
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
                  style={[styles.selectOption, requestForm.task === task.id && styles.selectedOption]}
                  onPress={() => setRequestForm({...requestForm, task: task.id})}
                >
                  <Text style={[styles.selectText, requestForm.task === task.id && styles.selectedText]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.label}>Requested By *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.selectOption, requestForm.requested_by === user.id && styles.selectedOption]}
                  onPress={() => setRequestForm({...requestForm, requested_by: user.id})}
                >
                  <Text style={[styles.selectText, requestForm.requested_by === user.id && styles.selectedText]}>
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
              onPress={createRequest}
              disabled={isSubmitting}
            >
              <Text style={styles.createButtonText}>{isSubmitting ? 'Creating...' : 'Create Request'}</Text>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  addButton: { backgroundColor: '#004AAD', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#004AAD' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  list: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  requestId: { fontSize: 16, fontWeight: '600', color: '#003366' },
  badges: { flexDirection: 'row', gap: 5 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  description: { fontSize: 14, color: '#333', marginBottom: 10 },
  details: { marginBottom: 10 },
  detailText: { fontSize: 12, color: '#666', marginBottom: 4 },
  approveButton: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' },
  approveButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#f5f9fc' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 16, fontWeight: '600', color: '#003366', marginBottom: 10 },
  urgencyContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  urgencyOption: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingVertical: 10, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  selectedUrgency: { backgroundColor: '#004AAD', borderColor: '#004AAD' },
  urgencyText: { fontSize: 14, color: '#666' },
  selectedUrgencyText: { color: '#fff' },
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
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#666' }
});
