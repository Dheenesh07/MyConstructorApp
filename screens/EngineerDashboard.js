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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

export default function EngineerDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [reports, setReports] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'Progress',
    description: '',
    recommendations: ''
  });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Blueprint',
    description: '',
    fileName: ''
  });
  const [viewReportModalVisible, setViewReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'Preventive',
    scheduledDate: '',
    description: '',
    priority: 'Medium'
  });
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressForm, setProgressForm] = useState({
    progress: 0,
    status: 'In Progress',
    notes: ''
  });
  const navigation = useNavigation();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        await loadUserData();
        loadTasks();
        loadDrawings();
        loadEquipment();
        loadReports();
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, []);

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

  const loadTasks = () => {
    setTasks([
      { id: 1, title: 'Foundation Design Review', priority: 'High', status: 'In Progress', dueDate: '2024-01-15', progress: 75 },
      { id: 2, title: 'Structural Analysis - Block A', priority: 'High', status: 'Pending', dueDate: '2024-01-18', progress: 0 },
      { id: 3, title: 'MEP Coordination', priority: 'Medium', status: 'In Progress', dueDate: '2024-01-20', progress: 45 },
      { id: 4, title: 'Site Survey Verification', priority: 'Medium', status: 'Completed', dueDate: '2024-01-12', progress: 100 }
    ]);
  };

  const loadDrawings = () => {
    setDrawings([
      { id: 1, name: 'Foundation Plan - Rev 3', type: 'Structural', status: 'Approved', lastModified: '2024-01-10', size: '2.4 MB' },
      { id: 2, name: 'Electrical Layout - Floor 1', type: 'Electrical', status: 'Under Review', lastModified: '2024-01-12', size: '1.8 MB' },
      { id: 3, name: 'Plumbing Schematic', type: 'Plumbing', status: 'Draft', lastModified: '2024-01-11', size: '1.2 MB' },
      { id: 4, name: 'HVAC System Layout', type: 'HVAC', status: 'Approved', lastModified: '2024-01-09', size: '3.1 MB' }
    ]);
  };

  const loadEquipment = () => {
    setEquipment([
      { id: 1, name: 'Tower Crane TC-01', status: 'Operational', location: 'Site A - North', lastMaintenance: '2024-01-08', nextMaintenance: '2024-02-08' },
      { id: 2, name: 'Concrete Mixer CM-02', status: 'Maintenance', location: 'Equipment Yard', lastMaintenance: '2024-01-10', nextMaintenance: '2024-01-17' },
      { id: 3, name: 'Excavator EX-03', status: 'Operational', location: 'Site A - South', lastMaintenance: '2024-01-05', nextMaintenance: '2024-02-05' },
      { id: 4, name: 'Welding Machine WM-04', status: 'Operational', location: 'Workshop', lastMaintenance: '2024-01-07', nextMaintenance: '2024-02-07' }
    ]);
  };

  const loadReports = () => {
    setReports([
      { id: 1, title: 'Weekly Progress Report', type: 'Progress', date: '2024-01-12', status: 'Submitted' },
      { id: 2, title: 'Material Quality Assessment', type: 'Quality', date: '2024-01-10', status: 'Draft' },
      { id: 3, title: 'Safety Compliance Review', type: 'Safety', date: '2024-01-08', status: 'Submitted' }
    ]);
  };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
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

  const submitReport = () => {
    if (!reportForm.title || !reportForm.description) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    const newReport = {
      id: reports.length + 1,
      ...reportForm,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    setReports([newReport, ...reports]);
    setReportForm({ title: '', type: 'Progress', description: '', recommendations: '' });
    setModalVisible(false);
    Alert.alert('Success', 'Report created successfully!');
  };

  const uploadDocument = () => {
    if (!uploadForm.title || !uploadForm.fileName) {
      Alert.alert('Error', 'Please fill required fields and select a file');
      return;
    }
    const newDrawing = {
      id: drawings.length + 1,
      name: uploadForm.title,
      type: uploadForm.type,
      status: 'Under Review',
      lastModified: new Date().toISOString().split('T')[0],
      size: '2.1 MB'
    };
    setDrawings([newDrawing, ...drawings]);
    setUploadForm({ title: '', type: 'Blueprint', description: '', fileName: '' });
    setUploadModalVisible(false);
    Alert.alert('Success', 'Document uploaded successfully!');
  };

  const selectFile = () => {
    const fileTypes = ['foundation_plan.dwg', 'electrical_layout.pdf', 'structural_details.dwg', 'site_survey.pdf'];
    const randomFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    setUploadForm({...uploadForm, fileName: randomFile});
    Alert.alert('File Selected', `Selected: ${randomFile}`);
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setViewReportModalVisible(true);
  };

  const scheduleMaintenance = (equipment) => {
    setSelectedEquipment(equipment);
    setMaintenanceForm({
      type: 'Preventive',
      scheduledDate: '',
      description: '',
      priority: 'Medium'
    });
    setMaintenanceModalVisible(true);
  };

  const viewHistory = (equipment) => {
    setSelectedEquipment(equipment);
    setHistoryModalVisible(true);
  };

  const submitMaintenance = () => {
    if (!maintenanceForm.scheduledDate || !maintenanceForm.description) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    Alert.alert('Success', `Maintenance scheduled for ${selectedEquipment?.name}`);
    setMaintenanceModalVisible(false);
  };

  const updateProgress = (task) => {
    setSelectedTask(task);
    setProgressForm({
      progress: task.progress,
      status: task.status,
      notes: ''
    });
    setProgressModalVisible(true);
  };

  const submitProgress = () => {
    if (progressForm.progress < 0 || progressForm.progress > 100) {
      Alert.alert('Error', 'Progress must be between 0 and 100');
      return;
    }
    
    const updatedTasks = tasks.map(task => 
      task.id === selectedTask.id 
        ? { ...task, progress: parseInt(progressForm.progress), status: progressForm.status }
        : task
    );
    setTasks(updatedTasks);
    setProgressModalVisible(false);
    Alert.alert('Success', 'Task progress updated successfully!');
  };

  const renderContent = () => {
    switch (activePage) {
      case "Technical Tasks":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🔧 Technical Tasks</Text>
            </View>
            
            {tasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.priorityBadge, { 
                    backgroundColor: task.priority === 'High' ? '#F44336' : 
                                   task.priority === 'Medium' ? '#FF9800' : '#4CAF50'
                  }]}>
                    <Text style={styles.statusText}>{task.priority}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress: {task.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                  </View>
                </View>
                
                <View style={styles.taskDetails}>
                  <View style={styles.taskDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>Due: {task.dueDate}</Text>
                  </View>
                </View>
                
                <View style={styles.taskActions}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: task.status === 'Completed' ? '#4CAF50' : 
                                   task.status === 'In Progress' ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton} onPress={() => updateProgress(task)}>
                    <Text style={styles.viewButtonText}>Update Progress</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Drawings & Documents":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📐 Drawings & Documents</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setUploadModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Upload Drawing</Text>
              </TouchableOpacity>
            </View>
            
            {drawings.map(drawing => (
              <View key={drawing.id} style={styles.drawingCard}>
                <View style={styles.drawingHeader}>
                  <Text style={styles.drawingName}>{drawing.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: drawing.status === 'Approved' ? '#4CAF50' : 
                                   drawing.status === 'Under Review' ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{drawing.status}</Text>
                  </View>
                </View>
                
                <View style={styles.drawingDetails}>
                  <View style={styles.drawingDetailRow}>
                    <Ionicons name="folder-outline" size={16} color="#666" />
                    <Text style={styles.drawingDetailText}>Type: {drawing.type}</Text>
                  </View>
                  <View style={styles.drawingDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.drawingDetailText}>Modified: {drawing.lastModified}</Text>
                  </View>
                  <View style={styles.drawingDetailRow}>
                    <Ionicons name="document-outline" size={16} color="#666" />
                    <Text style={styles.drawingDetailText}>Size: {drawing.size}</Text>
                  </View>
                </View>
                
                <View style={styles.drawingActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} 
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log('View button pressed for:', drawing.name);
                      Alert.alert('View Document', `Opening: ${drawing.name}\nType: ${drawing.type}\nSize: ${drawing.size}\nStatus: ${drawing.status}`);
                    }}
                  >
                    <Ionicons name="eye" size={16} color="#1976d2" />
                    <Text style={[styles.actionBtnText, { color: '#1976d2' }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#e8f5e8' }]} 
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log('Download button pressed for:', drawing.name);
                      Alert.alert('Download Document', `Downloading: ${drawing.name}\nSize: ${drawing.size}\nType: ${drawing.type}\nModified: ${drawing.lastModified}`);
                    }}
                  >
                    <Ionicons name="download" size={16} color="#4caf50" />
                    <Text style={[styles.actionBtnText, { color: '#4caf50' }]}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} 
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log('Edit button pressed for:', drawing.name);
                      Alert.alert('Edit Document', `Opening editor for: ${drawing.name}\nType: ${drawing.type}\nStatus: ${drawing.status}\nModified: ${drawing.lastModified}`);
                    }}
                  >
                    <Ionicons name="create" size={16} color="#ff9800" />
                    <Text style={[styles.actionBtnText, { color: '#ff9800' }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Equipment Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🏗️ Equipment Management</Text>
            </View>
            
            {equipment.map(item => (
              <View key={item.id} style={styles.equipmentCard}>
                <View style={styles.equipmentHeader}>
                  <Text style={styles.equipmentName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: item.status === 'Operational' ? '#4CAF50' : 
                                   item.status === 'Maintenance' ? '#FF9800' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                
                <View style={styles.equipmentDetails}>
                  <View style={styles.equipmentDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.equipmentDetailText}>Location: {item.location}</Text>
                  </View>
                  <View style={styles.equipmentDetailRow}>
                    <Ionicons name="build-outline" size={16} color="#666" />
                    <Text style={styles.equipmentDetailText}>Last Maintenance: {item.lastMaintenance}</Text>
                  </View>
                  <View style={styles.equipmentDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.equipmentDetailText}>Next Maintenance: {item.nextMaintenance}</Text>
                  </View>
                </View>
                
                <View style={styles.equipmentActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => scheduleMaintenance(item)}>
                    <Text style={styles.actionBtnText}>Schedule Maintenance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => viewHistory(item)}>
                    <Text style={styles.actionBtnText}>View History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Vendor Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🏢 Vendor Management</Text>
            </View>
            
            <View style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <Text style={styles.vendorName}>Steel & Concrete Supply</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
              </View>
              <Text style={styles.vendorCode}>Code: VEN001</Text>
              <Text style={styles.vendorType}>MATERIAL SUPPLIER</Text>
              <Text style={styles.vendorContact}>Contact: John Smith</Text>
              <Text style={styles.vendorEmail}>Email: john@steelconcrete.com</Text>
              <Text style={styles.vendorPhone}>Phone: 555-0101</Text>
              <View style={styles.vendorActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#e8f5e8' }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Request Quote pressed');
                    Alert.alert('Quote Request Sent', 'Quote request sent to Steel & Concrete Supply. They will respond within 24 hours.');
                  }}
                >
                  <Ionicons name="document-text" size={16} color="#4caf50" />
                  <Text style={[styles.actionBtnText, { color: '#4caf50' }]}>Request Quote</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Contact Vendor pressed');
                    Alert.alert('Contact Info', 'John Smith - 555-0101\njohn@steelconcrete.com');
                  }}
                >
                  <Ionicons name="call" size={16} color="#1976d2" />
                  <Text style={[styles.actionBtnText, { color: '#1976d2' }]}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <Text style={styles.vendorName}>Elite Electrical Services</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
              <Text style={styles.vendorCode}>Code: VEN003</Text>
              <Text style={styles.vendorType}>SUBCONTRACTOR</Text>
              <Text style={styles.vendorContact}>Contact: Mike Davis</Text>
              <Text style={styles.vendorEmail}>Email: mike@elite.com</Text>
              <Text style={styles.vendorPhone}>Phone: 555-0103</Text>
              <View style={styles.vendorActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Schedule Work pressed');
                    Alert.alert('Work Scheduled', 'Electrical work scheduled with Elite Electrical Services for next Monday.');
                  }}
                >
                  <Ionicons name="calendar" size={16} color="#ff9800" />
                  <Text style={[styles.actionBtnText, { color: '#ff9800' }]}>Schedule Work</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Contact Vendor pressed');
                    Alert.alert('Contact Info', 'Mike Davis - 555-0103\nmike@elite.com');
                  }}
                >
                  <Ionicons name="call" size={16} color="#1976d2" />
                  <Text style={[styles.actionBtnText, { color: '#1976d2' }]}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case "Technical Reports":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📊 Technical Reports</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Create Report</Text>
              </TouchableOpacity>
            </View>
            
            {reports.map(report => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: report.status === 'Submitted' ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>
                
                <View style={styles.reportDetails}>
                  <View style={styles.reportDetailRow}>
                    <Ionicons name="folder-outline" size={16} color="#666" />
                    <Text style={styles.reportDetailText}>Type: {report.type}</Text>
                  </View>
                  <View style={styles.reportDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.reportDetailText}>Date: {report.date}</Text>
                  </View>
                </View>
                
                <View style={styles.reportActions}>
                  <TouchableOpacity style={styles.viewButton} onPress={() => viewReport(report)}>
                    <Text style={styles.viewButtonText}>View Report</Text>
                  </TouchableOpacity>
                  {report.status === 'Draft' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => {
                      const updatedReports = reports.map(r => 
                        r.id === report.id ? {...r, status: 'Submitted'} : r
                      );
                      setReports(updatedReports);
                      Alert.alert('Success', 'Report submitted successfully!');
                    }}>
                      <Text style={styles.actionBtnText}>Submit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Logout":
        setLogoutModalVisible(true);
        setActivePage("Dashboard");
        return renderContent();

      default:
        if (loading) {
          return (
            <View style={[styles.fullContainer, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          );
        }
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.welcome}>👷 Welcome back, {user?.username || 'Engineer'}!</Text>
              <Text style={styles.subtitle}>Beemji Construction - Site Engineering Portal</Text>
              <Text style={styles.dateTime}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Priority Alerts</Text>
              <View style={styles.alertCard}>
                <Ionicons name="warning" size={20} color="#FF5722" />
                <Text style={styles.alertText}>Foundation inspection due tomorrow - Block A</Text>
              </View>
              <View style={styles.alertCard}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <Text style={styles.alertText}>Structural drawings pending approval - 2 days overdue</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'In Progress').length}</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{drawings.filter(d => d.status === 'Approved').length}</Text>
                <Text style={styles.statLabel}>Approved Drawings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{equipment.filter(e => e.status === 'Operational').length}</Text>
                <Text style={styles.statLabel}>Operational Equipment</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>📋 Quick Actions</Text>
            <FlatList
              data={[
                { title: "🔧 Technical Tasks", count: `${tasks.length} tasks` },
                { title: "📐 Drawings & Documents", count: `${drawings.length} drawings` },
                { title: "🏗️ Equipment Management", count: `${equipment.length} equipment` },
                { title: "📊 Technical Reports", count: `${reports.length} reports` },
              ]}
              numColumns={2}
              keyExtractor={(item) => item.title}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dashboardCard}
                  onPress={() => setActivePage(item.title.replace(/^[^ ]+\s/, ""))}
                >
                  <Text style={styles.cardText}>{item.title}</Text>
                  <Text style={styles.cardCount}>{item.count}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.cardContainer}
              scrollEnabled={false}
            />
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
          {activePage === "Dashboard" ? "Site Engineer Dashboard" : activePage}
        </Text>
      </View>

      {renderContent()}
      
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Technical Report</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Report Title *"
              value={reportForm.title}
              onChangeText={(text) => setReportForm({...reportForm, title: text})}
            />
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Report Type:</Text>
              {['Progress', 'Quality', 'Safety', 'Technical'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, {
                    backgroundColor: reportForm.type === type ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setReportForm({...reportForm, type})}
                >
                  <Text style={[styles.typeText, {
                    color: reportForm.type === type ? '#fff' : '#666'
                  }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Report Description *"
              value={reportForm.description}
              onChangeText={(text) => setReportForm({...reportForm, description: text})}
              multiline
              numberOfLines={4}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Recommendations"
              value={reportForm.recommendations}
              onChangeText={(text) => setReportForm({...reportForm, recommendations: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={submitReport}>
                <Text style={styles.submitButtonText}>Create Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Upload Modal */}
      <Modal animationType="slide" transparent={true} visible={uploadModalVisible} onRequestClose={() => setUploadModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Document Title *"
              value={uploadForm.title}
              onChangeText={(text) => setUploadForm({...uploadForm, title: text})}
            />
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Document Type:</Text>
              {['Blueprint', 'Specification', 'Report', 'Survey', 'Other'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, {
                    backgroundColor: uploadForm.type === type ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setUploadForm({...uploadForm, type})}
                >
                  <Text style={[styles.typeText, {
                    color: uploadForm.type === type ? '#fff' : '#666'
                  }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.fileSelectButton} onPress={selectFile}>
              <Ionicons name="document-attach" size={20} color="#003366" />
              <Text style={styles.fileSelectText}>
                {uploadForm.fileName || 'Select File'}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={uploadForm.description}
              onChangeText={(text) => setUploadForm({...uploadForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setUploadModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={uploadDocument}>
                <Text style={styles.submitButtonText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Report Modal */}
      <Modal animationType="slide" transparent={true} visible={viewReportModalVisible} onRequestClose={() => setViewReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.reportViewHeader}>
              <Text style={styles.modalTitle}>{selectedReport?.title}</Text>
              <TouchableOpacity onPress={() => setViewReportModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reportViewContent}>
              <View style={styles.reportMetadata}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Type:</Text>
                  <Text style={styles.metadataValue}>{selectedReport?.type}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Date:</Text>
                  <Text style={styles.metadataValue}>{selectedReport?.date}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: selectedReport?.status === 'Submitted' ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{selectedReport?.status}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Report Content</Text>
                <Text style={styles.reportContent}>
                  {selectedReport?.type === 'Progress' ? 
                    'Project Progress Summary:\n\n• Foundation work completed - 100%\n• Structural framework - 75% complete\n• MEP rough-in - 45% complete\n• Exterior work - 30% complete\n\nKey Achievements:\n- Foundation inspection passed with no issues\n- Structural steel installation ahead of schedule\n- Material deliveries on track\n\nUpcoming Milestones:\n- Electrical rough-in completion by Jan 20\n- Plumbing installation start Jan 22\n- Exterior cladding installation Feb 1' :
                  selectedReport?.type === 'Quality' ?
                    'Quality Assessment Report:\n\n• Concrete strength tests - All passed\n• Steel welding inspections - 95% compliant\n• Material certifications - Complete\n• Workmanship standards - Excellent\n\nQuality Issues Identified:\n- Minor welding defects in Section B (corrected)\n- Material storage improvements needed\n\nRecommendations:\n- Increase welding inspection frequency\n- Implement better material handling procedures' :
                    'Safety Compliance Review:\n\n• Safety training completion - 100%\n• PPE compliance - 98%\n• Safety incidents - 0 this period\n• Equipment safety checks - Current\n\nSafety Observations:\n- Excellent adherence to safety protocols\n- Proper use of fall protection equipment\n- Good housekeeping practices\n\nAction Items:\n- Schedule refresher training for new workers\n- Update emergency response procedures'
                  }
                </Text>
              </View>
              
              {selectedReport?.type === 'Progress' && (
                <View style={styles.reportSection}>
                  <Text style={styles.sectionHeader}>Recommendations</Text>
                  <Text style={styles.reportContent}>
                    • Accelerate MEP coordination meetings\n• Consider additional resources for electrical work\n• Monitor weather conditions for exterior activities\n• Maintain current quality standards
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.reportViewActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Download', 'PDF downloaded successfully!')}>
                <Ionicons name="download-outline" size={16} color="#003366" />
                <Text style={styles.actionButtonText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Share', 'Report shared successfully!')}>
                <Ionicons name="share-outline" size={16} color="#003366" />
                <Text style={styles.actionButtonText}>Share Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal animationType="slide" transparent={true} visible={maintenanceModalVisible} onRequestClose={() => setMaintenanceModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Maintenance - {selectedEquipment?.name}</Text>
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Maintenance Type:</Text>
              {['Preventive', 'Corrective', 'Emergency', 'Inspection'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, {
                    backgroundColor: maintenanceForm.type === type ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setMaintenanceForm({...maintenanceForm, type})}
                >
                  <Text style={[styles.typeText, {
                    color: maintenanceForm.type === type ? '#fff' : '#666'
                  }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Scheduled Date (YYYY-MM-DD) *"
              value={maintenanceForm.scheduledDate}
              onChangeText={(text) => setMaintenanceForm({...maintenanceForm, scheduledDate: text})}
            />
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Priority:</Text>
              {['Low', 'Medium', 'High', 'Critical'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.typeOption, {
                    backgroundColor: maintenanceForm.priority === priority ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setMaintenanceForm({...maintenanceForm, priority})}
                >
                  <Text style={[styles.typeText, {
                    color: maintenanceForm.priority === priority ? '#fff' : '#666'
                  }]}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Maintenance Description *"
              value={maintenanceForm.description}
              onChangeText={(text) => setMaintenanceForm({...maintenanceForm, description: text})}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setMaintenanceModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={submitMaintenance}>
                <Text style={styles.submitButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Equipment History Modal */}
      <Modal animationType="slide" transparent={true} visible={historyModalVisible} onRequestClose={() => setHistoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.reportViewHeader}>
              <Text style={styles.modalTitle}>Maintenance History - {selectedEquipment?.name}</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyContent}>
              {[
                { date: '2024-01-08', type: 'Preventive', status: 'Completed', technician: 'John Smith', notes: 'Routine inspection and lubrication completed. All systems operational.' },
                { date: '2023-12-15', type: 'Corrective', status: 'Completed', technician: 'Mike Johnson', notes: 'Replaced hydraulic hose. Pressure tested and verified.' },
                { date: '2023-11-20', type: 'Preventive', status: 'Completed', technician: 'John Smith', notes: 'Monthly maintenance check. Oil changed, filters replaced.' },
                { date: '2023-10-25', type: 'Inspection', status: 'Completed', technician: 'Sarah Wilson', notes: 'Safety inspection passed. Minor adjustments made to controls.' }
              ].map((record, index) => (
                <View key={index} style={styles.historyRecord}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{record.date}</Text>
                    <View style={[styles.historyTypeBadge, {
                      backgroundColor: record.type === 'Preventive' ? '#4CAF50' :
                                     record.type === 'Corrective' ? '#FF9800' :
                                     record.type === 'Emergency' ? '#F44336' : '#2196F3'
                    }]}>
                      <Text style={styles.historyTypeText}>{record.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyTechnician}>Technician: {record.technician}</Text>
                  <Text style={styles.historyNotes}>{record.notes}</Text>
                  <View style={[styles.historyStatus, {
                    backgroundColor: record.status === 'Completed' ? '#E8F5E8' : '#FFF3E0'
                  }]}>
                    <Text style={[styles.historyStatusText, {
                      color: record.status === 'Completed' ? '#4CAF50' : '#FF9800'
                    }]}>Status: {record.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
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

      {/* Progress Update Modal */}
      <Modal animationType="slide" transparent={true} visible={progressModalVisible} onRequestClose={() => setProgressModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Progress - {selectedTask?.title}</Text>
            
            <View style={styles.progressInputContainer}>
              <Text style={styles.progressInputLabel}>Progress: {progressForm.progress}%</Text>
              <TextInput
                style={styles.input}
                placeholder="Progress (0-100)"
                value={progressForm.progress.toString()}
                onChangeText={(text) => setProgressForm({...progressForm, progress: text})}
                keyboardType="numeric"
              />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressForm.progress}%` }]} />
              </View>
            </View>
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Status:</Text>
              {['Pending', 'In Progress', 'Completed', 'On Hold'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.typeOption, {
                    backgroundColor: progressForm.status === status ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setProgressForm({...progressForm, status})}
                >
                  <Text style={[styles.typeText, {
                    color: progressForm.status === status ? '#fff' : '#666'
                  }]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Progress Notes (optional)"
              value={progressForm.notes}
              onChangeText={(text) => setProgressForm({...progressForm, notes: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setProgressModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={submitProgress}>
                <Text style={styles.submitButtonText}>Update Progress</Text>
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

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'E'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Engineer'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Site Engineer'}</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />
        
        {[
          { title: "Dashboard", icon: "home" },
          { title: "Technical Tasks", icon: "construct" },
          { title: "Drawings & Documents", icon: "document-text" },
          { title: "Equipment Management", icon: "build" },
          { title: "Vendor Management", icon: "business" },
          { title: "Technical Reports", icon: "bar-chart" }
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", padding: 15 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  dashboardHeader: { padding: 20, alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  
  statsContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 5, alignItems: "center", elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
  cardContainer: { paddingHorizontal: 10, justifyContent: 'center' },
  dashboardCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, margin: 10, elevation: 3, flex: 1, maxWidth: (width - 60) / 2, alignItems: "center" },
  cardText: { fontSize: 14, color: "#003366", fontWeight: "600", textAlign: "center" },
  cardCount: { fontSize: 12, color: "#666", marginTop: 5 },
  
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  pageContainer: { padding: 20, alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 25, paddingHorizontal: 15, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  taskCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  taskDetails: { marginBottom: 15 },
  taskDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  taskDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  taskActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  drawingCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  drawingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  drawingName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  drawingDetails: { marginBottom: 15 },
  drawingDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  drawingDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  drawingActions: { flexDirection: "row", justifyContent: "space-around" },
  
  equipmentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  equipmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  equipmentName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  equipmentDetails: { marginBottom: 15 },
  equipmentDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  equipmentDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  equipmentActions: { flexDirection: "row", justifyContent: "space-around" },
  
  reportCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  reportTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  reportDetails: { marginBottom: 15 },
  reportDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  reportDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  reportActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  statusBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  viewButton: { alignSelf: "flex-start", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
  actionBtn: { 
    backgroundColor: "#f5f5f5", 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6, 
    flexDirection: "row", 
    alignItems: "center",
    minWidth: 70,
    minHeight: 32,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd"
  },
  actionBtnText: { color: "#003366", fontSize: 12, marginLeft: 4, fontWeight: "500" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: width * 0.9, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 15 },
  
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: "#fff" },
  textArea: { height: 80, textAlignVertical: "top" },
  
  typeContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, flexWrap: "wrap" },
  typeLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  typeOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  typeText: { fontSize: 12 },
  
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  modalButton: { flex: 0.48, borderRadius: 8, padding: 12, alignItems: "center" },
  cancelButton: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#ddd" },
  cancelButtonText: { color: "#666", fontSize: 14 },
  submitButton: { backgroundColor: "#003366" },
  submitButtonText: { color: "#fff", fontSize: 14 },
  
  sideMenu: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: "#fff", paddingTop: 50, elevation: 8, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10 },
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  
  // Logout modal styles
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
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  
  // Enhanced welcome page styles
  dateTime: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  alertsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5722",
  },
  alertText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  
  // Document upload styles
  fileSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
  },
  fileSelectText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#003366",
    flex: 1,
  },
  
  // Report view modal styles
  reportViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  reportViewContent: {
    maxHeight: 400,
  },
  reportMetadata: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  metadataValue: {
    fontSize: 14,
    color: "#003366",
  },
  reportSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  reportContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reportViewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#003366",
    fontWeight: "500",
  },
  
  // Equipment history styles
  historyContent: {
    maxHeight: 400,
  },
  historyRecord: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#003366",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  historyTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyTypeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  historyTechnician: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  historyNotes: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 8,
  },
  historyStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  
  vendorCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, color: "#666", marginLeft: 4 },
  vendorCode: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorType: { fontSize: 12, color: "#666", marginBottom: 4 },
  vendorContact: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorEmail: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorPhone: { fontSize: 12, color: "#666", marginBottom: 10 },
  vendorActions: { flexDirection: "row", justifyContent: "space-around" },
  
  // Progress update modal styles
  progressInputContainer: {
    marginBottom: 15,
  },
  progressInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
});