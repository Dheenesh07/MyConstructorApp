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
import { safetyAPI, equipmentAPI, userAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function SafetyOfficerDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalType, setModalType] = useState('incident');
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'Low',
    location: '',
    involvedPersons: ''
  });
  const [inspectionForm, setInspectionForm] = useState({
    title: '',
    location: '',
    type: 'Site Safety',
    notes: ''
  });
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    date: '',
    instructor: '',
    participants: '',
    type: 'Safety Training'
  });
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    total: '',
    category: 'PPE'
  });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadInspections();
    loadIncidents();
    loadTrainings();
    loadEquipment();
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

  const loadInspections = () => {
    setInspections([
      {
        id: 1,
        title: 'Site A - Weekly Safety Inspection',
        date: '2024-01-12',
        status: 'Completed',
        score: 85,
        issues: 3,
        location: 'Construction Site A',
        inspector: 'Safety Officer'
      },
      {
        id: 2,
        title: 'Equipment Safety Check - Cranes',
        date: '2024-01-15',
        status: 'Scheduled',
        score: null,
        issues: null,
        location: 'Equipment Yard',
        inspector: 'Safety Officer'
      },
      {
        id: 3,
        title: 'PPE Compliance Audit',
        date: '2024-01-10',
        status: 'Completed',
        score: 92,
        issues: 1,
        location: 'All Sites',
        inspector: 'Safety Officer'
      }
    ]);
  };

  const loadIncidents = async () => {
    try {
      const response = await safetyAPI.getIncidents();
      setIncidents(response.data.map(incident => ({
        id: incident.id,
        title: incident.title,
        date: incident.date_occurred?.split('T')[0] || incident.created_at?.split('T')[0],
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        involvedPersons: incident.people_involved || 'Not specified',
        description: incident.description
      })));
    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([
        {
          id: 1,
          title: 'Minor Cut on Hand',
          date: '2024-01-11',
          severity: 'low',
          status: 'closed',
          location: 'Site A - Block B',
          involvedPersons: 'John Worker',
          description: 'Worker sustained minor cut while handling materials'
        }
      ]);
    }
  };

  const loadTrainings = () => {
    setTrainings([
      {
        id: 1,
        title: 'OSHA 30-Hour Construction Safety',
        participants: 25,
        completed: 22,
        date: '2024-01-08',
        status: 'Completed',
        instructor: 'Safety Officer'
      },
      {
        id: 2,
        title: 'Fall Protection Training',
        participants: 15,
        completed: 0,
        date: '2024-01-20',
        status: 'Scheduled',
        instructor: 'External Trainer'
      },
      {
        id: 3,
        title: 'Hazard Communication',
        participants: 30,
        completed: 30,
        date: '2024-01-05',
        status: 'Completed',
        instructor: 'Safety Officer'
      }
    ]);
  };

  const loadEquipment = () => {
    setEquipment([
      { id: 1, name: 'Hard Hats', total: 50, available: 45, damaged: 2, status: 'Good' },
      { id: 2, name: 'Safety Harnesses', total: 25, available: 20, damaged: 1, status: 'Good' },
      { id: 3, name: 'Safety Goggles', total: 40, available: 35, damaged: 0, status: 'Good' },
      { id: 4, name: 'Steel-toe Boots', total: 30, available: 15, damaged: 3, status: 'Low Stock' },
      { id: 5, name: 'High-vis Vests', total: 60, available: 55, damaged: 1, status: 'Good' }
    ]);
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

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const submitForm = async () => {
    switch (modalType) {
      case 'incident':
        return submitIncident();
      case 'inspection':
        return submitInspection();
      case 'training':
        return submitTraining();
      case 'equipment':
        return submitEquipment();
      default:
        return;
    }
  };

  const submitIncident = async () => {
    if (!incidentForm.title || !incidentForm.description || !incidentForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      const response = await safetyAPI.reportIncident({
        title: incidentForm.title,
        description: incidentForm.description,
        location_details: incidentForm.location,
        severity: incidentForm.severity.toLowerCase(),
        injured_person: incidentForm.involvedPersons || '',
        project: 1
      });
      const newIncident = {
        id: response.data.id || Date.now(),
        title: incidentForm.title,
        description: incidentForm.description,
        location: incidentForm.location,
        severity: incidentForm.severity,
        involvedPersons: incidentForm.involvedPersons,
        date: new Date().toISOString().split('T')[0],
        status: 'reported'
      };
      setIncidents([newIncident, ...incidents]);
      setIncidentForm({ title: '', description: '', severity: 'Low', location: '', involvedPersons: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Incident report submitted successfully!');
    } catch (error) {
      console.error('Error submitting incident:', error);
      const newIncident = {
        id: Date.now(),
        title: incidentForm.title,
        description: incidentForm.description,
        location: incidentForm.location,
        severity: incidentForm.severity,
        involvedPersons: incidentForm.involvedPersons,
        date: new Date().toISOString().split('T')[0],
        status: 'reported'
      };
      setIncidents([newIncident, ...incidents]);
      setIncidentForm({ title: '', description: '', severity: 'Low', location: '', involvedPersons: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Incident report saved locally!');
    }
  };

  const submitInspection = () => {
    if (!inspectionForm.title || !inspectionForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newInspection = {
      id: inspections.length + 1,
      title: inspectionForm.title,
      date: new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      score: null,
      issues: null,
      location: inspectionForm.location,
      inspector: 'Safety Officer'
    };
    setInspections([newInspection, ...inspections]);
    setInspectionForm({ title: '', location: '', type: 'Site Safety', notes: '' });
    setModalVisible(false);
    Alert.alert('Success', 'Safety inspection scheduled successfully!');
  };

  const submitTraining = () => {
    if (!trainingForm.title || !trainingForm.date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newTraining = {
      id: trainings.length + 1,
      title: trainingForm.title,
      participants: parseInt(trainingForm.participants) || 0,
      completed: 0,
      date: trainingForm.date,
      status: 'Scheduled',
      instructor: trainingForm.instructor || 'Safety Officer'
    };
    setTrainings([newTraining, ...trainings]);
    setTrainingForm({ title: '', date: '', instructor: '', participants: '', type: 'Safety Training' });
    setModalVisible(false);
    Alert.alert('Success', 'Safety training scheduled successfully!');
  };

  const submitEquipment = () => {
    if (!equipmentForm.name || !equipmentForm.total) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const total = parseInt(equipmentForm.total);
    const newEquipment = {
      id: equipment.length + 1,
      name: equipmentForm.name,
      total: total,
      available: total,
      damaged: 0,
      status: 'Good'
    };
    setEquipment([newEquipment, ...equipment]);
    setEquipmentForm({ name: '', total: '', category: 'PPE' });
    setModalVisible(false);
    Alert.alert('Success', 'Safety equipment added successfully!');
  };

  const renderContent = () => {
    switch (activePage) {
      case "Safety Inspections":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🔍 Safety Inspections</Text>
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
                  <View style={[styles.statusBadge, { 
                    backgroundColor: inspection.status === 'Completed' ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusText}>{inspection.status}</Text>
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
                  {inspection.score && (
                    <View style={styles.inspectionDetailRow}>
                      <Ionicons name="star-outline" size={16} color="#666" />
                      <Text style={styles.inspectionDetailText}>Score: {inspection.score}%</Text>
                    </View>
                  )}
                  {inspection.issues !== null && (
                    <View style={styles.inspectionDetailRow}>
                      <Ionicons name="warning-outline" size={16} color="#666" />
                      <Text style={styles.inspectionDetailText}>Issues Found: {inspection.issues}</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: "#003366",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 10,
                    zIndex: 999
                  }}
                  onPress={() => {
                    setSelectedInspection(inspection);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case "Incident Reports":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 Incident Reports</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('incident')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Report Incident</Text>
              </TouchableOpacity>
            </View>
            
            {incidents.map(incident => (
              <View key={incident.id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                  <View style={[styles.severityBadge, { 
                    backgroundColor: incident.severity === 'High' ? '#F44336' : 
                                   incident.severity === 'Medium' ? '#FF9800' : '#4CAF50'
                  }]}>
                    <Text style={styles.statusText}>{incident.severity}</Text>
                  </View>
                </View>
                
                <Text style={styles.incidentDescription}>{incident.description}</Text>
                
                <View style={styles.incidentDetails}>
                  <View style={styles.incidentDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.incidentDetailText}>Date: {incident.date}</Text>
                  </View>
                  <View style={styles.incidentDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.incidentDetailText}>{incident.location}</Text>
                  </View>
                  <View style={styles.incidentDetailRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.incidentDetailText}>Involved: {incident.involvedPersons}</Text>
                  </View>
                </View>
                
                <View style={styles.incidentActions}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: incident.status === 'Closed' ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusText}>{incident.status}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      Alert.alert(
                        'Incident Details',
                        `Title: ${incident.title}\nDate: ${incident.date}\nLocation: ${incident.location}\nSeverity: ${incident.severity}\nInvolved: ${incident.involvedPersons}\nDescription: ${incident.description}\nStatus: ${incident.status}`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Safety Training":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🎓 Safety Training</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('training')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Schedule Training</Text>
              </TouchableOpacity>
            </View>
            
            {trainings.map(training => (
              <View key={training.id} style={styles.trainingCard}>
                <View style={styles.trainingHeader}>
                  <Text style={styles.trainingTitle}>{training.title}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: training.status === 'Completed' ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusText}>{training.status}</Text>
                  </View>
                </View>
                
                <View style={styles.trainingDetails}>
                  <View style={styles.trainingDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.trainingDetailText}>Date: {training.date}</Text>
                  </View>
                  <View style={styles.trainingDetailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.trainingDetailText}>Instructor: {training.instructor}</Text>
                  </View>
                  <View style={styles.trainingDetailRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.trainingDetailText}>
                      Participants: {training.completed}/{training.participants}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>
                    Completion: {Math.round((training.completed / training.participants) * 100)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      width: `${(training.completed / training.participants) * 100}%` 
                    }]} />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: "#003366",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 10,
                    minHeight: 44,
                    zIndex: 999
                  }}
                  onPress={() => {
                    setSelectedTraining(training);
                    setTrainingModalVisible(true);
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Manage Training</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case "Compliance Monitoring":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📊 Compliance Monitoring</Text>
            </View>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>0</Text>
                <Text style={styles.metricLabel}>Days Since Last Incident</Text>
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>95%</Text>
                <Text style={styles.metricLabel}>Safety Compliance</Text>
                <Ionicons name="trending-up" size={24} color="#4CAF50" />
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Compliance Checklist</Text>
            
            <View style={styles.complianceItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>OSHA Reporting</Text>
                <Text style={styles.complianceStatus}>Up to date</Text>
              </View>
            </View>
            
            <View style={styles.complianceItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>Safety Training Records</Text>
                <Text style={styles.complianceStatus}>Current</Text>
              </View>
            </View>
            
            <View style={styles.complianceItem}>
              <Ionicons name="warning" size={24} color="#FF9800" />
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>Equipment Inspections</Text>
                <Text style={styles.complianceStatus}>2 overdue</Text>
              </View>
            </View>
            
            <View style={styles.complianceItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>Emergency Procedures</Text>
                <Text style={styles.complianceStatus}>Updated</Text>
              </View>
            </View>
          </ScrollView>
        );

      case "Safety Equipment":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🦺 Safety Equipment</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openModal('equipment')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Equipment</Text>
              </TouchableOpacity>
            </View>
            
            {equipment.map(item => (
              <View key={item.id} style={styles.equipmentCard}>
                <View style={styles.equipmentHeader}>
                  <Text style={styles.equipmentName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: item.status === 'Good' ? '#4CAF50' : 
                                   item.status === 'Low Stock' ? '#FF9800' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                
                <View style={styles.equipmentStats}>
                  <View style={styles.equipmentStat}>
                    <Text style={styles.equipmentStatNumber}>{item.total}</Text>
                    <Text style={styles.equipmentStatLabel}>Total</Text>
                  </View>
                  <View style={styles.equipmentStat}>
                    <Text style={styles.equipmentStatNumber}>{item.available}</Text>
                    <Text style={styles.equipmentStatLabel}>Available</Text>
                  </View>
                  <View style={styles.equipmentStat}>
                    <Text style={styles.equipmentStatNumber}>{item.total - item.available - item.damaged}</Text>
                    <Text style={styles.equipmentStatLabel}>In Use</Text>
                  </View>
                  <View style={styles.equipmentStat}>
                    <Text style={styles.equipmentStatNumber}>{item.damaged}</Text>
                    <Text style={styles.equipmentStatLabel}>Damaged</Text>
                  </View>
                </View>
                
                <View style={styles.equipmentActions}>
                  <TouchableOpacity 
                    style={styles.equipmentButton}
                    onPress={() => {
                      const updatedEquipment = equipment.map(e => 
                        e.id === item.id 
                          ? { ...e, available: e.available - 1 }
                          : e
                      );
                      setEquipment(updatedEquipment);
                      Alert.alert('Success', `${item.name} checked out successfully!`);
                    }}
                  >
                    <Text style={styles.equipmentButtonText}>Check Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.equipmentButton}
                    onPress={() => {
                      Alert.alert('Reorder Request', `Reorder request for ${item.name} has been submitted to procurement.`);
                    }}
                  >
                    <Text style={styles.equipmentButtonText}>Reorder</Text>
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
                <View style={styles.safetyIcon}>
                  <Ionicons name="shield-checkmark" size={40} color="#FFD700" />
                </View>
                <Text style={styles.welcomeTitle}>Safety First!</Text>
                <Text style={styles.welcomeName}>{user?.first_name || user?.username || 'Safety Officer'}</Text>
                <Text style={styles.welcomeSubtitle}>Protecting lives and ensuring compliance every day</Text>
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
                  <Ionicons name="shield-outline" size={16} color="#fff" />
                  <Text style={styles.shiftText}>Safety Officer Portal</Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced Stats Cards */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Safety Overview</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, styles.inspectionsCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="search" size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.statNumber}>{inspections.filter(i => i.status === 'Completed').length}</Text>
                  <Text style={styles.statLabel}>Inspections</Text>
                  <Text style={styles.statSubtext}>completed</Text>
                </View>
                
                <View style={[styles.statCard, styles.incidentsCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="warning" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statNumber}>{incidents.length}</Text>
                  <Text style={styles.statLabel}>Incidents</Text>
                  <Text style={styles.statSubtext}>reported</Text>
                </View>
                
                <View style={[styles.statCard, styles.trainingsCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="school" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statNumber}>{trainings.filter(t => t.status === 'Completed').length}</Text>
                  <Text style={styles.statLabel}>Trainings</Text>
                  <Text style={styles.statSubtext}>completed</Text>
                </View>
              </View>
            </View>
            
            {/* Priority Alerts */}
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Safety Alerts</Text>
              <TouchableOpacity 
                style={styles.priorityAlert}
                onPress={() => {
                  Alert.alert(
                    'Equipment Inspections Overdue', 
                    '2 equipment inspections require immediate attention:\n\n• Crane Safety Check - Due 2 days ago\n• PPE Audit - Due yesterday\n\nPlease schedule these inspections as soon as possible to maintain safety compliance.',
                    [{ text: 'Schedule Now', style: 'default' }, { text: 'Later', style: 'cancel' }]
                  );
                }}
              >
                <View style={styles.alertIconContainer}>
                  <Ionicons name="warning" size={24} color="#fff" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Equipment Inspections Overdue</Text>
                  <Text style={styles.alertText}>2 equipment inspections need attention</Text>
                  <Text style={styles.alertTime}>Action Required</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FF9800" />
              </TouchableOpacity>
            </View>
            
            {/* Quick Actions Section */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { 
                    title: "Safety Inspections", 
                    icon: "search", 
                    count: `${inspections.length} total`,
                    color: "#2196F3",
                    bgColor: "#E3F2FD"
                  },
                  { 
                    title: "Incident Reports", 
                    icon: "warning", 
                    count: `${incidents.length} reports`,
                    color: "#FF9800",
                    bgColor: "#FFF3E0"
                  },
                  { 
                    title: "Safety Training", 
                    icon: "school", 
                    count: `${trainings.length} programs`,
                    color: "#4CAF50",
                    bgColor: "#E8F5E8"
                  },
                  { 
                    title: "Safety Equipment", 
                    icon: "shield-checkmark", 
                    count: `${equipment.length} items`,
                    color: "#9C27B0",
                    bgColor: "#F3E5F5"
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
            
            {/* Safety Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>📊 Safety Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
                  <Text style={styles.metricNumber}>0</Text>
                  <Text style={styles.metricLabel}>Days Since Last Incident</Text>
                </View>
                <View style={styles.metricCard}>
                  <Ionicons name="trending-up" size={32} color="#2196F3" />
                  <Text style={styles.metricNumber}>95%</Text>
                  <Text style={styles.metricLabel}>Safety Compliance Rate</Text>
                </View>
              </View>
            </View>
            
            {/* Recent Activity */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
              <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Safety Inspection Completed - Site A</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="document-text" size={20} color="#FF9800" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Incident Report Filed - Minor Cut</Text>
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
          {activePage === "Dashboard" ? "Safety Officer Dashboard" : activePage}
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
            {modalType === 'incident' && (
              <>
                <Text style={styles.modalTitle}>Report Incident</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Incident Title *"
                  value={incidentForm.title}
                  onChangeText={(text) => setIncidentForm({...incidentForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location *"
                  value={incidentForm.location}
                  onChangeText={(text) => setIncidentForm({...incidentForm, location: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Involved Persons"
                  value={incidentForm.involvedPersons}
                  onChangeText={(text) => setIncidentForm({...incidentForm, involvedPersons: text})}
                />
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Severity:</Text>
                  {['Low', 'Medium', 'High'].map(severity => (
                    <TouchableOpacity
                      key={severity}
                      style={[styles.severityOption, {
                        backgroundColor: incidentForm.severity === severity ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setIncidentForm({...incidentForm, severity})}
                    >
                      <Text style={[styles.severityText, {
                        color: incidentForm.severity === severity ? '#fff' : '#666'
                      }]}>{severity}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Incident Description *"
                  value={incidentForm.description}
                  onChangeText={(text) => setIncidentForm({...incidentForm, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {modalType === 'inspection' && (
              <>
                <Text style={styles.modalTitle}>Schedule Safety Inspection</Text>
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
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Type:</Text>
                  {['Site Safety', 'Equipment Check', 'PPE Audit'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.severityOption, {
                        backgroundColor: inspectionForm.type === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setInspectionForm({...inspectionForm, type})}
                    >
                      <Text style={[styles.severityText, {
                        color: inspectionForm.type === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Inspection Notes"
                  value={inspectionForm.notes}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, notes: text})}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            {modalType === 'training' && (
              <>
                <Text style={styles.modalTitle}>Schedule Safety Training</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Training Title *"
                  value={trainingForm.title}
                  onChangeText={(text) => setTrainingForm({...trainingForm, title: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date (YYYY-MM-DD) *"
                  value={trainingForm.date}
                  onChangeText={(text) => setTrainingForm({...trainingForm, date: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Instructor"
                  value={trainingForm.instructor}
                  onChangeText={(text) => setTrainingForm({...trainingForm, instructor: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Number of Participants"
                  value={trainingForm.participants}
                  onChangeText={(text) => setTrainingForm({...trainingForm, participants: text})}
                  keyboardType="numeric"
                />
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Type:</Text>
                  {['OSHA Training', 'Fall Protection', 'Equipment Safety'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.severityOption, {
                        backgroundColor: trainingForm.type === type ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setTrainingForm({...trainingForm, type})}
                    >
                      <Text style={[styles.severityText, {
                        color: trainingForm.type === type ? '#fff' : '#666'
                      }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {modalType === 'equipment' && (
              <>
                <Text style={styles.modalTitle}>Add Safety Equipment</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Equipment Name *"
                  value={equipmentForm.name}
                  onChangeText={(text) => setEquipmentForm({...equipmentForm, name: text})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Total Quantity *"
                  value={equipmentForm.total}
                  onChangeText={(text) => setEquipmentForm({...equipmentForm, total: text})}
                  keyboardType="numeric"
                />
                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Category:</Text>
                  {['PPE', 'Tools', 'Emergency'].map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.severityOption, {
                        backgroundColor: equipmentForm.category === category ? '#003366' : '#f5f5f5'
                      }]}
                      onPress={() => setEquipmentForm({...equipmentForm, category})}
                    >
                      <Text style={[styles.severityText, {
                        color: equipmentForm.category === category ? '#fff' : '#666'
                      }]}>{category}</Text>
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
                  {modalType === 'incident' ? 'Submit Report' :
                   modalType === 'inspection' ? 'Schedule Inspection' :
                   modalType === 'training' ? 'Schedule Training' :
                   modalType === 'equipment' ? 'Add Equipment' : 'Submit'}
                </Text>
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

      {/* Inspection Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inspection Details</Text>
            {selectedInspection && (
              <View>
                <Text style={styles.detailText}>Title: {selectedInspection.title}</Text>
                <Text style={styles.detailText}>Date: {selectedInspection.date}</Text>
                <Text style={styles.detailText}>Location: {selectedInspection.location}</Text>
                <Text style={styles.detailText}>Inspector: {selectedInspection.inspector}</Text>
                <Text style={styles.detailText}>Status: {selectedInspection.status}</Text>
                {selectedInspection.score && (
                  <Text style={styles.detailText}>Score: {selectedInspection.score}%</Text>
                )}
                {selectedInspection.issues !== null && (
                  <Text style={styles.detailText}>Issues Found: {selectedInspection.issues}</Text>
                )}
              </View>
            )}
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]} 
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.submitButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Training Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={trainingModalVisible}
        onRequestClose={() => setTrainingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Training Management</Text>
            {selectedTraining && (
              <View>
                <Text style={styles.detailText}>Training: {selectedTraining.title}</Text>
                <Text style={styles.detailText}>Date: {selectedTraining.date}</Text>
                <Text style={styles.detailText}>Instructor: {selectedTraining.instructor}</Text>
                <Text style={styles.detailText}>Participants: {selectedTraining.completed}/{selectedTraining.participants}</Text>
                <Text style={styles.detailText}>Status: {selectedTraining.status}</Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  const newStatus = selectedTraining.status === 'Completed' ? 'Scheduled' : 'Completed';
                  const updatedTrainings = trainings.map(t => 
                    t.id === selectedTraining.id 
                      ? { ...t, status: newStatus }
                      : t
                  );
                  setTrainings(updatedTrainings);
                  setSelectedTraining({ ...selectedTraining, status: newStatus });
                  Alert.alert('Success', `Training status changed to ${newStatus}`);
                }}
              >
                <Text style={styles.cancelButtonText}>Toggle Status</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={() => setTrainingModalVisible(false)}
              >
                <Text style={styles.submitButtonText}>Close</Text>
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
        {/* User Profile Section */}
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'S'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Safety Officer'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Safety Officer'}</Text>
          </View>
        </View>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          onPress={() => handleMenuClick("Dashboard")}
          style={[styles.menuItem, activePage === "Dashboard" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="home" size={20} color={activePage === "Dashboard" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Dashboard" && styles.activeMenuText]}>Dashboard</Text>
          {activePage === "Dashboard" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuClick("Safety Inspections")}
          style={[styles.menuItem, activePage === "Safety Inspections" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name={activePage === "Safety Inspections" ? "search" : "search-outline"} size={20} color={activePage === "Safety Inspections" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Safety Inspections" && styles.activeMenuText]}>Safety Inspections</Text>
          {activePage === "Safety Inspections" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuClick("Incident Reports")}
          style={[styles.menuItem, activePage === "Incident Reports" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name={activePage === "Incident Reports" ? "warning" : "warning-outline"} size={20} color={activePage === "Incident Reports" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Incident Reports" && styles.activeMenuText]}>Incident Reports</Text>
          {activePage === "Incident Reports" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuClick("Safety Training")}
          style={[styles.menuItem, activePage === "Safety Training" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name={activePage === "Safety Training" ? "school" : "school-outline"} size={20} color={activePage === "Safety Training" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Safety Training" && styles.activeMenuText]}>Safety Training</Text>
          {activePage === "Safety Training" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuClick("Compliance Monitoring")}
          style={[styles.menuItem, activePage === "Compliance Monitoring" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name={activePage === "Compliance Monitoring" ? "bar-chart" : "bar-chart-outline"} size={20} color={activePage === "Compliance Monitoring" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Compliance Monitoring" && styles.activeMenuText]}>Compliance Monitoring</Text>
          {activePage === "Compliance Monitoring" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMenuClick("Safety Equipment")}
          style={[styles.menuItem, activePage === "Safety Equipment" && styles.activeMenuItem]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name={activePage === "Safety Equipment" ? "shield-checkmark" : "shield-checkmark-outline"} size={20} color={activePage === "Safety Equipment" ? "#fff" : "#003366"} />
          </View>
          <Text style={[styles.menuText, activePage === "Safety Equipment" && styles.activeMenuText]}>Safety Equipment</Text>
          {activePage === "Safety Equipment" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          onPress={() => {
            toggleMenu();
            setLogoutModalVisible(true);
          }}
          style={styles.logoutMenuItem}
        >
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
    paddingVertical: 15,
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
  content: { flex: 1 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
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
  safetyIcon: {
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
  statIconContainer: {
    marginBottom: 8,
  },
  statSubtext: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  inspectionsCard: {
    borderTopWidth: 3,
    borderTopColor: "#2196F3",
  },
  incidentsCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF9800",
  },
  trainingsCard: {
    borderTopWidth: 3,
    borderTopColor: "#4CAF50",
  },
  
  // Enhanced Alerts Section
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
    borderLeftColor: "#FF9800",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF9800",
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
    color: "#FF9800",
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
  
  // Metrics Section
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  // Recent Activity Section
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  
  // Dashboard styles
  dashboardHeader: { padding: 20, alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  
  alertsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  alertInfo: { marginLeft: 15, flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: "#E65100" },
  alertDescription: { fontSize: 12, color: "#BF360C", marginTop: 2 },
  
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
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  inspectionDetails: { marginBottom: 15 },
  inspectionDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  inspectionDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  
  viewButton: {
    alignSelf: "flex-start",
    backgroundColor: "#003366",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewButtonText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  
  viewDetailsButton: {
    backgroundColor: "#003366",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    minHeight: 44,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    marginTop: 5,
  },
  viewDetailsButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Incident styles
  incidentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  incidentTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incidentDescription: { fontSize: 14, color: "#666", marginBottom: 10 },
  incidentDetails: { marginBottom: 15 },
  incidentDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  incidentDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  incidentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  // Training styles
  trainingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  trainingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  trainingTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  trainingDetails: { marginBottom: 15 },
  trainingDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  trainingDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  
  // Compliance styles
  metricsContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20 },
  metricCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
  },
  metricNumber: { fontSize: 28, fontWeight: "bold", color: "#4CAF50", marginBottom: 5 },
  metricLabel: { fontSize: 12, color: "#666", textAlign: "center", marginBottom: 10 },
  
  complianceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 1,
  },
  complianceInfo: { marginLeft: 15, flex: 1 },
  complianceTitle: { fontSize: 14, fontWeight: "500", color: "#003366" },
  complianceStatus: { fontSize: 12, color: "#666", marginTop: 2 },
  
  // Equipment styles
  equipmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  equipmentName: { fontSize: 16, fontWeight: "600", color: "#003366" },
  equipmentStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  equipmentStat: { alignItems: "center" },
  equipmentStatNumber: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  equipmentStatLabel: { fontSize: 10, color: "#666", marginTop: 2 },
  equipmentActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  equipmentButton: {
    backgroundColor: "#003366",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  equipmentButtonText: { color: "#fff", fontSize: 12 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: "85%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
  
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  severityLabel: { fontSize: 14, color: "#666", marginRight: 10 },
  severityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  severityText: { fontSize: 12 },
  
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
  
  // Menu styles
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
    zIndex: 100,
  },
  userProfileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#666",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    position: "relative",
  },
  activeMenuItem: {
    backgroundColor: "#003366",
  },
  menuIconContainer: {
    width: 24,
    alignItems: "center",
  },
  menuText: {
    marginLeft: 15,
    fontSize: 15,
    color: "#003366",
    fontWeight: "500",
  },
  activeMenuText: {
    color: "#fff",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -10,
    width: 3,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  logoutMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ffe0e0",
  },
  logoutIconContainer: {
    width: 24,
    alignItems: "center",
  },
  logoutMenuText: {
    marginLeft: 15,
    fontSize: 15,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 50,
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
  
  detailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    paddingVertical: 4,
  },
});