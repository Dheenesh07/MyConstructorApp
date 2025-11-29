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
import { userAPI, taskAPI, materialAPI, attendanceAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function ForemanDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.6));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [crew, setCrew] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [safety, setSafety] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [safetyModalVisible, setSafetyModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [crewModalVisible, setCrewModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    item: '',
    quantity: '',
    unit: 'pcs',
    urgency: 'Normal',
    notes: ''
  });
  const [safetyForm, setSafetyForm] = useState({
    type: 'PPE Check',
    notes: ''
  });
  const [taskForm, setTaskForm] = useState({
    taskId: null,
    progress: ''
  });
  const [selectedCrew, setSelectedCrew] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadCrew();
    loadTasks();
    loadMaterials();
    loadSafety();
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

  const loadCrew = () => {
    setCrew([
      { id: 1, name: 'John Worker', trade: 'Carpenter', status: 'Present', shift: 'Day', performance: 92, hours: 8 },
      { id: 2, name: 'Mike Builder', trade: 'Mason', status: 'Present', shift: 'Day', performance: 88, hours: 8 },
      { id: 3, name: 'Tom Helper', trade: 'Laborer', status: 'Absent', shift: 'Day', performance: 85, hours: 0 },
      { id: 4, name: 'Sam Welder', trade: 'Welder', status: 'Present', shift: 'Day', performance: 95, hours: 8 },
      { id: 5, name: 'Joe Operator', trade: 'Equipment Operator', status: 'Present', shift: 'Day', performance: 90, hours: 8 }
    ]);
  };

  const loadTasks = () => {
    setTasks([
      { id: 1, title: 'Foundation Concrete Pour', priority: 'High', status: 'In Progress', assignedCrew: 4, progress: 65, dueDate: '2024-01-15' },
      { id: 2, title: 'Steel Frame Assembly', priority: 'High', status: 'Pending', assignedCrew: 3, progress: 0, dueDate: '2024-01-18' },
      { id: 3, title: 'Electrical Rough-in', priority: 'Medium', status: 'In Progress', assignedCrew: 2, progress: 30, dueDate: '2024-01-20' },
      { id: 4, title: 'Plumbing Installation', priority: 'Medium', status: 'Completed', assignedCrew: 2, progress: 100, dueDate: '2024-01-12' }
    ]);
  };

  const loadMaterials = () => {
    setMaterials([
      { id: 1, item: 'Concrete Mix', requested: 50, delivered: 45, unit: 'bags', status: 'Partial', requestDate: '2024-01-10' },
      { id: 2, item: 'Steel Rebar', requested: 200, delivered: 200, unit: 'pcs', status: 'Complete', requestDate: '2024-01-08' },
      { id: 3, item: 'Electrical Wire', requested: 500, delivered: 0, unit: 'meters', status: 'Pending', requestDate: '2024-01-12' },
      { id: 4, item: 'PVC Pipes', requested: 100, delivered: 100, unit: 'pcs', status: 'Complete', requestDate: '2024-01-09' }
    ]);
  };

  const loadSafety = () => {
    setSafety([
      { id: 1, type: 'PPE Check', status: 'Completed', date: '2024-01-12', notes: 'All crew members wearing required PPE' },
      { id: 2, type: 'Tool Inspection', status: 'Completed', date: '2024-01-12', notes: 'All tools in good condition' },
      { id: 3, type: 'Site Hazard Assessment', status: 'Pending', date: '2024-01-13', notes: 'Daily hazard assessment required' },
      { id: 4, type: 'Safety Meeting', status: 'Scheduled', date: '2024-01-13', notes: 'Weekly safety briefing at 7:00 AM' }
    ]);
  };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -width * 0.6,
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

  const requestMaterial = async () => {
    if (!materialForm.item || !materialForm.quantity) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      const response = await materialAPI.createRequest({
        material_description: materialForm.item,
        quantity: parseInt(materialForm.quantity),
        unit: materialForm.unit,
        urgency: materialForm.urgency.toLowerCase(),
        status: 'pending',
        required_date: new Date().toISOString().split('T')[0],
        requested_by: user.id,
        project: 1
      });
      const newRequest = {
        id: response.data.id,
        item: materialForm.item,
        requested: parseInt(materialForm.quantity),
        delivered: 0,
        unit: materialForm.unit,
        status: 'Pending',
        requestDate: new Date().toISOString().split('T')[0]
      };
      setMaterials([newRequest, ...materials]);
      setMaterialForm({ item: '', quantity: '', unit: 'pcs', urgency: 'Normal', notes: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Material request submitted successfully!');
    } catch (error) {
      console.error('Error submitting material request:', error);
      Alert.alert('Error', 'Failed to submit material request');
    }
  };

  const createSafetyCheck = () => {
    if (!safetyForm.type || !safetyForm.notes) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newCheck = {
      id: safety.length + 1,
      type: safetyForm.type,
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      notes: safetyForm.notes
    };
    setSafety([newCheck, ...safety]);
    setSafetyForm({ type: 'PPE Check', notes: '' });
    setSafetyModalVisible(false);
    Alert.alert('Success', 'Safety check recorded successfully!');
  };

  const updateTaskProgress = () => {
    if (!taskForm.progress) {
      Alert.alert('Error', 'Please enter progress percentage');
      return;
    }
    const updatedTasks = tasks.map(task => 
      task.id === taskForm.taskId 
        ? { ...task, progress: parseInt(taskForm.progress), status: parseInt(taskForm.progress) === 100 ? 'Completed' : 'In Progress' }
        : task
    );
    setTasks(updatedTasks);
    setTaskForm({ taskId: null, progress: '' });
    setTaskModalVisible(false);
    Alert.alert('Success', 'Task progress updated successfully!');
  };

  const assignTaskToCrew = () => {
    Alert.alert('Task Assignment', `Task assigned to ${selectedCrew.name}`);
    setCrewModalVisible(false);
    setSelectedCrew(null);
  };

  const markSafetyComplete = (checkId) => {
    const updatedSafety = safety.map(check => 
      check.id === checkId ? { ...check, status: 'Completed' } : check
    );
    setSafety(updatedSafety);
    Alert.alert('Success', 'Safety check marked as complete!');
  };

  const renderContent = () => {
    switch (activePage) {
      case "Crew Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>👥 Crew Management</Text>
              <Text style={styles.crewCount}>{crew.filter(c => c.status === 'Present').length}/{crew.length} Present</Text>
            </View>
            
            {crew.map(member => (
              <View key={member.id} style={styles.crewCard}>
                <View style={styles.crewHeader}>
                  <Text style={styles.crewName}>{member.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: member.status === 'Present' ? '#4CAF50' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{member.status}</Text>
                  </View>
                </View>
                
                <View style={styles.crewDetails}>
                  <View style={styles.crewDetailRow}>
                    <Ionicons name="build-outline" size={16} color="#666" />
                    <Text style={styles.crewDetailText}>Trade: {member.trade}</Text>
                  </View>
                  <View style={styles.crewDetailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.crewDetailText}>Shift: {member.shift} ({member.hours}h)</Text>
                  </View>
                  <View style={styles.crewDetailRow}>
                    <Ionicons name="star-outline" size={16} color="#666" />
                    <Text style={styles.crewDetailText}>Performance: {member.performance}%</Text>
                  </View>
                </View>
                
                <View style={styles.performanceContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${member.performance}%` }]} />
                  </View>
                </View>
                
                <View style={styles.crewActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedCrew(member); setCrewModalVisible(true); }}>
                    <Text style={styles.actionBtnText}>Assign Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Crew Details', `Name: ${member.name}\nTrade: ${member.trade}\nPerformance: ${member.performance}%\nHours Today: ${member.hours}h`)}>
                    <Text style={styles.actionBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Daily Tasks":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 Daily Tasks</Text>
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
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>Crew: {task.assignedCrew} members</Text>
                  </View>
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
                  <TouchableOpacity style={styles.viewButton} onPress={() => { setTaskForm({ taskId: task.id, progress: task.progress.toString() }); setTaskModalVisible(true); }}>
                    <Text style={styles.viewButtonText}>Update Progress</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Material Requests":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📦 Material Requests</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Request Material</Text>
              </TouchableOpacity>
            </View>
            
            {materials.map(material => (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialHeader}>
                  <Text style={styles.materialName}>{material.item}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: material.status === 'Complete' ? '#4CAF50' : 
                                   material.status === 'Partial' ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{material.status}</Text>
                  </View>
                </View>
                
                <View style={styles.materialDetails}>
                  <View style={styles.materialRow}>
                    <Text style={styles.materialLabel}>Requested:</Text>
                    <Text style={styles.materialValue}>{material.requested} {material.unit}</Text>
                  </View>
                  <View style={styles.materialRow}>
                    <Text style={styles.materialLabel}>Delivered:</Text>
                    <Text style={styles.materialValue}>{material.delivered} {material.unit}</Text>
                  </View>
                  <View style={styles.materialRow}>
                    <Text style={styles.materialLabel}>Request Date:</Text>
                    <Text style={styles.materialValue}>{material.requestDate}</Text>
                  </View>
                </View>
                
                <View style={styles.deliveryProgress}>
                  <Text style={styles.progressLabel}>
                    Delivery: {Math.round((material.delivered / material.requested) * 100)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      width: `${(material.delivered / material.requested) * 100}%` 
                    }]} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Safety Checks":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🦺 Safety Checks</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setSafetyModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New Check</Text>
              </TouchableOpacity>
            </View>
            
            {safety.map(check => (
              <View key={check.id} style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                  <Text style={styles.safetyType}>{check.type}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: check.status === 'Completed' ? '#4CAF50' : 
                                   check.status === 'Scheduled' ? '#2196F3' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{check.status}</Text>
                  </View>
                </View>
                
                <View style={styles.safetyDetails}>
                  <View style={styles.safetyDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.safetyDetailText}>Date: {check.date}</Text>
                  </View>
                </View>
                
                <Text style={styles.safetyNotes}>{check.notes}</Text>
                
                {check.status === 'Pending' && (
                  <TouchableOpacity style={styles.completeButton} onPress={() => markSafetyComplete(check.id)}>
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
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
          <ScrollView style={styles.fullContainer}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.welcome}>👷♂️ Welcome, {user?.first_name || 'Foreman'}!</Text>
              <Text style={styles.subtitle}>Manage crew and daily operations</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{crew.filter(c => c.status === 'Present').length}</Text>
                <Text style={styles.statLabel}>Present Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'In Progress').length}</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{materials.filter(m => m.status === 'Pending').length}</Text>
                <Text style={styles.statLabel}>Pending Materials</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <FlatList
              data={[
                { title: "👥 Crew Management", count: `${crew.length} members` },
                { title: "📋 Daily Tasks", count: `${tasks.length} tasks` },
                { title: "📦 Material Requests", count: `${materials.length} requests` },
                { title: "🦺 Safety Checks", count: `${safety.length} checks` },
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
          {activePage === "Dashboard" ? "Foreman Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Material</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Material Item *"
              value={materialForm.item}
              onChangeText={(text) => setMaterialForm({...materialForm, item: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Quantity *"
              value={materialForm.quantity}
              onChangeText={(text) => setMaterialForm({...materialForm, quantity: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>Unit:</Text>
              {['pcs', 'bags', 'meters', 'tons', 'liters'].map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitOption, {
                    backgroundColor: materialForm.unit === unit ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setMaterialForm({...materialForm, unit})}
                >
                  <Text style={[styles.unitText, {
                    color: materialForm.unit === unit ? '#fff' : '#666'
                  }]}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.urgencyContainer}>
              <Text style={styles.urgencyLabel}>Urgency:</Text>
              {['Low', 'Normal', 'High', 'Urgent'].map(urgency => (
                <TouchableOpacity
                  key={urgency}
                  style={[styles.urgencyOption, {
                    backgroundColor: materialForm.urgency === urgency ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setMaterialForm({...materialForm, urgency})}
                >
                  <Text style={[styles.urgencyText, {
                    color: materialForm.urgency === urgency ? '#fff' : '#666'
                  }]}>{urgency}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional Notes"
              value={materialForm.notes}
              onChangeText={(text) => setMaterialForm({...materialForm, notes: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={requestMaterial}>
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Safety Check Modal */}
      <Modal animationType="slide" transparent={true} visible={safetyModalVisible} onRequestClose={() => setSafetyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Safety Check</Text>
            
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>Check Type:</Text>
              {['PPE Check', 'Tool Inspection', 'Site Hazard Assessment', 'Safety Meeting'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.unitOption, {
                    backgroundColor: safetyForm.type === type ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setSafetyForm({...safetyForm, type})}
                >
                  <Text style={[styles.unitText, {
                    color: safetyForm.type === type ? '#fff' : '#666'
                  }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes *"
              value={safetyForm.notes}
              onChangeText={(text) => setSafetyForm({...safetyForm, notes: text})}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setSafetyModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={createSafetyCheck}>
                <Text style={styles.submitButtonText}>Record Check</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Progress Modal */}
      <Modal animationType="slide" transparent={true} visible={taskModalVisible} onRequestClose={() => setTaskModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Task Progress</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Progress Percentage (0-100) *"
              value={taskForm.progress}
              onChangeText={(text) => setTaskForm({...taskForm, progress: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setTaskModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={updateTaskProgress}>
                <Text style={styles.submitButtonText}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Crew Assignment Modal */}
      <Modal animationType="slide" transparent={true} visible={crewModalVisible} onRequestClose={() => setCrewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Task to {selectedCrew?.name}</Text>
            
            <Text style={styles.crewInfo}>Trade: {selectedCrew?.trade}</Text>
            <Text style={styles.crewInfo}>Performance: {selectedCrew?.performance}%</Text>
            <Text style={styles.crewInfo}>Status: {selectedCrew?.status}</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setCrewModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={assignTaskToCrew}>
                <Text style={styles.submitButtonText}>Assign Task</Text>
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

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'F'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Foreman'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Foreman'}</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />
        
        {[
          { title: "Dashboard", icon: "home" },
          { title: "Crew Management", icon: "people" },
          { title: "Daily Tasks", icon: "clipboard" },
          { title: "Material Requests", icon: "cube" },
          { title: "Safety Checks", icon: "shield-checkmark" }
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
  content: { flex: 1 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  dashboardHeader: { padding: 20, alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  
  statsContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 5, alignItems: "center", elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
  cardContainer: { paddingHorizontal: 10 },
  dashboardCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  cardText: { fontSize: 14, color: "#003366", fontWeight: "600", textAlign: "center" },
  cardCount: { fontSize: 12, color: "#666", marginTop: 5 },
  
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  crewCount: { fontSize: 14, color: "#666" },
  pageContainer: { padding: 20, alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 25, paddingHorizontal: 15, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  crewCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  crewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  crewName: { fontSize: 16, fontWeight: "600", color: "#003366" },
  crewDetails: { marginBottom: 10 },
  crewDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  crewDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  performanceContainer: { marginBottom: 15 },
  crewActions: { flexDirection: "row", justifyContent: "space-around" },
  
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
  
  materialCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  materialHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  materialName: { fontSize: 16, fontWeight: "600", color: "#003366" },
  materialDetails: { marginBottom: 10 },
  materialRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  materialLabel: { fontSize: 12, color: "#666" },
  materialValue: { fontSize: 12, fontWeight: "600", color: "#003366" },
  deliveryProgress: { marginTop: 10 },
  
  safetyCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  safetyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  safetyType: { fontSize: 16, fontWeight: "600", color: "#003366" },
  safetyDetails: { marginBottom: 10 },
  safetyDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  safetyDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  safetyNotes: { fontSize: 14, color: "#666", marginBottom: 10, fontStyle: "italic" },
  completeButton: { backgroundColor: "#4CAF50", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, alignSelf: "flex-start" },
  completeButtonText: { color: "#fff", fontSize: 12 },
  
  statusBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  viewButton: { alignSelf: "flex-start", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
  actionBtn: { backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { color: "#fff", fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: width * 0.9, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 15 },
  
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: "#fff" },
  textArea: { height: 80, textAlignVertical: "top" },
  
  unitContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, flexWrap: "wrap" },
  unitLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  unitOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  unitText: { fontSize: 12 },
  
  urgencyContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, flexWrap: "wrap" },
  urgencyLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  urgencyOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  urgencyText: { fontSize: 12 },
  
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
  
  // New modal styles
  crewInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
});