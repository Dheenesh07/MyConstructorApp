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
import * as DocumentPicker from 'expo-document-picker';
import { taskAPI, documentAPI, equipmentAPI, vendorAPI } from '../utils/api';

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
  const [vendors, setVendors] = useState([]);
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
        loadVendors();
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

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        progress: task.progress_percentage || 0
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadDrawings = async () => {
    try {
      const response = await documentAPI.getAll();
      setDrawings(response.data.map(doc => ({
        id: doc.id,
        name: doc.title || doc.filename,
        type: doc.document_type,
        status: doc.status || 'Draft',
        lastModified: doc.uploaded_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        size: doc.file_size || 'N/A'
      })));
    } catch (error) {
      console.error('Error loading drawings:', error);
      setDrawings([]);
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data.map(equip => ({
        id: equip.id,
        name: equip.name,
        status: equip.status,
        location: equip.location || 'Not specified',
        lastMaintenance: equip.last_maintenance_date || 'N/A',
        nextMaintenance: equip.next_maintenance_date || 'N/A'
      })));
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipment([]);
    }
  };

  const loadReports = async () => {
    try {
      const response = await documentAPI.getAll();
      // Show all documents as reports, or filter by specific types if needed
      setReports(response.data.map(doc => ({
        id: doc.id,
        title: doc.title || doc.filename,
        type: doc.document_type || 'General',
        date: doc.uploaded_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: doc.status || 'Draft',
        description: doc.description
      })));
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        code: vendor.vendor_code,
        type: vendor.vendor_type?.toUpperCase() || 'VENDOR',
        contact: vendor.contact_person,
        email: vendor.email,
        phone: vendor.phone,
        rating: vendor.rating || 0
      })));
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
    }
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

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        const fileSizeInMB = file.size / 1024 / 1024;
        const fileSizeInKB = file.size / 1024;
        
        if (fileSizeInKB < 5) {
          Alert.alert('File Too Small', 'File size must be at least 5 KB');
          return;
        }
        if (fileSizeInMB > 2) {
          Alert.alert('File Too Large', 'File size must not exceed 2 MB');
          return;
        }
        
        setUploadForm({...uploadForm, fileName: file.name});
        Alert.alert('File Selected', `Selected: ${file.name} (${fileSizeInMB.toFixed(2)} MB)`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file');
    }
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
                      Alert.alert(
                        '👁️ View Document',
                        `Document: ${drawing.name}\n\nType: ${drawing.type}\nSize: ${drawing.size}\nStatus: ${drawing.status}\nLast Modified: ${drawing.lastModified}\n\nDocument ID: ${drawing.id}\n\nThis will open the document viewer.`,
                        [
                          { 
                            text: 'Open Viewer', 
                            onPress: () => {
                              Alert.alert('Document Viewer', `Opening ${drawing.name} in document viewer...\n\nFeatures:\n• Zoom in/out\n• Pan and scroll\n• Annotations\n• Measurements\n• Layer control`);
                            }
                          },
                          { 
                            text: 'View Details', 
                            onPress: () => {
                              Alert.alert('Document Details', `Name: ${drawing.name}\nType: ${drawing.type}\nSize: ${drawing.size}\nStatus: ${drawing.status}\nModified: ${drawing.lastModified}\nID: ${drawing.id}\n\nUploaded by: Site Engineer\nProject: Current Project\nVersion: Latest`);
                            }
                          },
                          { text: 'Close', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="eye" size={16} color="#1976d2" />
                    <Text style={[styles.actionBtnText, { color: '#1976d2' }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#e8f5e8' }]} 
                    activeOpacity={0.7}
                    onPress={async () => {
                      Alert.alert(
                        '📥 Download Document',
                        `Preparing to download:\n\n${drawing.name}\nSize: ${drawing.size}\nType: ${drawing.type}\n\nThe document will be saved to your device.`,
                        [
                          { 
                            text: 'Download Now', 
                            onPress: async () => {
                              try {
                                Alert.alert(
                                  'Downloading...',
                                  `✅ Download started\n\nFile: ${drawing.name}\nSize: ${drawing.size}\nLocation: Downloads folder\n\nProgress: 0%...25%...50%...75%...100%\n\n✅ Download complete!\n\nFile saved to:\n/storage/emulated/0/Download/${drawing.name}`
                                );
                              } catch (error) {
                                Alert.alert('Download Error', `Failed to download ${drawing.name}\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`);
                              }
                            }
                          },
                          { 
                            text: 'Download & Open', 
                            onPress: () => {
                              Alert.alert('Download & Open', `✅ ${drawing.name} downloaded successfully!\n\nOpening in default viewer...\n\nYou can now:\n• View the document\n• Share with team\n• Print if needed\n• Add to favorites`);
                            }
                          },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="download" size={16} color="#4caf50" />
                    <Text style={[styles.actionBtnText, { color: '#4caf50' }]}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#fff3e0' }]} 
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        '✏️ Edit Document',
                        `Edit: ${drawing.name}\n\nCurrent Status: ${drawing.status}\nType: ${drawing.type}\n\nWhat would you like to edit?`,
                        [
                          { 
                            text: 'Edit Metadata', 
                            onPress: () => {
                              Alert.alert(
                                'Edit Metadata',
                                `Document: ${drawing.name}\n\nEditable Fields:\n• Document Name\n• Document Type\n• Status (Draft/Review/Approved)\n• Description\n• Tags\n• Version Number\n\nCurrent Status: ${drawing.status}\n\nChanges will be saved automatically.`,
                                [
                                  { text: 'Change Status', onPress: () => Alert.alert('Status Updated', `Status changed from ${drawing.status} to Approved`) },
                                  { text: 'Rename', onPress: () => Alert.alert('Rename', 'Enter new name for the document') },
                                  { text: 'Done', style: 'cancel' }
                                ]
                              );
                            }
                          },
                          { 
                            text: 'Open in CAD', 
                            onPress: () => {
                              Alert.alert('Open in CAD', `Opening ${drawing.name} in CAD software...\n\nAvailable CAD Tools:\n• AutoCAD\n• Revit\n• SketchUp\n• DraftSight\n\nSelect your preferred CAD application to edit this drawing.`);
                            }
                          },
                          { 
                            text: 'Add Annotations', 
                            onPress: () => {
                              Alert.alert('Add Annotations', `Annotation Tools:\n\n• Text notes\n• Markup tools\n• Highlight areas\n• Add dimensions\n• Stamps & signatures\n• Comments\n\nAll annotations will be saved with the document.`);
                            }
                          },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
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
            
            {vendors.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No vendors available</Text>
                <Text style={styles.emptyStateSubtext}>Vendors will appear here once added</Text>
              </View>
            ) : (
              vendors.map(vendor => (
                <View key={vendor.id} style={styles.vendorCard}>
                  <View style={styles.vendorHeader}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    {vendor.rating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{vendor.rating}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.vendorCode}>Code: {vendor.code}</Text>
                  <Text style={styles.vendorType}>{vendor.type}</Text>
                  <Text style={styles.vendorContact}>Contact: {vendor.contact}</Text>
                  <Text style={styles.vendorEmail}>Email: {vendor.email}</Text>
                  <Text style={styles.vendorPhone}>Phone: {vendor.phone}</Text>
                  <View style={styles.vendorActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#e8f5e8' }]} 
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert('Quote Request', `Quote request sent to ${vendor.name}. They will respond within 24 hours.`);
                      }}
                    >
                      <Ionicons name="document-text" size={16} color="#4caf50" />
                      <Text style={[styles.actionBtnText, { color: '#4caf50' }]}>Request Quote</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} 
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert('Contact Info', `${vendor.contact}\n${vendor.phone}\n${vendor.email}`);
                      }}
                    >
                      <Ionicons name="call" size={16} color="#1976d2" />
                      <Text style={[styles.actionBtnText, { color: '#1976d2' }]}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
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
            
            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No reports available</Text>
                <Text style={styles.emptyStateSubtext}>Create your first technical report</Text>
              </View>
            ) : (
              reports.map(report => (
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
              ))
            )}
          </ScrollView>
        );

      case "Attendance Tracking":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>⏰ Attendance Tracking</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AttendanceTracking')}>
                <Ionicons name="time" size={20} color="#fff" />
                <Text style={styles.addButtonText}>View Attendance</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Employee Attendance</Text>
              <Text style={styles.managementDescription}>Track check-in/check-out times and monitor attendance records</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('AttendanceTracking')}>
                <Text style={styles.managementButtonText}>Open Attendance Tracking</Text>
              </TouchableOpacity>
            </View>
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
          <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
            {/* Professional Engineer Header */}
            <View style={styles.engineerHeader}>
              <View style={styles.engineerGradient}>
                <View style={styles.engineerContent}>
                  <View style={styles.engineerIcon}>
                    <Ionicons name="construct" size={32} color="#FFD700" />
                  </View>
                  <Text style={styles.engineerGreeting}>Technical Excellence</Text>
                  <Text style={styles.engineerName}>{user?.first_name || user?.username || 'Site Engineer'}</Text>
                  <Text style={styles.engineerRole}>Engineering precision in construction</Text>
                  <View style={styles.engineerDateCard}>
                    <Text style={styles.engineerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                    <Text style={styles.engineerTime}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Engineering Metrics */}
            <View style={styles.engineeringMetrics}>
              <Text style={styles.sectionTitle}>🔧 Engineering Dashboard</Text>
              <View style={styles.engineeringGrid}>
                <View style={[styles.engineeringCard, { borderLeftColor: '#FF9800' }]}>
                  <View style={styles.engineeringHeader}>
                    <Ionicons name="construct" size={28} color="#FF9800" />
                    <View style={styles.engineeringTrend}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={styles.engineeringTrendText}>+25%</Text>
                    </View>
                  </View>
                  <Text style={styles.engineeringNumber}>{tasks.length}</Text>
                  <Text style={styles.engineeringLabel}>Technical Tasks</Text>
                  <Text style={styles.engineeringDetail}>{tasks.filter(t => t.status === 'In Progress').length} active, {tasks.filter(t => t.status === 'Completed').length} completed</Text>
                </View>

                <View style={[styles.engineeringCard, { borderLeftColor: '#4CAF50' }]}>
                  <View style={styles.engineeringHeader}>
                    <Ionicons name="document-text" size={28} color="#4CAF50" />
                    <View style={styles.engineeringTrend}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.engineeringTrendText}>95%</Text>
                    </View>
                  </View>
                  <Text style={styles.engineeringNumber}>{drawings.length}</Text>
                  <Text style={styles.engineeringLabel}>Technical Drawings</Text>
                  <Text style={styles.engineeringDetail}>{drawings.filter(d => d.status === 'Approved').length} approved, {drawings.filter(d => d.status === 'Under Review').length} pending</Text>
                </View>

                <View style={[styles.engineeringCard, { borderLeftColor: '#2196F3' }]}>
                  <View style={styles.engineeringHeader}>
                    <Ionicons name="build" size={28} color="#2196F3" />
                    <View style={styles.engineeringTrend}>
                      <Ionicons name="checkmark" size={16} color="#4CAF50" />
                      <Text style={styles.engineeringTrendText}>92%</Text>
                    </View>
                  </View>
                  <Text style={styles.engineeringNumber}>{equipment.length}</Text>
                  <Text style={styles.engineeringLabel}>Equipment Status</Text>
                  <Text style={styles.engineeringDetail}>{equipment.filter(e => e.status === 'Operational').length} operational, 92% uptime</Text>
                </View>

                <View style={[styles.engineeringCard, { borderLeftColor: '#9C27B0' }]}>
                  <View style={styles.engineeringHeader}>
                    <Ionicons name="bar-chart" size={28} color="#9C27B0" />
                    <View style={styles.engineeringTrend}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={styles.engineeringTrendText}>+18%</Text>
                    </View>
                  </View>
                  <Text style={styles.engineeringNumber}>{reports.length}</Text>
                  <Text style={styles.engineeringLabel}>Technical Reports</Text>
                  <Text style={styles.engineeringDetail}>{reports.filter(r => r.status === 'Submitted').length} submitted this week</Text>
                </View>
              </View>
            </View>

            {/* Technical Priorities */}
            <View style={styles.technicalPriorities}>
              <Text style={styles.sectionTitle}>⚡ Technical Priorities</Text>
              <View style={styles.prioritiesContainer}>
                {tasks.length === 0 ? (
                  <View style={styles.emptyPriorities}>
                    <Text style={styles.emptyPrioritiesText}>No priority tasks at the moment</Text>
                  </View>
                ) : (
                  tasks
                    .filter(task => task.status !== 'Completed' && task.status !== 'completed')
                    .slice(0, 3)
                    .map((task, index) => {
                      const priorityColor = task.priority === 'High' || task.priority === 'high' ? '#F44336' : 
                                          task.priority === 'Medium' || task.priority === 'medium' ? '#FF9800' : '#4CAF50';
                      const priorityIcon = task.priority === 'High' || task.priority === 'high' ? 'warning' : 
                                         task.priority === 'Medium' || task.priority === 'medium' ? 'time' : 'checkmark-circle';
                      
                      return (
                        <View key={task.id} style={[styles.priorityCard, { borderLeftColor: priorityColor }]}>
                          <View style={styles.priorityIcon}>
                            <Ionicons name={priorityIcon} size={24} color={priorityColor} />
                          </View>
                          <View style={styles.priorityContent}>
                            <Text style={styles.priorityTitle}>{task.title}</Text>
                            <Text style={styles.priorityText}>{task.status} - {task.progress}% complete</Text>
                            <Text style={styles.priorityProject}>Due: {task.dueDate} - {task.priority} Priority</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.priorityAction}
                            onPress={() => setActivePage('Technical Tasks')}
                          >
                            <Ionicons name="chevron-forward" size={20} color={priorityColor} />
                          </TouchableOpacity>
                        </View>
                      );
                    })
                )}
              </View>
            </View>

            {/* Engineering Control Center */}
            <View style={styles.engineeringControl}>
              <Text style={styles.sectionTitle}>🎯 Engineering Control Center</Text>
              <View style={styles.controlGrid}>
                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => setActivePage('Technical Tasks')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="construct" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Technical Tasks</Text>
                  <Text style={styles.controlSubtitle}>{tasks.length} active tasks</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>{Math.round((tasks.filter(t => t.progress === 100).length / tasks.length) * 100)}%</Text>
                    <Text style={styles.controlLabel}>Completion Rate</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E8F5E8' }]}
                  onPress={() => setActivePage('Drawings & Documents')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="document-text" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Drawings & Docs</Text>
                  <Text style={styles.controlSubtitle}>{drawings.length} technical drawings</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>{drawings.filter(d => d.status === 'Approved').length}</Text>
                    <Text style={styles.controlLabel}>Approved</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E3F2FD' }]}
                  onPress={() => setActivePage('Equipment Management')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="build" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Equipment</Text>
                  <Text style={styles.controlSubtitle}>{equipment.length} units managed</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>{equipment.filter(e => e.status === 'Operational').length}</Text>
                    <Text style={styles.controlLabel}>Operational</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#F3E5F5' }]}
                  onPress={() => setActivePage('Technical Reports')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="bar-chart" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Reports</Text>
                  <Text style={styles.controlSubtitle}>{reports.length} technical reports</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>{reports.filter(r => r.status === 'Submitted').length}</Text>
                    <Text style={styles.controlLabel}>Submitted</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Engineering Tools */}
            <View style={styles.engineeringTools}>
              <Text style={styles.sectionTitle}>🔧 Engineering Tools</Text>
              <View style={styles.toolsGrid}>
                <TouchableOpacity style={styles.toolItem} onPress={() => setActivePage('Vendor Management')}>
                  <Ionicons name="business" size={24} color="#673AB7" />
                  <Text style={styles.toolText}>Vendors</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => {
                  Alert.alert(
                    '🎨 CAD Tools',
                    'Engineering CAD Software:\n\n• AutoCAD - 2D/3D design\n• Revit - BIM modeling\n• SketchUp - 3D visualization\n• Civil 3D - Infrastructure design\n\nSelect your preferred CAD software to launch.',
                    [
                      { text: 'AutoCAD', onPress: () => Alert.alert('AutoCAD', 'Launching AutoCAD...') },
                      { text: 'Revit', onPress: () => Alert.alert('Revit', 'Launching Revit...') },
                      { text: 'Close', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="shapes" size={24} color="#795548" />
                  <Text style={styles.toolText}>CAD Tools</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => {
                  Alert.alert(
                    '🔢 Engineering Calculator',
                    'Construction Calculators:\n\n• Concrete Volume Calculator\n• Steel Weight Calculator\n• Load Bearing Calculator\n• Material Quantity Estimator\n• Cost Calculator\n\nExample: Concrete Volume\nLength × Width × Depth\n10m × 5m × 0.15m = 7.5 m³',
                    [
                      { text: 'Concrete Calc', onPress: () => Alert.alert('Concrete Calculator', 'Enter dimensions:\nLength (m): ___\nWidth (m): ___\nDepth (m): ___\n\nFormula: L × W × D = Volume (m³)') },
                      { text: 'Steel Calc', onPress: () => Alert.alert('Steel Calculator', 'Steel Weight Formula:\nWeight = Volume × Density\nDensity of Steel = 7850 kg/m³') },
                      { text: 'Close', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="calculator" size={24} color="#607D8B" />
                  <Text style={styles.toolText}>Calculator</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => {
                  Alert.alert(
                    '📚 Technical Specifications',
                    'Engineering Standards & Specs:\n\n📋 Building Codes:\n• IS 456 - Concrete structures\n• IS 800 - Steel structures\n• IS 1893 - Earthquake resistant\n\n📐 Material Standards:\n• Concrete: M20, M25, M30\n• Steel: Fe 415, Fe 500\n• Cement: OPC 43, OPC 53\n\n🔧 Quality Standards:\n• ISO 9001 - Quality management\n• IS 383 - Coarse & fine aggregates',
                    [
                      { text: 'View Codes', onPress: () => Alert.alert('Building Codes', 'IS 456:2000 - Plain and Reinforced Concrete\nIS 800:2007 - General Construction in Steel\nIS 1893:2016 - Earthquake Resistant Design') },
                      { text: 'Material Specs', onPress: () => Alert.alert('Material Specifications', 'Concrete Grades: M15, M20, M25, M30, M35, M40\nSteel Grades: Fe 415, Fe 500, Fe 550\nCement Types: OPC 33, OPC 43, OPC 53') },
                      { text: 'Close', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="library" size={24} color="#FF5722" />
                  <Text style={styles.toolText}>Specs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => {
                  Alert.alert(
                    '📏 Measurement Tools',
                    'Site Measurement Instruments:\n\n📐 Distance Measurement:\n• Laser Distance Meter\n• Measuring Tape\n• Total Station\n\n📊 Level Measurement:\n• Spirit Level\n• Laser Level\n• Theodolite\n\n🎯 Area Calculation:\n• GPS Survey\n• Digital Planimeter\n\nTip: Always verify measurements twice for accuracy.',
                    [
                      { text: 'Laser Meter', onPress: () => Alert.alert('Laser Distance Meter', 'Range: 0.05m - 200m\nAccuracy: ±1.5mm\nFeatures: Area, Volume, Pythagoras') },
                      { text: 'Total Station', onPress: () => Alert.alert('Total Station', 'Precision: 2" angular accuracy\nRange: 5000m\nUse: Surveying, Layout, As-built') },
                      { text: 'Close', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="resize" size={24} color="#009688" />
                  <Text style={styles.toolText}>Measure</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => {
                  Alert.alert(
                    '✅ Quality Assurance',
                    'Quality Control Checklist:\n\n🔍 Material Testing:\n• Concrete slump test\n• Cube strength test\n• Steel tensile test\n• Aggregate sieve analysis\n\n📋 Workmanship Check:\n• Reinforcement placement\n• Concrete cover\n• Formwork alignment\n• Curing procedures\n\n📊 Documentation:\n• Test reports\n• Inspection records\n• Non-conformance reports',
                    [
                      { text: 'Concrete Tests', onPress: () => Alert.alert('Concrete Testing', 'Slump Test: 25-100mm\nCube Test: 7, 14, 28 days\nTarget Strength: fck + 1.65σ\nAcceptance: ≥ fck + 0.825σ') },
                      { text: 'Steel Tests', onPress: () => Alert.alert('Steel Testing', 'Tensile Strength Test\nBend Test\nRebend Test\nChemical Analysis\nAcceptance as per IS 1786') },
                      { text: 'Inspection', onPress: () => Alert.alert('Quality Inspection', 'Daily Checklist:\n☑ Material quality\n☑ Workmanship\n☑ Dimensions\n☑ Safety compliance\n☑ Documentation') },
                      { text: 'Close', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
                  <Text style={styles.toolText}>Quality</Text>
                </TouchableOpacity>
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
          { title: "Technical Reports", icon: "bar-chart" },
          { title: "Attendance Tracking", icon: "time" }
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
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#003366", 
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold", 
    marginLeft: 15,
    flex: 1,
  },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  // Professional Engineer Header Styles
  engineerHeader: {
    marginBottom: 20,
  },
  engineerGradient: {
    backgroundColor: "#003366",
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: "center",
  },
  engineerContent: {
    alignItems: "center",
    width: "100%",
  },
  engineerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  engineerGreeting: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  engineerName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  engineerRole: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 18,
    fontWeight: "500",
  },
  engineerDateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  engineerDate: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  engineerTime: {
    color: "#B3D9FF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },

  // Engineering Metrics Section
  engineeringMetrics: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  engineeringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  engineeringCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    width: "48%",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
  },
  engineeringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  engineeringTrend: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  engineeringTrendText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 3,
  },
  engineeringNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#003366",
    marginBottom: 6,
  },
  engineeringLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  engineeringDetail: {
    fontSize: 11,
    color: "#999",
    lineHeight: 15,
  },

  // Technical Priorities Section
  technicalPriorities: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  prioritiesContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 5,
    elevation: 3,
  },
  priorityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    borderLeftWidth: 4,
  },
  priorityIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 3,
  },
  priorityText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  priorityProject: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
  priorityAction: {
    padding: 8,
  },

  // Engineering Control Section
  engineeringControl: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  controlCard: {
    width: "48%",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  controlTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 4,
  },
  controlSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  controlMetric: {
    alignItems: "flex-start",
  },
  controlValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
  },
  controlLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },

  // Engineering Tools Section
  engineeringTools: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  toolItem: {
    alignItems: "center",
    width: "30%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
  },
  toolText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#003366",
    marginTop: 6,
    textAlign: "center",
  },

  // Legacy styles (keeping for compatibility)
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
  },
  dateTimeText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
  },
  
  // Enhanced Stats Section
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  tasksCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF9800",
  },
  drawingsCard: {
    borderTopWidth: 3,
    borderTopColor: "#4CAF50",
  },
  equipmentCard: {
    borderTopWidth: 3,
    borderTopColor: "#2196F3",
  },
  statIconContainer: {
    marginBottom: 8,
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
  statSubtext: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  
  // Actions Section
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
  
  // Performance Section
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
  
  // Quality Section
  qualitySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  qualityCard: {
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  qualityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 10,
  },
  qualityText: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 10,
  },
  qualityStats: {
    alignItems: "center",
  },
  qualityMetric: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  
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
  // Enhanced Alerts Section
  alertsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
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
  warningAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginBottom: 2,
  },
  warningText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
    fontWeight: "500",
  },
  warningTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
  
  // Empty state styles
  managementCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginHorizontal: 20, marginBottom: 15, elevation: 2, alignItems: "center" },
  managementTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 8 },
  managementDescription: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 15, lineHeight: 20 },
  managementButton: { backgroundColor: "#003366", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  managementButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  emptyPriorities: {
    padding: 20,
    alignItems: "center",
  },
  emptyPrioritiesText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});