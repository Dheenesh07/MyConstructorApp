import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { communicationAPI, projectAPI, taskAPI, userAPI } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunicationCenter() {
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageForm, setMessageForm] = useState({
    receivers: [],
    project: '',
    task: '',
    message_type: 'progress_update',
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadCurrentUser();
    loadData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    try {
      const [messagesRes, projectsRes, tasksRes, usersRes] = await Promise.all([
        communicationAPI.getAll(),
        projectAPI.getAll(),
        taskAPI.getAll(),
        userAPI.getAll()
      ]);
      setMessages(messagesRes.data || []);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageForm.subject || !messageForm.message || messageForm.receivers.length === 0) {
      Alert.alert('Error', 'Please fill required fields and select at least one receiver');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        sender: currentUser?.id || 1,
        receivers: messageForm.receivers,
        project: messageForm.project ? parseInt(messageForm.project) : null,
        task: messageForm.task ? parseInt(messageForm.task) : null,
        message_type: messageForm.message_type,
        subject: messageForm.subject,
        message: messageForm.message
      };
      const response = await communicationAPI.send(payload);
      setMessages([response.data, ...messages]);
      setModalVisible(false);
      setMessageForm({
        receivers: [],
        project: '',
        task: '',
        message_type: 'progress_update',
        subject: '',
        message: ''
      });
      Alert.alert('Success', 'Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', `Failed to send: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReceiver = (userId) => {
    setMessageForm(prev => ({
      ...prev,
      receivers: prev.receivers.includes(userId)
        ? prev.receivers.filter(id => id !== userId)
        : [...prev.receivers, userId]
    }));
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'progress_update': return 'trending-up';
      case 'safety_alert': return 'warning';
      case 'issue_report': return 'alert-circle';
      case 'general': return 'chatbubble';
      default: return 'mail';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'progress_update': return '#2196F3';
      case 'safety_alert': return '#FF5722';
      case 'issue_report': return '#FF9800';
      default: return '#666';
    }
  };

  const renderMessage = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getMessageColor(item.message_type) + '20' }]}>
          <Ionicons name={getMessageIcon(item.message_type)} size={24} color={getMessageColor(item.message_type)} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.type}>{item.message_type?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.metadata}>
        <Text style={styles.metaText}>From: User {item.sender}</Text>
        <Text style={styles.metaText}>To: {item.receivers?.length || 0} recipients</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Communications</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Send Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{messages.length}</Text>
          <Text style={styles.statLabel}>Total Messages</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{messages.filter(m => m.message_type === 'progress_update').length}</Text>
          <Text style={styles.statLabel}>Updates</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{messages.filter(m => m.message_type === 'safety_alert').length}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Send Message</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.input}
              placeholder="Subject *"
              value={messageForm.subject}
              onChangeText={(text) => setMessageForm({...messageForm, subject: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Message *"
              value={messageForm.message}
              onChangeText={(text) => setMessageForm({...messageForm, message: text})}
              multiline
            />
            
            <Text style={styles.label}>Message Type *</Text>
            <View style={styles.typeContainer}>
              {['progress_update', 'safety_alert', 'issue_report', 'general'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, messageForm.message_type === type && styles.selectedType]}
                  onPress={() => setMessageForm({...messageForm, message_type: type})}
                >
                  <Text style={[styles.typeText, messageForm.message_type === type && styles.selectedTypeText]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Select Recipients *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.selectOption, messageForm.receivers.includes(user.id) && styles.selectedOption]}
                  onPress={() => toggleReceiver(user.id)}
                >
                  <Text style={[styles.selectText, messageForm.receivers.includes(user.id) && styles.selectedText]}>
                    {user.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.label}>Select Project (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.selectOption, messageForm.project === project.id && styles.selectedOption]}
                  onPress={() => setMessageForm({...messageForm, project: project.id})}
                >
                  <Text style={[styles.selectText, messageForm.project === project.id && styles.selectedText]}>
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
                  style={[styles.selectOption, messageForm.task === task.id && styles.selectedOption]}
                  onPress={() => setMessageForm({...messageForm, task: task.id})}
                >
                  <Text style={[styles.selectText, messageForm.task === task.id && styles.selectedText]}>
                    {task.title}
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
              onPress={sendMessage}
              disabled={isSubmitting}
            >
              <Text style={styles.createButtonText}>{isSubmitting ? 'Sending...' : 'Send Message'}</Text>
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
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  subject: { fontSize: 16, fontWeight: '600', color: '#003366', marginBottom: 4 },
  type: { fontSize: 10, color: '#004AAD', fontWeight: '600' },
  message: { fontSize: 14, color: '#333', marginBottom: 10, lineHeight: 20 },
  metadata: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#666' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#666' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#f5f9fc' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  textArea: { height: 100, textAlignVertical: 'top' },
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
  createButtonText: { color: '#fff', fontWeight: '600' }
});