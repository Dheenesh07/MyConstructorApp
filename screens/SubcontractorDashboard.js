import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskAPI, attendanceAPI, documentAPI, invoiceAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function SubcontractorDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [complianceDocuments, setComplianceDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('progress');
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressReport, setProgressReport] = useState('');
  const [timeEntry, setTimeEntry] = useState({ hours: '', description: '' });
  const [messageForm, setMessageForm] = useState({ recipient: '', subject: '', message: '' });
  const [invoiceForm, setInvoiceForm] = useState({ task: '', amount: '', description: '' });
  const [complianceForm, setComplianceForm] = useState({ title: '', type: 'Insurance', expiryDate: '' });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadTasks();
      loadTimeEntries();
      loadDocuments();
      loadInvoices();
      loadComplianceDocuments();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getByUser(user?.id);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([
        {
          id: 1,
          title: 'Foundation Work - Block A',
          description: 'Complete foundation excavation and concrete pouring',
          status: 'in_progress',
          priority: 'high',
          due_date: '2024-01-15',
          progress: 65,
          location: 'Site A - Block A',
          created_by_name: 'John Smith'
        }
      ]);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const response = await attendanceAPI.getByUser(user?.id);
      setTimeEntries(response.data.map(entry => ({
        id: entry.id,
        date: entry.date,
        hours: entry.hours_worked || 8,
        task: entry.task_description || 'General Work',
        description: entry.notes || ''
      })));
    } catch (error) {
      console.error('Error loading time entries:', error);
      setTimeEntries([
        { id: 1, date: '2024-01-12', hours: 8, task: 'Foundation Work', description: 'Excavation work' }
      ]);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getAll();
      setDocuments(response.data.map(doc => ({
        id: doc.id,
        name: doc.title,
        type: doc.file_type || 'PDF',
        size: doc.file_size || 'Unknown',
        date: doc.uploaded_at?.split('T')[0] || doc.created_at?.split('T')[0]
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([
        { id: 1, name: 'Foundation Blueprint - Block A', type: 'PDF', size: '2.4 MB', date: '2024-01-08' }
      ]);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data.map(invoice => ({
        id: invoice.id,
        invoiceNo: invoice.invoice_number,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.created_at?.split('T')[0],
        task: invoice.description || 'Work Completed'
      })));
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([
        { id: 1, invoiceNo: 'INV-2024-001', amount: 15000, status: 'approved', date: '2024-01-08', task: 'Plumbing Work' }
      ]);
    }
  };
  const toggleMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
      Animated.timing(menuAnim, {
        toValue: -width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuClick = (page) => {
    toggleMenu();
    setActivePage(page);
  };

  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      await taskAPI.update(taskId, {
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : 'in_progress'
      });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, progress: newProgress, status: newProgress === 100 ? 'completed' : 'in_progress' } : task
      ));
      Alert.alert('Success', 'Task progress updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task progress');
    }
  };

  const openModal = (type, task = null) => {
    setModalType(type);
    setSelectedTask(task);
    setModalVisible(true);
  };

  const submitForm = () => {
    switch (modalType) {
      case 'progress':
        return submitProgressReport();
      case 'message':
        return submitMessage();
      case 'invoice':
        return submitInvoice();
      case 'compliance':
        return submitCompliance();
      default:
        return;
    }
  };

  const submitProgressReport = () => {
    if (!progressReport.trim()) {
      Alert.alert('Error', 'Please enter progress details');
      return;
    }
    Alert.alert('Success', 'Progress report submitted successfully!');
    setProgressReport('');
    setModalVisible(false);
  };

  const submitMessage = () => {
    if (!messageForm.recipient || !messageForm.subject || !messageForm.message) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    Alert.alert('Success', 'Message sent successfully!');
    setMessageForm({ recipient: '', subject: '', message: '' });
    setModalVisible(false);
  };

  const submitInvoice = () => {
    if (!invoiceForm.task || !invoiceForm.amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newInvoice = {
      id: invoices.length + 1,
      invoiceNo: `INV-2024-${String(invoices.length + 2).padStart(3, '0')}`,
      amount: parseFloat(invoiceForm.amount),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      task: invoiceForm.task
    };
    setInvoices([newInvoice, ...invoices]);
    setInvoiceForm({ task: '', amount: '', description: '' });
    setModalVisible(false);
    Alert.alert('Success', 'Invoice created successfully!');
  };
  const loadComplianceDocuments = () => {
    setComplianceDocuments([
      {
        id: 1,
        title: 'General Liability Insurance',
        type: 'Insurance',
        status: 'Valid',
        expiryDate: '2024-12-31',
        details: 'Coverage: $2M'
      },
      {
        id: 2,
        title: 'OSHA 30-Hour Certification',
        type: 'Certification',
        status: 'Valid',
        expiryDate: '2025-03-15',
        details: 'Certificate #: OSH-2024-001'
      },
      {
        id: 3,
        title: 'Workers Compensation',
        type: 'Insurance',
        status: 'Expiring Soon',
        expiryDate: '2024-02-28',
        details: 'Renewal Required'
      }
    ]);
  };

  const submitCompliance = () => {
    if (!complianceForm.title || !complianceForm.expiryDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    const newDocument = {
      id: complianceDocuments.length + 1,
      title: complianceForm.title,
      type: complianceForm.type,
      status: 'Valid',
      expiryDate: complianceForm.expiryDate,
      details: `Uploaded: ${new Date().toLocaleDateString()}`
    };
    
    setComplianceDocuments([newDocument, ...complianceDocuments]);
    Alert.alert('Success', 'Compliance document uploaded successfully!');
    setComplianceForm({ title: '', type: 'Insurance', expiryDate: '' });
    setModalVisible(false);
  };

  const logTime = async () => {
    if (!timeEntry.hours || !timeEntry.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const response = await attendanceAPI.checkIn({
        user: user.id,
        project: selectedTask?.project || 1,
        hours_worked: parseFloat(timeEntry.hours),
        task_description: selectedTask?.title || 'General Work',
        notes: timeEntry.description
      });
      const newEntry = {
        id: response.data.id,
        date: new Date().toISOString().split('T')[0],
        hours: parseFloat(timeEntry.hours),
        task: selectedTask?.title || 'General Work',
        description: timeEntry.description
      };
      setTimeEntries([newEntry, ...timeEntries]);
      setTimeEntry({ hours: '', description: '' });
      Alert.alert('Success', 'Time entry logged successfully!');
    } catch (error) {
      console.error('Error logging time:', error);
      Alert.alert('Error', 'Failed to log time entry');
    }
  };
  const renderContent = () => {
    switch (activePage) {
      case "Assigned Tasks":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🧱 Assigned Tasks</Text>
              <Text style={styles.taskCount}>{tasks.length} Active Tasks</Text>
            </View>
            
            {tasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: task.status === 'Completed' ? '#4CAF50' : task.status === 'In Progress' ? '#FF9800' : '#9E9E9E' }]}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.taskDescription}>{task.description}</Text>
                
                <View style={styles.taskDetails}>
                  <View style={styles.taskDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>{task.location}</Text>
                  </View>
                  <View style={styles.taskDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>Due: {task.dueDate}</Text>
                  </View>
                  <View style={styles.taskDetailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>{task.assignedBy}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress: {task.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                  </View>
                </View>
                
                <View style={styles.taskActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openModal('progress', task)}
                  >
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Report Progress</Text>
                  </TouchableOpacity>
                  
                  {task.status !== 'Completed' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => updateTaskProgress(task.id, 100)}
                    >
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );
      case "Progress Reports":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📸 Progress Reports</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('progress')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New Report</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Foundation Work - Block A</Text>
                <Text style={styles.reportDate}>Jan 12, 2024</Text>
              </View>
              <Text style={styles.reportDescription}>Completed 65% of foundation work. Concrete pouring in progress.</Text>
              <View style={styles.reportImages}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Photo 1</Text>
                </View>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Photo 2</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Plumbing Installation</Text>
                <Text style={styles.reportDate}>Jan 10, 2024</Text>
              </View>
              <Text style={styles.reportDescription}>All bathroom fixtures installed successfully. Quality check completed.</Text>
              <View style={styles.reportImages}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Before</Text>
                </View>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>After</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );
      case "Documents":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📂 Documents</Text>
              <Text style={styles.documentCount}>{documents.length} Documents</Text>
            </View>
            
            {documents.map(doc => (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Ionicons 
                    name={doc.type === 'PDF' ? 'document-text-outline' : 'document-outline'} 
                    size={24} 
                    color="#003366" 
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentDetails}>{doc.type} • {doc.size} • {doc.date}</Text>
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons name="download-outline" size={20} color="#003366" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );
      case "Time Logging":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🕒 Time Logging</Text>
              <Text style={styles.totalHours}>Total This Week: {timeEntries.reduce((sum, entry) => sum + entry.hours, 0)} hrs</Text>
            </View>
            
            <View style={styles.timeEntryForm}>
              <Text style={styles.formTitle}>Log New Time Entry</Text>
              <TextInput
                style={styles.input}
                placeholder="Hours worked (e.g., 8.5)"
                value={timeEntry.hours}
                onChangeText={(text) => setTimeEntry({...timeEntry, hours: text})}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Work description..."
                value={timeEntry.description}
                onChangeText={(text) => setTimeEntry({...timeEntry, description: text})}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.submitButton} onPress={logTime}>
                <Text style={styles.submitButtonText}>Log Time</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Recent Time Entries</Text>
            {timeEntries.map(entry => (
              <View key={entry.id} style={styles.timeEntryCard}>
                <View style={styles.timeEntryHeader}>
                  <Text style={styles.timeEntryDate}>{entry.date}</Text>
                  <Text style={styles.timeEntryHours}>{entry.hours} hrs</Text>
                </View>
                <Text style={styles.timeEntryTask}>{entry.task}</Text>
                <Text style={styles.timeEntryDescription}>{entry.description}</Text>
              </View>
            ))}
          </ScrollView>
        );
      case "Communication":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💬 Messages</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('message')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New Message</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>John Smith (PM)</Text>
                <Text style={styles.messageTime}>2 hours ago</Text>
              </View>
              <Text style={styles.messageSubject}>Foundation Work Update Required</Text>
              <Text style={styles.messageContent}>Please provide an update on the foundation work progress. We need photos of the completed sections.</Text>
              <TouchableOpacity style={styles.replyButton}>
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>Safety Officer</Text>
                <Text style={styles.messageTime}>1 day ago</Text>
              </View>
              <Text style={styles.messageSubject}>Safety Reminder</Text>
              <Text style={styles.messageContent}>Please ensure all workers are wearing proper PPE. Safety inspection scheduled for tomorrow.</Text>
            </View>
          </ScrollView>
        );
      case "Compliance":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📜 Compliance</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('compliance')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
            
            {complianceDocuments.map(doc => (
              <View key={doc.id} style={styles.complianceCard}>
                <View style={styles.complianceHeader}>
                  <Ionicons 
                    name={doc.type === 'Insurance' ? 'shield-checkmark' : doc.type === 'Certification' ? 'school' : 'document'} 
                    size={24} 
                    color={doc.status === 'Valid' ? '#4CAF50' : '#FF9800'} 
                  />
                  <Text style={styles.complianceTitle}>{doc.title}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: doc.status === 'Valid' ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusText}>{doc.status}</Text>
                  </View>
                </View>
                <Text style={styles.complianceDetails}>Expires: {new Date(doc.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {doc.details}</Text>
              </View>
            ))}
          </ScrollView>
        );
      case "Invoices":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💰 Invoices</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('invoice')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Create Invoice</Text>
              </TouchableOpacity>
            </View>
            
            {invoices.map(invoice => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: invoice.status === 'Paid' ? '#4CAF50' : 
                                   invoice.status === 'Approved' ? '#2196F3' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusText}>{invoice.status}</Text>
                  </View>
                </View>
                <Text style={styles.invoiceTask}>{invoice.task}</Text>
                <View style={styles.invoiceDetails}>
                  <Text style={styles.invoiceAmount}>${invoice.amount.toLocaleString()}</Text>
                  <Text style={styles.invoiceDate}>{invoice.date}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewInvoiceButton}
                  onPress={() => {
                    Alert.alert(
                      `Invoice Details - ${invoice.invoiceNo}`,
                      `Task: ${invoice.task}\\n\\nAmount: $${invoice.amount.toLocaleString()}\\nStatus: ${invoice.status}\\nDate: ${invoice.date}\\n\\nInvoice Number: ${invoice.invoiceNo}\\nPayment Status: ${invoice.status === 'paid' ? 'Paid' : invoice.status === 'approved' ? 'Approved - Pending Payment' : 'Under Review'}`,
                      [
                        { text: 'Download PDF', onPress: () => Alert.alert('Download', 'PDF download functionality will be implemented') },
                        { text: 'Close', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Text style={styles.viewInvoiceText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );
      case "Logout":
        setLogoutModalVisible(true);
        setActivePage("Dashboard");
        return renderContent();

      default:
        return (
          <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeBackground}>
                <View style={styles.constructionIcon}>
                  <Ionicons name="construct" size={40} color="#FFD700" />
                </View>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeName}>{user?.first_name || user?.username || 'Subcontractor'}</Text>
                <Text style={styles.welcomeSubtitle}>Manage your projects and deliver quality work</Text>
                <View style={styles.dateTimeContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={styles.dateTimeText}>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</Text>
                </View>
                <View style={styles.shiftContainer}>
                  <Ionicons name="business-outline" size={16} color="#fff" />
                  <Text style={styles.shiftText}>Subcontractor Portal</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Today's Overview</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, styles.tasksCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="clipboard" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'in_progress' || t.status === 'In Progress').length}</Text>
                  <Text style={styles.statLabel}>Active Tasks</Text>
                  <Text style={styles.statSubtext}>in progress</Text>
                </View>
                
                <View style={[styles.statCard, styles.completedCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={styles.statSubtext}>this month</Text>
                </View>
                
                <View style={[styles.statCard, styles.hoursCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="time" size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.statNumber}>{timeEntries.reduce((sum, entry) => sum + entry.hours, 0)}</Text>
                  <Text style={styles.statLabel}>Hours</Text>
                  <Text style={styles.statSubtext}>logged</Text>
                </View>
              </View>
            </View>
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Priority Tasks</Text>
              <TouchableOpacity 
                style={styles.priorityAlert}
                onPress={() => {
                  Alert.alert(
                    'High Priority Task', 
                    'Foundation Work - Block A\\n\\nDeadline: Today 5:00 PM\\nLocation: Site A - North Section\\nContact: Project Manager for details\\n\\nEnsure all safety protocols are followed.',
                    [{ text: 'Understood', style: 'default' }]
                  );
                }}
              >
                <View style={styles.alertIconContainer}>
                  <Ionicons name="construct" size={24} color="#fff" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>High Priority</Text>
                  <Text style={styles.alertText}>Foundation Work - Block A completion</Text>
                  <Text style={styles.alertTime}>Due: Today 5:00 PM</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FF5722" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { 
                    title: "Assigned Tasks", 
                    icon: "clipboard", 
                    count: `${tasks.length} tasks`,
                    color: "#FF9800",
                    bgColor: "#FFF3E0"
                  },
                  { 
                    title: "Progress Reports", 
                    icon: "camera", 
                    count: "3 pending",
                    color: "#9C27B0",
                    bgColor: "#F3E5F5"
                  },
                  { 
                    title: "Time Logging", 
                    icon: "time", 
                    count: "Log today",
                    color: "#4CAF50",
                    bgColor: "#E8F5E8"
                  },
                  { 
                    title: "Invoices", 
                    icon: "cash", 
                    count: `${invoices.length} invoices`,
                    color: "#2196F3",
                    bgColor: "#E3F2FD"
                  },
                ].map((item, index) => (
                  <TouchableOpacity
                    key={item.title}
                    style={[styles.actionCard, { backgroundColor: item.bgColor }]}
                    onPress={() => setActivePage(item.title)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon} size={28} color="#fff" />
                    </View>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={[styles.actionCount, { color: item.color }]}>{item.count}</Text>
                    <View style={styles.actionArrow}>
                      <Ionicons name="chevron-forward" size={16} color={item.color} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.performanceSection}>
              <Text style={styles.sectionTitle}>📊 Performance Summary</Text>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={styles.performanceTitle}>This Month</Text>
                </View>
                <View style={styles.performanceMetrics}>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{timeEntries.reduce((sum, entry) => sum + entry.hours, 0)}h</Text>
                    <Text style={styles.performanceLabel}>Total Hours</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length}</Text>
                    <Text style={styles.performanceLabel}>Tasks Done</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{invoices.filter(i => i.status === 'approved' || i.status === 'paid').length}</Text>
                    <Text style={styles.performanceLabel}>Invoices Paid</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
              <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Foundation Work Progress Updated</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="time" size={20} color="#2196F3" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Time Entry Logged - 8 hours</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activePage === "Dashboard" ? "Subcontractor Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'progress' && (
              <>
                <Text style={styles.modalTitle}>Progress Report</Text>
                <Text style={styles.modalSubtitle}>{selectedTask?.title || 'General Progress'}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the progress made, any issues encountered, and next steps..."
                  value={progressReport}
                  onChangeText={setProgressReport}
                  multiline
                  numberOfLines={5}
                />
              </>
            )}

            {modalType === 'message' && (
              <>
                <Text style={styles.modalTitle}>New Message</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Recipient *"
                  value={messageForm.recipient}
                  onChangeText={(text) => setMessageForm({...messageForm, recipient: text})}
                />
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
                  numberOfLines={5}
                />
              </>
            )}
            {modalType === 'invoice' && (
              <>
                <Text style={styles.modalTitle}>Create Invoice</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Task/Work Description *"
                  value={invoiceForm.task}
                  onChangeText={(text) => setInvoiceForm({...invoiceForm, task: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Amount *"
                  value={invoiceForm.amount}
                  onChangeText={(text) => setInvoiceForm({...invoiceForm, amount: text})}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional Description"
                  value={invoiceForm.description}
                  onChangeText={(text) => setInvoiceForm({...invoiceForm, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            {modalType === 'compliance' && (
              <>
                <Text style={styles.modalTitle}>Upload Compliance Document</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Document Title *"
                  value={complianceForm.title}
                  onChangeText={(text) => setComplianceForm({...complianceForm, title: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Type:</Text>
                  {['Insurance', 'Certification', 'License'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, {
                        backgroundColor: complianceForm.type === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setComplianceForm({...complianceForm, type})}
                    >
                      <Text style={[styles.typeText, {
                        color: complianceForm.type === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Expiry Date (YYYY-MM-DD) *"
                  value={complianceForm.expiryDate}
                  onChangeText={(text) => setComplianceForm({...complianceForm, expiryDate: text})}
                />
              </>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={submitForm}
              >
                <Text style={styles.submitButtonText}>
                  {modalType === 'progress' ? 'Submit Report' :
                   modalType === 'message' ? 'Send Message' :
                   modalType === 'invoice' ? 'Create Invoice' :
                   modalType === 'compliance' ? 'Upload Document' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Ionicons name="log-out-outline" size={48} color="#FF6B6B" style={{ alignSelf: 'center', marginBottom: 15 }} />
            <Text style={styles.logoutModalTitle}>Confirm Logout</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to log out? You will need to sign in again to access your dashboard.
            </Text>
            <View style={styles.logoutModalActions}>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.cancelLogoutButton]} 
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelLogoutText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.confirmLogoutButton]} 
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('token');
                    setLogoutModalVisible(false);
                    navigation.navigate('Login');
                  } catch (error) {
                    console.error('Error during logout:', error);
                    setLogoutModalVisible(false);
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={styles.confirmLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.userProfileSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'S'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.first_name || user?.username || 'Subcontractor'}</Text>
              <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Subcontractor'}</Text>
            </View>
          </View>
          <View style={styles.menuDivider} />
          {[
            { title: "Dashboard", icon: "home" },
            { title: "Assigned Tasks", icon: "clipboard" },
            { title: "Progress Reports", icon: "camera" },
            { title: "Documents", icon: "document-text" },
            { title: "Time Logging", icon: "time" },
            { title: "Communication", icon: "chatbubbles" },
            { title: "Compliance", icon: "shield-checkmark" },
            { title: "Invoices", icon: "cash" }
          ].map((item) => (
            <TouchableOpacity key={item.title} onPress={() => handleMenuClick(item.title)} style={[styles.menuItem, activePage === item.title && styles.activeMenuItem]}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={activePage === item.title ? item.icon : `${item.icon}-outline`} size={20} color={activePage === item.title ? "#fff" : "#003366"} />
              </View>
              <Text style={[styles.menuText, activePage === item.title && styles.activeMenuText]}>{item.title}</Text>
              {activePage === item.title && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}

          <View style={styles.menuDivider} />
          <TouchableOpacity onPress={() => { toggleMenu(); setLogoutModalVisible(true); }} style={styles.logoutMenuItem}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            </View>
            <Text style={styles.logoutMenuText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 15,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  content: { flex: 1 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  welcomeHeader: {
    marginBottom: 20,
  },
  welcomeBackground: {
    backgroundColor: "#003366",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  constructionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  welcomeTitle: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "600",
    marginBottom: 5,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 15,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  dateTimeText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
  },
  shiftContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  shiftText: {
    color: "#FFD700",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
  },
  
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statSubtext: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  tasksCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF9800",
  },
  completedCard: {
    borderTopWidth: 3,
    borderTopColor: "#4CAF50",
  },
  hoursCard: {
    borderTopWidth: 3,
    borderTopColor: "#2196F3",
  },
  
  alertsSection: { 
    paddingHorizontal: 20, 
    marginBottom: 25 
  },
  priorityAlert: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    elevation: 3,
    borderLeftWidth: 4, 
    borderLeftColor: "#FF5722",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF5722",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5722",
    marginBottom: 2,
  },
  alertText: { 
    fontSize: 14, 
    color: "#333", 
    marginBottom: 2,
    fontWeight: "500",
  },
  alertTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  actionArrow: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  
  performanceSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginLeft: 10,
  },
  performanceMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  performanceMetric: {
    alignItems: "center",
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  performanceLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 18, 
    marginHorizontal: 4, 
    alignItems: "center", 
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#003366",
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 12, 
    color: "#666", 
    fontWeight: "600",
    textAlign: "center",
  },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: { 
    fontSize: 14, 
    color: "#003366", 
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: { 
    fontSize: 12, 
    color: "#666" 
  },
  
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  taskCount: { fontSize: 14, color: "#666" },
  documentCount: { fontSize: 14, color: "#666" },
  totalHours: { fontSize: 14, color: "#666" },
  
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  taskDescription: { fontSize: 14, color: "#666", marginBottom: 10 },
  taskDetails: { marginBottom: 10 },
  taskDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  taskDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  
  taskActions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.48,
    justifyContent: "center",
  },
  completeButton: { backgroundColor: "#4CAF50" },
  actionButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 1,
  },
  documentIcon: { marginRight: 15 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 14, fontWeight: "500", color: "#003366" },
  documentDetails: { fontSize: 12, color: "#666", marginTop: 2 },
  downloadButton: { padding: 5 },
  
  timeEntryForm: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  submitButton: {
    backgroundColor: "#003366",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  
  timeEntryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 1,
  },
  timeEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  timeEntryDate: { fontSize: 14, fontWeight: "500", color: "#003366" },
  timeEntryHours: { fontSize: 14, fontWeight: "600", color: "#4CAF50" },
  timeEntryTask: { fontSize: 12, color: "#666", marginBottom: 2 },
  timeEntryDescription: { fontSize: 12, color: "#666" },
  
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTitle: { fontSize: 16, fontWeight: "600", color: "#003366" },
  reportDate: { fontSize: 12, color: "#666" },
  reportDescription: { fontSize: 14, color: "#666", marginBottom: 15 },
  reportImages: { flexDirection: "row", justifyContent: "space-around" },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imagePlaceholderText: { fontSize: 10, color: "#999", marginTop: 4 },
  
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageSender: { fontSize: 14, fontWeight: "600", color: "#003366" },
  messageTime: { fontSize: 12, color: "#666" },
  messageSubject: { fontSize: 16, fontWeight: "500", color: "#003366", marginBottom: 8 },
  messageContent: { fontSize: 14, color: "#666", marginBottom: 10 },
  replyButton: {
    alignSelf: "flex-start",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  replyButtonText: { color: "#fff", fontSize: 12 },
  
  complianceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  complianceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  complianceTitle: { fontSize: 16, fontWeight: "500", color: "#003366", flex: 1, marginLeft: 10 },
  complianceDetails: { fontSize: 12, color: "#666" },
  
  invoiceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceNumber: { fontSize: 16, fontWeight: "600", color: "#003366" },
  invoiceTask: { fontSize: 14, color: "#666", marginBottom: 8 },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  invoiceAmount: { fontSize: 18, fontWeight: "bold", color: "#4CAF50" },
  invoiceDate: { fontSize: 12, color: "#666" },
  viewInvoiceButton: {
    alignSelf: "flex-start",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewInvoiceText: { color: "#fff", fontSize: 12 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    flex: 0.48,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: { color: "#666", fontSize: 14 },
  
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  typeLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  typeText: { fontSize: 12 },
  
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#fff",
    paddingTop: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 3,
  },
  userProfileSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20, backgroundColor: "#f8f9fa" },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#003366", alignItems: "center", justifyContent: "center", marginRight: 15 },
  userAvatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 2 },
  userRole: { fontSize: 12, color: "#666" },
  menuDivider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 10, borderRadius: 8, position: "relative" },
  activeMenuItem: { backgroundColor: "#003366" },
  menuIconContainer: { width: 24, alignItems: "center" },
  menuText: { marginLeft: 15, fontSize: 15, color: "#003366", fontWeight: "500" },
  activeMenuText: { color: "#fff" },
  activeIndicator: { position: "absolute", right: 0, top: "50%", marginTop: -10, width: 3, height: 20, backgroundColor: "#fff", borderRadius: 2 },
  logoutMenuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8, backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#ffe0e0" },
  logoutIconContainer: { width: 24, alignItems: "center" },
  logoutMenuText: { marginLeft: 15, fontSize: 15, color: "#FF6B6B", fontWeight: "500" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 2,
  },
  
  logoutModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 8,
    textAlign: "center",
  },
  logoutModalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  logoutModalButton: {
    flex: 0.48,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelLogoutButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmLogoutButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelLogoutText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmLogoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});