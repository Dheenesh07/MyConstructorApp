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
import { userAPI, taskAPI, materialAPI, attendanceAPI, projectAPI, safetyAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function ForemanDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
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
  const [crewDetailsModalVisible, setCrewDetailsModalVisible] = useState(false);
  const [selectedCrewDetails, setSelectedCrewDetails] = useState(null);
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
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadCrew();
    loadTasks();
    loadMaterials();
    loadSafety();
    loadProjects();
    loadAvailableTasks();
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

  const loadCrew = async () => {
    try {
      const response = await userAPI.getAll();
      const workers = (response.data || []).filter(user => user.role === 'worker');
      if (workers.length > 0) {
        setCrew(workers.map(worker => ({
          id: worker.id,
          name: worker.first_name || worker.username,
          trade: worker.trade || 'General Worker',
          status: 'Present',
          shift: 'Day',
          performance: Math.floor(Math.random() * 20) + 80,
          hours: 8
        })));
      } else {
        setCrew([
          { id: 1, name: 'John Worker', trade: 'Carpenter', status: 'Present', shift: 'Day', performance: 92, hours: 8 },
          { id: 2, name: 'Mike Builder', trade: 'Mason', status: 'Present', shift: 'Day', performance: 88, hours: 8 },
          { id: 3, name: 'Tom Helper', trade: 'Laborer', status: 'Absent', shift: 'Day', performance: 85, hours: 0 },
          { id: 4, name: 'Sam Welder', trade: 'Welder', status: 'Present', shift: 'Day', performance: 95, hours: 8 },
          { id: 5, name: 'Joe Operator', trade: 'Equipment Operator', status: 'Present', shift: 'Day', performance: 90, hours: 8 }
        ]);
      }
    } catch (error) {
      console.error('Error loading crew:', error);
      setCrew([
        { id: 1, name: 'John Worker', trade: 'Carpenter', status: 'Present', shift: 'Day', performance: 92, hours: 8 },
        { id: 2, name: 'Mike Builder', trade: 'Mason', status: 'Present', shift: 'Day', performance: 88, hours: 8 },
        { id: 3, name: 'Tom Helper', trade: 'Laborer', status: 'Absent', shift: 'Day', performance: 85, hours: 0 },
        { id: 4, name: 'Sam Welder', trade: 'Welder', status: 'Present', shift: 'Day', performance: 95, hours: 8 },
        { id: 5, name: 'Joe Operator', trade: 'Equipment Operator', status: 'Present', shift: 'Day', performance: 90, hours: 8 }
      ]);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to mock data
      setTasks([
        { id: 1, title: 'Foundation Concrete Pour', priority: 'high', status: 'in_progress', assignedCrew: 4, progress: 65, due_date: '2024-01-15' },
        { id: 2, title: 'Steel Frame Assembly', priority: 'high', status: 'pending', assignedCrew: 3, progress: 0, due_date: '2024-01-18' },
        { id: 3, title: 'Electrical Rough-in', priority: 'medium', status: 'in_progress', assignedCrew: 2, progress: 30, due_date: '2024-01-20' },
        { id: 4, title: 'Plumbing Installation', priority: 'medium', status: 'completed', assignedCrew: 2, progress: 100, due_date: '2024-01-12' }
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([{ id: 1, name: 'Construction Project Alpha' }]);
    }
  };

  const loadAvailableTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      const unassignedTasks = (response.data || []).filter(task => !task.assigned_to || task.status === 'pending');
      setAvailableTasks(unassignedTasks);
    } catch (error) {
      console.error('Error loading available tasks:', error);
      setAvailableTasks([
        { id: 5, title: 'Site Cleanup', priority: 'low', status: 'pending', project: 1 },
        { id: 6, title: 'Material Inspection', priority: 'medium', status: 'pending', project: 1 },
        { id: 7, title: 'Safety Equipment Check', priority: 'high', status: 'pending', project: 1 }
      ]);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await materialAPI.getRequests();
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    }
  };

  const loadSafety = async () => {
    try {
      const response = await safetyAPI.getIncidents();
      setSafety(response.data || []);
    } catch (error) {
      console.error('Error loading safety checks:', error);
      setSafety([]);
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

  const requestMaterial = () => {
    if (!materialForm.item || !materialForm.quantity) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    
    // LOCAL ONLY - No API call to prevent 400 errors until API structure is verified
    const newRequest = {
      id: Date.now(),
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
    Alert.alert('Success', 'Material request added locally');
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

  const assignTaskToCrew = async () => {
    if (!selectedTaskId) {
      Alert.alert('Error', 'Please select a task to assign');
      return;
    }

    try {
      console.log('Assigning task:', selectedTaskId, 'to crew member:', selectedCrew.id);
      
      // Update task with assigned crew member
      const taskData = {
        assigned_to: selectedCrew.id,
        status: 'in_progress'
      };
      
      await taskAPI.update(selectedTaskId, taskData);
      console.log('Task updated successfully via API');
      
      // Update local tasks state
      const updatedTasks = tasks.map(task => 
        task.id === selectedTaskId 
          ? { ...task, assigned_to: selectedCrew.id, status: 'in_progress', assignedCrew: selectedCrew.name }
          : task
      );
      setTasks(updatedTasks);
      
      // Remove from available tasks and reload
      const updatedAvailableTasks = availableTasks.filter(task => task.id !== selectedTaskId);
      setAvailableTasks(updatedAvailableTasks);
      
      // Reload tasks to get fresh data
      loadTasks();
      
      Alert.alert(
        'Task Assigned Successfully!', 
        `"${availableTasks.find(t => t.id === selectedTaskId)?.title}" has been assigned to ${selectedCrew.name}`,
        [{ text: 'OK', onPress: () => console.log('Assignment confirmed') }]
      );
      
      // Close modal and reset states
      setCrewModalVisible(false);
      setSelectedCrew(null);
      setSelectedTaskId(null);
      
    } catch (error) {
      console.error('Error assigning task:', error);
      
      // Local fallback update
      const updatedTasks = tasks.map(task => 
        task.id === selectedTaskId 
          ? { ...task, assigned_to: selectedCrew.id, status: 'in_progress', assignedCrew: selectedCrew.name }
          : task
      );
      setTasks(updatedTasks);
      
      const updatedAvailableTasks = availableTasks.filter(task => task.id !== selectedTaskId);
      setAvailableTasks(updatedAvailableTasks);
      
      Alert.alert(
        'Task Assigned!', 
        `"${availableTasks.find(t => t.id === selectedTaskId)?.title}" assigned to ${selectedCrew.name} (local update)`,
        [{ text: 'OK' }]
      );
      
      setCrewModalVisible(false);
      setSelectedCrew(null);
      setSelectedTaskId(null);
    }
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
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedCrewDetails(member); setCrewDetailsModalVisible(true); }}>
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
                    <Text style={styles.taskDetailText}>Due: {task.due_date || task.dueDate}</Text>
                  </View>
                </View>
                
                <View style={styles.taskActions}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: (task.status === 'completed' || task.status === 'Completed') ? '#4CAF50' : 
                                   (task.status === 'in_progress' || task.status === 'In Progress') ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : task.status}</Text>
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
          <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
            {/* Enhanced Welcome Header */}
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeBackground}>
                <View style={styles.constructionIcon}>
                  <Ionicons name="construct" size={40} color="#FFD700" />
                </View>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeName}>{user?.first_name || user?.username || 'Foreman'}</Text>
                <Text style={styles.welcomeSubtitle}>Ready to lead your crew to success</Text>
                <View style={styles.dateTimeContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={styles.dateTimeText}>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced Stats Cards */}
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Today's Overview</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, styles.presentCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="people" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statNumber}>{crew.filter(c => c.status === 'Present').length}</Text>
                  <Text style={styles.statLabel}>Crew Present</Text>
                  <Text style={styles.statSubtext}>of {crew.length} total</Text>
                </View>
                
                <View style={[styles.statCard, styles.tasksCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="clipboard" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'in_progress' || t.status === 'In Progress').length}</Text>
                  <Text style={styles.statLabel}>Active Tasks</Text>
                  <Text style={styles.statSubtext}>in progress</Text>
                </View>
                
                <View style={[styles.statCard, styles.materialsCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="cube" size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.statNumber}>{materials.filter(m => m.status === 'Pending').length}</Text>
                  <Text style={styles.statLabel}>Materials</Text>
                  <Text style={styles.statSubtext}>pending</Text>
                </View>
              </View>
            </View>
            
            {/* Quick Actions Section */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {[
                  { 
                    title: "Crew Management", 
                    icon: "people", 
                    count: `${crew.length} members`,
                    color: "#4CAF50",
                    bgColor: "#E8F5E8"
                  },
                  { 
                    title: "Daily Tasks", 
                    icon: "clipboard", 
                    count: `${tasks.length} tasks`,
                    color: "#FF9800",
                    bgColor: "#FFF3E0"
                  },
                  { 
                    title: "Material Requests", 
                    icon: "cube", 
                    count: `${materials.length} requests`,
                    color: "#2196F3",
                    bgColor: "#E3F2FD"
                  },
                  { 
                    title: "Safety Checks", 
                    icon: "shield-checkmark", 
                    count: `${safety.length} checks`,
                    color: "#F44336",
                    bgColor: "#FFEBEE"
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
            
            {/* Performance Summary */}
            <View style={styles.performanceSection}>
              <Text style={styles.sectionTitle}>Team Performance</Text>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={styles.performanceTitle}>Overall Efficiency</Text>
                </View>
                <View style={styles.performanceMetrics}>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{Math.round(crew.reduce((acc, c) => acc + c.performance, 0) / crew.length)}%</Text>
                    <Text style={styles.performanceLabel}>Avg Performance</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length}</Text>
                    <Text style={styles.performanceLabel}>Completed Tasks</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.performanceValue}>{crew.reduce((acc, c) => acc + c.hours, 0)}h</Text>
                    <Text style={styles.performanceLabel}>Total Hours</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Safety Status */}
            <View style={styles.safetySection}>
              <View style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                  <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                  <Text style={styles.safetyTitle}>Safety Status: All Clear</Text>
                </View>
                <Text style={styles.safetySubtext}>Last safety check completed today</Text>
                <View style={styles.safetyStats}>
                  <Text style={styles.safetyDays}>0 days without incident</Text>
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
              placeholderTextColor="#999"
              value={materialForm.item}
              onChangeText={(text) => setMaterialForm({...materialForm, item: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Quantity *"
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
            <Text style={styles.modalTitle}>📋 Assign Task to {selectedCrew?.name}</Text>
            
            <View style={styles.assignmentContainer}>
              <Text style={styles.assignmentLabel}>Crew Member Information:</Text>
              <View style={styles.crewInfoCard}>
                <View style={styles.crewInfoRow}>
                  <Text style={styles.crewInfoLabel}>Trade:</Text>
                  <Text style={styles.crewInfoValue}>{selectedCrew?.trade}</Text>
                </View>
                <View style={styles.crewInfoRow}>
                  <Text style={styles.crewInfoLabel}>Performance:</Text>
                  <Text style={styles.crewInfoValue}>{selectedCrew?.performance}%</Text>
                </View>
                <View style={styles.crewInfoRow}>
                  <Text style={styles.crewInfoLabel}>Status:</Text>
                  <Text style={[styles.crewInfoValue, {
                    color: selectedCrew?.status === 'Present' ? '#4CAF50' : '#F44336'
                  }]}>{selectedCrew?.status}</Text>
                </View>
              </View>
              
              <Text style={styles.assignmentLabel}>Available Tasks:</Text>
              <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
                {availableTasks.length > 0 ? availableTasks.map(task => (
                  <TouchableOpacity 
                    key={task.id} 
                    style={[styles.taskOption, {
                      backgroundColor: selectedTaskId === task.id ? '#E3F2FD' : '#fff',
                      borderColor: selectedTaskId === task.id ? '#2196F3' : '#e0e0e0',
                      borderWidth: selectedTaskId === task.id ? 2 : 1
                    }]}
                    onPress={() => setSelectedTaskId(task.id)}
                  >
                    <View style={styles.taskOptionHeader}>
                      <Text style={[styles.taskOptionTitle, {
                        color: selectedTaskId === task.id ? '#2196F3' : '#003366'
                      }]}>{task.title}</Text>
                      {selectedTaskId === task.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                      )}
                    </View>
                    <Text style={styles.taskOptionPriority}>Priority: {task.priority}</Text>
                    <Text style={styles.taskOptionStatus}>Status: {task.status}</Text>
                  </TouchableOpacity>
                )) : (
                  <View style={styles.noTasksContainer}>
                    <Ionicons name="clipboard-outline" size={40} color="#ccc" />
                    <Text style={styles.noTasksText}>No available tasks</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setCrewModalVisible(false);
                  setSelectedTaskId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton, {
                  backgroundColor: selectedTaskId ? '#003366' : '#ccc'
                }]} 
                onPress={assignTaskToCrew}
                disabled={!selectedTaskId}
              >
                <Text style={[styles.submitButtonText, {
                  color: selectedTaskId ? '#fff' : '#999'
                }]}>Assign Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Crew Details Modal */}
      <Modal animationType="slide" transparent={true} visible={crewDetailsModalVisible} onRequestClose={() => setCrewDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 Crew Member Details</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedCrewDetails?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trade:</Text>
                <Text style={styles.detailValue}>{selectedCrewDetails?.trade}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, { 
                  color: selectedCrewDetails?.status === 'Present' ? '#4CAF50' : '#F44336'
                }]}>{selectedCrewDetails?.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Shift:</Text>
                <Text style={styles.detailValue}>{selectedCrewDetails?.shift}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Performance:</Text>
                <Text style={styles.detailValue}>{selectedCrewDetails?.performance}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hours Today:</Text>
                <Text style={styles.detailValue}>{selectedCrewDetails?.hours}h</Text>
              </View>
            </View>
            
            <View style={styles.performanceContainer}>
              <Text style={styles.performanceTitle}>Performance Rating</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${selectedCrewDetails?.performance || 0}%` }]} />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]} 
              onPress={() => setCrewDetailsModalVisible(false)}
            >
              <Text style={styles.submitButtonText}>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: "linear-gradient(135deg, #003366 0%, #004080 100%)",
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
  presentCard: {
    borderTopWidth: 3,
    borderTopColor: "#4CAF50",
  },
  tasksCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF9800",
  },
  materialsCard: {
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
  
  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
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
  
  // Safety Section
  safetySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  safetyCard: {
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 10,
  },
  safetySubtext: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 10,
  },
  safetyStats: {
    alignItems: "center",
  },
  safetyDays: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  crewCount: { fontSize: 14, color: "#666" },
  
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
  
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#333",
    minHeight: 50,
  },
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
    zIndex: 2 
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
    zIndex: 1 
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
  
  // New modal styles
  crewInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  
  // Crew Details Modal Styles
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 8,
  },
  
  // Assignment Modal Styles
  assignmentContainer: {
    marginBottom: 20,
  },
  assignmentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
    marginTop: 15,
  },
  crewInfoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  crewInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  crewInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  crewInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  tasksList: {
    maxHeight: 150,
  },
  taskOption: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  taskOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },
  taskOptionPriority: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  taskOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskOptionStatus: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  noTasksContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  noTasksText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    fontStyle: "italic",
  },
});