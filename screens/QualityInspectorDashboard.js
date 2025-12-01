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
import { qualityAPI, taskAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function QualityInspectorDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [testReports, setTestReports] = useState([]);
  const [nonConformances, setNonConformances] = useState([]);
  const [standards, setStandards] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalType, setModalType] = useState('inspection');
  const [inspectionForm, setInspectionForm] = useState({
    title: '',
    location: '',
    type: 'Material',
    notes: '',
    result: 'Pass'
  });
  const [testReportForm, setTestReportForm] = useState({
    title: '',
    testType: 'Material Testing',
    sampleId: '',
    specification: '',
    laboratory: ''
  });
  const [ncrForm, setNcrForm] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'Medium',
    assignedTo: ''
  });
  const [standardForm, setStandardForm] = useState({
    title: '',
    category: 'Structural',
    version: '',
    status: 'Current'
  });
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Material',
    location: '',
    priority: 'Medium'
  });
  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);
  const [currentInspection, setCurrentInspection] = useState(null);
  const [inspectionData, setInspectionData] = useState({
    checklist_items: '',
    observations: '',
    defects_found: '',
    recommendations: '',
    score: '',
    status: 'in_progress'
  });
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadInspections();
    loadTestReports();
    loadNonConformances();
    loadStandards();
    loadSchedule();
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

  const loadInspections = async () => {
    try {
      const response = await qualityAPI.getInspections();
      setInspections(response.data.map(inspection => ({
        id: inspection.id,
        title: inspection.inspection_type + ' - ' + (inspection.task_title || 'General'),
        date: inspection.inspection_date?.split('T')[0] || inspection.created_at?.split('T')[0],
        type: inspection.inspection_type,
        location: inspection.location || 'Not specified',
        result: inspection.result,
        score: inspection.score || 0,
        inspector: inspection.inspector_name || 'Quality Inspector',
        notes: inspection.notes || ''
      })));
    } catch (error) {
      console.error('Error loading inspections:', error);
      setInspections([
        {
          id: 1,
          title: 'Concrete Strength Test - Foundation',
          date: '2024-01-12',
          type: 'material',
          location: 'Site A - Block A',
          result: 'pass',
          score: 95,
          inspector: 'Quality Inspector',
          notes: 'Concrete meets specified strength requirements'
        }
      ]);
    }
  };

  const loadTestReports = () => {
    setTestReports([
      {
        id: 1,
        title: 'Concrete Compressive Strength Test',
        date: '2024-01-12',
        testType: 'Material Testing',
        sampleId: 'CON-001-2024',
        result: '35.2 MPa',
        specification: '≥30 MPa',
        status: 'Pass',
        laboratory: 'ABC Testing Lab'
      },
      {
        id: 2,
        title: 'Steel Tensile Strength Test',
        date: '2024-01-11',
        testType: 'Material Testing',
        sampleId: 'STL-002-2024',
        result: '520 MPa',
        specification: '≥500 MPa',
        status: 'Pass',
        laboratory: 'XYZ Materials Lab'
      },
      {
        id: 3,
        title: 'Soil Compaction Test',
        date: '2024-01-09',
        testType: 'Geotechnical',
        sampleId: 'SOIL-003-2024',
        result: '92%',
        specification: '≥95%',
        status: 'Fail',
        laboratory: 'Geo Testing Services'
      }
    ]);
  };

  const loadNonConformances = () => {
    setNonConformances([
      {
        id: 1,
        title: 'Concrete Surface Defects',
        date: '2024-01-11',
        severity: 'Medium',
        location: 'Site A - Column C3',
        description: 'Honeycomb formation observed in concrete column',
        status: 'Open',
        assignedTo: 'Site Engineer',
        dueDate: '2024-01-18'
      },
      {
        id: 2,
        title: 'Incorrect Rebar Spacing',
        date: '2024-01-10',
        severity: 'High',
        location: 'Site A - Beam B2',
        description: 'Rebar spacing does not match approved drawings',
        status: 'In Progress',
        assignedTo: 'Structural Engineer',
        dueDate: '2024-01-15'
      },
      {
        id: 3,
        title: 'Paint Finish Quality',
        date: '2024-01-08',
        severity: 'Low',
        location: 'Site A - Interior Walls',
        description: 'Uneven paint application in several areas',
        status: 'Closed',
        assignedTo: 'Painting Contractor',
        dueDate: '2024-01-12'
      }
    ]);
  };

  const loadStandards = () => {
    setStandards([
      {
        id: 1,
        title: 'ACI 318 - Building Code Requirements for Structural Concrete',
        category: 'Structural',
        version: '2019',
        lastUpdated: '2024-01-01',
        status: 'Current'
      },
      {
        id: 2,
        title: 'AISC 360 - Specification for Structural Steel Buildings',
        category: 'Structural',
        version: '2016',
        lastUpdated: '2023-12-15',
        status: 'Current'
      },
      {
        id: 3,
        title: 'ASTM C39 - Compressive Strength of Cylindrical Concrete Specimens',
        category: 'Testing',
        version: '2021',
        lastUpdated: '2023-11-20',
        status: 'Current'
      },
      {
        id: 4,
        title: 'IBC 2021 - International Building Code',
        category: 'General',
        version: '2021',
        lastUpdated: '2023-10-01',
        status: 'Outdated'
      }
    ]);
  };

  const loadSchedule = () => {
    setSchedule([
      {
        id: 1,
        title: 'Foundation Inspection - Block B',
        date: '2024-01-15',
        time: '09:00 AM',
        type: 'Structural',
        location: 'Site A - Block B',
        status: 'Scheduled',
        priority: 'High'
      },
      {
        id: 2,
        title: 'Material Testing - Concrete Batch #5',
        date: '2024-01-16',
        time: '02:00 PM',
        type: 'Material',
        location: 'Site A - Batching Plant',
        status: 'Scheduled',
        priority: 'Medium'
      },
      {
        id: 3,
        title: 'Final Inspection - Electrical Panel Room',
        date: '2024-01-17',
        time: '11:00 AM',
        type: 'Final',
        location: 'Site A - Electrical Room',
        status: 'Scheduled',
        priority: 'High'
      }
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

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const submitForm = async () => {
    switch (modalType) {
      case 'inspection':
        return submitInspection();
      case 'testReport':
        return submitTestReport();
      case 'ncr':
        return submitNCR();
      case 'standard':
        return submitStandard();
      case 'schedule':
        return submitSchedule();
      default:
        return;
    }
  };

  const submitInspection = async () => {
    if (!inspectionForm.title || !inspectionForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      const response = await qualityAPI.createInspection({
        inspection_type: inspectionForm.type,
        scheduled_date: new Date().toISOString().split('T')[0],
        status: inspectionForm.result === 'Pass' ? 'passed' : 'failed',
        observations: inspectionForm.notes,
        score: inspectionForm.result === 'Pass' ? 90 : 60,
        inspector: user.id,
        project: 1,
        task: 1
      });
      const newInspection = {
        id: response.data.id,
        title: inspectionForm.title,
        date: new Date().toISOString().split('T')[0],
        type: inspectionForm.type,
        location: inspectionForm.location,
        result: inspectionForm.result,
        score: inspectionForm.result === 'Pass' ? 90 : 60,
        inspector: 'Quality Inspector',
        notes: inspectionForm.notes
      };
      setInspections([newInspection, ...inspections]);
      setInspectionForm({ title: '', location: '', type: 'Material', notes: '', result: 'Pass' });
      setModalVisible(false);
      Alert.alert('Success', 'Inspection report submitted successfully!');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      Alert.alert('Error', 'Failed to submit inspection report');
    }
  };

  const submitTestReport = () => {
    if (!testReportForm.title || !testReportForm.sampleId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newReport = {
      id: testReports.length + 1,
      title: testReportForm.title,
      date: new Date().toISOString().split('T')[0],
      testType: testReportForm.testType,
      sampleId: testReportForm.sampleId,
      result: 'Pending',
      specification: testReportForm.specification,
      status: 'Pending',
      laboratory: testReportForm.laboratory
    };
    setTestReports([newReport, ...testReports]);
    setTestReportForm({ title: '', testType: 'Material Testing', sampleId: '', specification: '', laboratory: '' });
    setModalVisible(false);
    Alert.alert('Success', 'Test report created successfully!');
  };

  const submitNCR = () => {
    if (!ncrForm.title || !ncrForm.description || !ncrForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newNCR = {
      id: nonConformances.length + 1,
      title: ncrForm.title,
      date: new Date().toISOString().split('T')[0],
      severity: ncrForm.severity,
      location: ncrForm.location,
      description: ncrForm.description,
      status: 'Open',
      assignedTo: ncrForm.assignedTo || 'Unassigned',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setNonConformances([newNCR, ...nonConformances]);
    setNcrForm({ title: '', description: '', location: '', severity: 'Medium', assignedTo: '' });
    setModalVisible(false);
    Alert.alert('Success', 'NCR reported successfully!');
  };

  const submitStandard = () => {
    if (!standardForm.title || !standardForm.version) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newStandard = {
      id: standards.length + 1,
      title: standardForm.title,
      category: standardForm.category,
      version: standardForm.version,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: standardForm.status
    };
    setStandards([newStandard, ...standards]);
    setStandardForm({ title: '', category: 'Structural', version: '', status: 'Current' });
    setModalVisible(false);
    Alert.alert('Success', 'Standard added successfully!');
  };

  const submitSchedule = () => {
    if (!scheduleForm.title || !scheduleForm.date || !scheduleForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newSchedule = {
      id: schedule.length + 1,
      title: scheduleForm.title,
      date: scheduleForm.date,
      time: scheduleForm.time || '09:00 AM',
      type: scheduleForm.type,
      location: scheduleForm.location,
      status: 'Scheduled',
      priority: scheduleForm.priority
    };
    setSchedule([newSchedule, ...schedule]);
    setScheduleForm({ title: '', date: '', time: '', type: 'Material', location: '', priority: 'Medium' });
    setModalVisible(false);
    Alert.alert('Success', 'Inspection scheduled successfully!');
  };

  const renderContent = () => {
    switch (activePage) {
      case "Quality Inspections":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🔍 Quality Inspections</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('inspection')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New Inspection</Text>
              </TouchableOpacity>
            </View>
            
            {inspections.map(inspection => (
              <View key={inspection.id} style={styles.inspectionCard}>
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionTitle}>{inspection.title}</Text>
                  <View style={[styles.resultBadge, { 
                    backgroundColor: inspection.result === 'Pass' ? '#4CAF50' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{inspection.result}</Text>
                  </View>
                </View>
                
                <View style={styles.inspectionDetails}>
                  <View style={styles.inspectionDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.inspectionDetailText}>Date: {inspection.date}</Text>
                  </View>
                  <View style={styles.inspectionDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.inspectionDetailText}>{inspection.location}</Text>
                  </View>
                  <View style={styles.inspectionDetailRow}>
                    <Ionicons name="clipboard-outline" size={16} color="#666" />
                    <Text style={styles.inspectionDetailText}>Type: {inspection.type}</Text>
                  </View>
                  <View style={styles.inspectionDetailRow}>
                    <Ionicons name="star-outline" size={16} color="#666" />
                    <Text style={styles.inspectionDetailText}>Score: {inspection.score}%</Text>
                  </View>
                </View>
                
                <Text style={styles.inspectionNotes}>{inspection.notes}</Text>
                
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => Alert.alert('Inspection Report', `Full report for ${inspection.title}\n\nDate: ${inspection.date}\nLocation: ${inspection.location}\nType: ${inspection.type}\nResult: ${inspection.result}\nScore: ${inspection.score}%\n\nNotes: ${inspection.notes}`)}
                >
                  <Text style={styles.viewButtonText}>View Full Report</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case "Test Reports":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📊 Test Reports</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('testReport')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New Report</Text>
              </TouchableOpacity>
            </View>
            
            {testReports.map(report => (
              <View key={report.id} style={styles.testReportCard}>
                <View style={styles.testReportHeader}>
                  <Text style={styles.testReportTitle}>{report.title}</Text>
                  <View style={[styles.resultBadge, { 
                    backgroundColor: report.status === 'Pass' ? '#4CAF50' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>
                
                <View style={styles.testReportDetails}>
                  <View style={styles.testReportRow}>
                    <Text style={styles.testReportLabel}>Sample ID:</Text>
                    <Text style={styles.testReportValue}>{report.sampleId}</Text>
                  </View>
                  <View style={styles.testReportRow}>
                    <Text style={styles.testReportLabel}>Test Type:</Text>
                    <Text style={styles.testReportValue}>{report.testType}</Text>
                  </View>
                  <View style={styles.testReportRow}>
                    <Text style={styles.testReportLabel}>Result:</Text>
                    <Text style={styles.testReportValue}>{report.result}</Text>
                  </View>
                  <View style={styles.testReportRow}>
                    <Text style={styles.testReportLabel}>Specification:</Text>
                    <Text style={styles.testReportValue}>{report.specification}</Text>
                  </View>
                  <View style={styles.testReportRow}>
                    <Text style={styles.testReportLabel}>Laboratory:</Text>
                    <Text style={styles.testReportValue}>{report.laboratory}</Text>
                  </View>
                </View>
                
                <View style={styles.testReportActions}>
                  <Text style={styles.testReportDate}>{report.date}</Text>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => Alert.alert('Test Certificate', `Certificate for ${report.title}\n\nSample ID: ${report.sampleId}\nTest Type: ${report.testType}\nResult: ${report.result}\nSpecification: ${report.specification}\nLaboratory: ${report.laboratory}\nStatus: ${report.status}`)}
                  >
                    <Text style={styles.viewButtonText}>View Certificate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Non-Conformance":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>⚠️ Non-Conformance</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('ncr')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Report NCR</Text>
              </TouchableOpacity>
            </View>
            
            {nonConformances.map(ncr => (
              <View key={ncr.id} style={styles.ncrCard}>
                <View style={styles.ncrHeader}>
                  <Text style={styles.ncrTitle}>{ncr.title}</Text>
                  <View style={[styles.severityBadge, { 
                    backgroundColor: ncr.severity === 'High' ? '#F44336' : 
                                   ncr.severity === 'Medium' ? '#FF9800' : '#4CAF50'
                  }]}>
                    <Text style={styles.statusText}>{ncr.severity}</Text>
                  </View>
                </View>
                
                <Text style={styles.ncrDescription}>{ncr.description}</Text>
                
                <View style={styles.ncrDetails}>
                  <View style={styles.ncrDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.ncrDetailText}>{ncr.location}</Text>
                  </View>
                  <View style={styles.ncrDetailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.ncrDetailText}>Assigned to: {ncr.assignedTo}</Text>
                  </View>
                  <View style={styles.ncrDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.ncrDetailText}>Due: {ncr.dueDate}</Text>
                  </View>
                </View>
                
                <View style={styles.ncrActions}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: ncr.status === 'Closed' ? '#4CAF50' : 
                                   ncr.status === 'In Progress' ? '#FF9800' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{ncr.status}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => Alert.alert('NCR Details', `${ncr.title}\n\nDescription: ${ncr.description}\nLocation: ${ncr.location}\nSeverity: ${ncr.severity}\nStatus: ${ncr.status}\nAssigned to: ${ncr.assignedTo}\nDue Date: ${ncr.dueDate}`)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Quality Standards":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 Quality Standards</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('standard')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Standard</Text>
              </TouchableOpacity>
            </View>
            
            {standards.map(standard => (
              <View key={standard.id} style={styles.standardCard}>
                <View style={styles.standardHeader}>
                  <Text style={styles.standardTitle}>{standard.title}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: standard.status === 'Current' ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{standard.status}</Text>
                  </View>
                </View>
                
                <View style={styles.standardDetails}>
                  <View style={styles.standardDetailRow}>
                    <Ionicons name="folder-outline" size={16} color="#666" />
                    <Text style={styles.standardDetailText}>Category: {standard.category}</Text>
                  </View>
                  <View style={styles.standardDetailRow}>
                    <Ionicons name="document-outline" size={16} color="#666" />
                    <Text style={styles.standardDetailText}>Version: {standard.version}</Text>
                  </View>
                  <View style={styles.standardDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.standardDetailText}>Updated: {standard.lastUpdated}</Text>
                  </View>
                </View>
                
                <View style={styles.standardActions}>
                  <TouchableOpacity 
                    style={styles.standardButton}
                    onPress={() => Alert.alert('Download', `Downloading ${standard.title} v${standard.version}`)}
                  >
                    <Ionicons name="download-outline" size={16} color="#003366" />
                    <Text style={styles.standardButtonText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.standardButton}
                    onPress={() => Alert.alert('Standard Details', `${standard.title}\n\nCategory: ${standard.category}\nVersion: ${standard.version}\nLast Updated: ${standard.lastUpdated}\nStatus: ${standard.status}`)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#003366" />
                    <Text style={styles.standardButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Inspection Schedule":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📅 Inspection Schedule</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('schedule')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Schedule Inspection</Text>
              </TouchableOpacity>
            </View>
            
            {schedule.map(item => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <View style={[styles.priorityBadge, { 
                    backgroundColor: item.priority === 'High' ? '#F44336' : 
                                   item.priority === 'Medium' ? '#FF9800' : '#4CAF50'
                  }]}>
                    <Text style={styles.statusText}>{item.priority}</Text>
                  </View>
                </View>
                
                <View style={styles.scheduleDetails}>
                  <View style={styles.scheduleDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.scheduleDetailText}>{item.date} at {item.time}</Text>
                  </View>
                  <View style={styles.scheduleDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.scheduleDetailText}>{item.location}</Text>
                  </View>
                  <View style={styles.scheduleDetailRow}>
                    <Ionicons name="clipboard-outline" size={16} color="#666" />
                    <Text style={styles.scheduleDetailText}>Type: {item.type}</Text>
                  </View>
                </View>
                
                <View style={styles.scheduleActions}>
                  <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      if (item.status === 'Scheduled') {
                        setCurrentInspection(item);
                        setInspectionData({
                          checklist_items: '',
                          observations: '',
                          defects_found: '',
                          recommendations: '',
                          score: '',
                          status: 'in_progress'
                        });
                        setInspectionModalVisible(true);
                      } else {
                        Alert.alert('Inspection Status', `This inspection is currently: ${item.status}`);
                      }
                    }}
                  >
                    <Text style={styles.viewButtonText}>
                      {item.status === 'Scheduled' ? 'Start Inspection' : 'View Status'}
                    </Text>
                  </TouchableOpacity>
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
        return (
          <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
            {/* Enhanced Welcome Header */}
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeBackground}>
                <View style={styles.qualityIcon}>
                  <Ionicons name="checkmark-circle" size={40} color="#FFD700" />
                </View>
                <Text style={styles.welcomeTitle}>Quality Excellence!</Text>
                <Text style={styles.welcomeName}>{user?.first_name || user?.username || 'Quality Inspector'}</Text>
                <Text style={styles.welcomeSubtitle}>Ensuring standards and delivering excellence in every inspection</Text>
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
                  <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.shiftText}>Quality Inspector Portal</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.alertsContainer}>
              <View style={styles.alertCard}>
                <Ionicons name="warning" size={24} color="#F44336" />
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>High Priority NCR</Text>
                  <Text style={styles.alertDescription}>Incorrect rebar spacing requires immediate attention</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{inspections.length}</Text>
                <Text style={styles.statLabel}>Inspections Done</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{testReports.length}</Text>
                <Text style={styles.statLabel}>Test Reports</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{nonConformances.filter(n => n.status === 'Open').length}</Text>
                <Text style={styles.statLabel}>Open NCRs</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <FlatList
              data={[
                { title: "🔍 Quality Inspections", count: `${inspections.length} completed` },
                { title: "📊 Test Reports", count: `${testReports.length} reports` },
                { title: "⚠️ Non-Conformance", count: `${nonConformances.length} NCRs` },
                { title: "📅 Inspection Schedule", count: `${schedule.length} scheduled` },
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
            
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>Concrete Strength Test Completed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>NCR Raised - Welding Quality</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
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
          {activePage === "Dashboard" ? "Quality Inspector Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      
      {/* Dynamic Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'inspection' && (
              <>
                <Text style={styles.modalTitle}>New Quality Inspection</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Inspection Title *"
                  value={inspectionForm.title}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  value={inspectionForm.location}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, location: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Type:</Text>
                  {['Material', 'Workmanship', 'Installation'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, {
                        backgroundColor: inspectionForm.type === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setInspectionForm({...inspectionForm, type})}
                    >
                      <Text style={[styles.typeText, {
                        color: inspectionForm.type === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.resultContainer}>
                  <Text style={styles.resultLabel}>Result:</Text>
                  {['Pass', 'Fail'].map(result => (
                    <TouchableOpacity
                      key={result}
                      style={[styles.resultOption, {
                        backgroundColor: inspectionForm.result === result ? 
                          (result === 'Pass' ? '#4CAF50' : '#F44336') : '#f5f5f5'
                      }]}
                      onPress={() => setInspectionForm({...inspectionForm, result})}
                    >
                      <Text style={[styles.resultText, {
                        color: inspectionForm.result === result ? '#fff' : '#666'
                      }]}>{result}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Inspection Notes"
                  value={inspectionForm.notes}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, notes: text})}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {modalType === 'testReport' && (
              <>
                <Text style={styles.modalTitle}>New Test Report</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Test Title *"
                  value={testReportForm.title}
                  onChangeText={(text) => setTestReportForm({...testReportForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Sample ID *"
                  value={testReportForm.sampleId}
                  onChangeText={(text) => setTestReportForm({...testReportForm, sampleId: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Test Type:</Text>
                  {['Material Testing', 'Geotechnical', 'Structural'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, {
                        backgroundColor: testReportForm.testType === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setTestReportForm({...testReportForm, testType: type})}
                    >
                      <Text style={[styles.typeText, {
                        color: testReportForm.testType === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Specification"
                  value={testReportForm.specification}
                  onChangeText={(text) => setTestReportForm({...testReportForm, specification: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Laboratory"
                  value={testReportForm.laboratory}
                  onChangeText={(text) => setTestReportForm({...testReportForm, laboratory: text})}
                />
              </>
            )}

            {modalType === 'ncr' && (
              <>
                <Text style={styles.modalTitle}>Report Non-Conformance</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NCR Title *"
                  value={ncrForm.title}
                  onChangeText={(text) => setNcrForm({...ncrForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  value={ncrForm.location}
                  onChangeText={(text) => setNcrForm({...ncrForm, location: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Severity:</Text>
                  {['Low', 'Medium', 'High'].map(severity => (
                    <TouchableOpacity
                      key={severity}
                      style={[styles.typeOption, {
                        backgroundColor: ncrForm.severity === severity ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setNcrForm({...ncrForm, severity})}
                    >
                      <Text style={[styles.typeText, {
                        color: ncrForm.severity === severity ? '#fff' : '#666'
                      }]}>{severity}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Assigned To"
                  value={ncrForm.assignedTo}
                  onChangeText={(text) => setNcrForm({...ncrForm, assignedTo: text})}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description *"
                  value={ncrForm.description}
                  onChangeText={(text) => setNcrForm({...ncrForm, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {modalType === 'standard' && (
              <>
                <Text style={styles.modalTitle}>Add Quality Standard</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Standard Title *"
                  value={standardForm.title}
                  onChangeText={(text) => setStandardForm({...standardForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Version *"
                  value={standardForm.version}
                  onChangeText={(text) => setStandardForm({...standardForm, version: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Category:</Text>
                  {['Structural', 'Testing', 'General'].map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.typeOption, {
                        backgroundColor: standardForm.category === category ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setStandardForm({...standardForm, category})}
                    >
                      <Text style={[styles.typeText, {
                        color: standardForm.category === category ? '#fff' : '#666'
                      }]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {modalType === 'schedule' && (
              <>
                <Text style={styles.modalTitle}>Schedule Inspection</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Inspection Title *"
                  value={scheduleForm.title}
                  onChangeText={(text) => setScheduleForm({...scheduleForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date (YYYY-MM-DD) *"
                  value={scheduleForm.date}
                  onChangeText={(text) => setScheduleForm({...scheduleForm, date: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Time (e.g., 09:00 AM)"
                  value={scheduleForm.time}
                  onChangeText={(text) => setScheduleForm({...scheduleForm, time: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  value={scheduleForm.location}
                  onChangeText={(text) => setScheduleForm({...scheduleForm, location: text})}
                />
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Type:</Text>
                  {['Material', 'Structural', 'Final'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, {
                        backgroundColor: scheduleForm.type === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setScheduleForm({...scheduleForm, type})}
                    >
                      <Text style={[styles.typeText, {
                        color: scheduleForm.type === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Priority:</Text>
                  {['Low', 'Medium', 'High'].map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={[styles.typeOption, {
                        backgroundColor: scheduleForm.priority === priority ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setScheduleForm({...scheduleForm, priority})}
                    >
                      <Text style={[styles.typeText, {
                        color: scheduleForm.priority === priority ? '#fff' : '#666'
                      }]}>{priority}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                  {modalType === 'inspection' ? 'Submit Inspection' :
                   modalType === 'testReport' ? 'Create Report' :
                   modalType === 'ncr' ? 'Report NCR' :
                   modalType === 'standard' ? 'Add Standard' :
                   modalType === 'schedule' ? 'Schedule' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Inspection Interface Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inspectionModalVisible}
        onRequestClose={() => setInspectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔍 Quality Inspection</Text>
            <Text style={styles.inspectionTitle}>{currentInspection?.title}</Text>
            <Text style={styles.inspectionDetails}>Location: {currentInspection?.location} | Type: {currentInspection?.type}</Text>
            
            <ScrollView style={styles.inspectionForm}>
              <Text style={styles.fieldLabel}>Checklist Items *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter inspection checklist items..."
                value={inspectionData.checklist_items}
                onChangeText={(text) => setInspectionData({...inspectionData, checklist_items: text})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.fieldLabel}>Observations</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Record your observations..."
                value={inspectionData.observations}
                onChangeText={(text) => setInspectionData({...inspectionData, observations: text})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.fieldLabel}>Defects Found</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List any defects found..."
                value={inspectionData.defects_found}
                onChangeText={(text) => setInspectionData({...inspectionData, defects_found: text})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.fieldLabel}>Recommendations</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide recommendations..."
                value={inspectionData.recommendations}
                onChangeText={(text) => setInspectionData({...inspectionData, recommendations: text})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.fieldLabel}>Quality Score (0-100)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quality score"
                value={inspectionData.score}
                onChangeText={(text) => setInspectionData({...inspectionData, score: text})}
                keyboardType="numeric"
              />
              
              <View style={styles.statusContainer}>
                <Text style={styles.fieldLabel}>Final Status:</Text>
                {['in_progress', 'passed', 'failed', 'rework_required'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, {
                      backgroundColor: inspectionData.status === status ? '#003366' : '#f5f5f5'
                    }]}
                    onPress={() => setInspectionData({...inspectionData, status})}
                  >
                    <Text style={[styles.statusText, {
                      color: inspectionData.status === status ? '#fff' : '#666'
                    }]}>{status.replace('_', ' ').toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setInspectionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={() => {
                  if (!inspectionData.checklist_items) {
                    Alert.alert('Error', 'Please fill checklist items');
                    return;
                  }
                  
                  const updatedSchedule = schedule.map(s => 
                    s.id === currentInspection.id ? {...s, status: inspectionData.status === 'in_progress' ? 'In Progress' : inspectionData.status.replace('_', ' ')} : s
                  );
                  setSchedule(updatedSchedule);
                  
                  const newInspection = {
                    id: inspections.length + 1,
                    title: currentInspection.title,
                    date: new Date().toISOString().split('T')[0],
                    type: currentInspection.type,
                    location: currentInspection.location,
                    result: inspectionData.status === 'passed' ? 'Pass' : inspectionData.status === 'failed' ? 'Fail' : 'Pending',
                    score: parseInt(inspectionData.score) || 0,
                    inspector: 'Quality Inspector',
                    notes: inspectionData.observations
                  };
                  setInspections([newInspection, ...inspections]);
                  
                  setInspectionModalVisible(false);
                  Alert.alert('Success', 'Inspection completed and saved!');
                }}
              >
                <Text style={styles.submitButtonText}>Complete Inspection</Text>
              </TouchableOpacity>
            </View>
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

      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
      >
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'Q'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Quality Inspector'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Quality Inspector'}</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />

        {[
          { title: "Dashboard", icon: "home" },
          { title: "Quality Inspections", icon: "search" },
          { title: "Test Reports", icon: "document-text" },
          { title: "Non-Conformance", icon: "alert-circle" },
          { title: "Quality Standards", icon: "library" },
          { title: "Inspection Schedule", icon: "calendar" }
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
    padding: 15,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  content: { flex: 1 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  // Dashboard styles
  dashboardHeader: { padding: 20, alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  
  alertsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  alertInfo: { marginLeft: 15, flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: "#C62828" },
  alertDescription: { fontSize: 12, color: "#B71C1C", marginTop: 2 },
  
  statsContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
  cardContainer: { paddingHorizontal: 10 },
  dashboardCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 10,
    elevation: 3,
    width: width / 2.4,
    alignItems: "center",
  },
  cardText: { fontSize: 14, color: "#003366", fontWeight: "600", textAlign: "center" },
  cardCount: { fontSize: 12, color: "#666", marginTop: 5 },
  
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 1,
  },
  activityTitle: { fontSize: 14, color: "#003366", fontWeight: "500" },
  activityTime: { fontSize: 12, color: "#666", marginTop: 4 },
  
  // Page styles
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  pageContainer: { padding: 20, alignItems: "center" },
  pageDesc: { fontSize: 16, color: "#555", marginTop: 10, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 15,
    margin: 10,
    elevation: 3,
    width: width / 2.4,
    alignItems: "center",
  },
  
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  // Inspection styles
  inspectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  inspectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inspectionTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  inspectionDetails: { marginBottom: 10 },
  inspectionDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  inspectionDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  inspectionNotes: { fontSize: 14, color: "#666", marginBottom: 15, fontStyle: "italic" },
  
  viewButton: {
    alignSelf: "flex-start",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
  // Test Report styles
  testReportCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  testReportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  testReportTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  testReportDetails: { marginBottom: 15 },
  testReportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  testReportLabel: { fontSize: 12, color: "#666", fontWeight: "500" },
  testReportValue: { fontSize: 12, color: "#003366", fontWeight: "600" },
  testReportActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testReportDate: { fontSize: 12, color: "#666" },
  
  // NCR styles
  ncrCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  ncrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ncrTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ncrDescription: { fontSize: 14, color: "#666", marginBottom: 10 },
  ncrDetails: { marginBottom: 15 },
  ncrDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ncrDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  ncrActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  // Standard styles
  standardCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  standardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  standardTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  standardDetails: { marginBottom: 15 },
  standardDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  standardDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  standardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  standardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  standardButtonText: { color: "#003366", fontSize: 12, marginLeft: 4 },
  
  // Schedule styles
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scheduleTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleDetails: { marginBottom: 15 },
  scheduleDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  scheduleDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  scheduleActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  // Modal styles
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
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 15 },
  
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
  
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  typeLabel: { fontSize: 14, color: "#666", marginRight: 10 },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  typeText: { fontSize: 12 },
  
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  resultLabel: { fontSize: 14, color: "#666", marginRight: 10 },
  resultOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  resultText: { fontSize: 12 },
  
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
  submitButton: { backgroundColor: "#003366" },
  submitButtonText: { color: "#fff", fontSize: 14 },
  
  // Badge styles
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Menu styles
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#fff",
    paddingTop: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  
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
  
  // Inspection Modal Styles
  inspectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 5,
    textAlign: "center",
  },
  inspectionDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  inspectionForm: {
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 5,
    marginTop: 10,
  },
  statusContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 5,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  
  // Enhanced Welcome Header Styles
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
  qualityIcon: {
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
});