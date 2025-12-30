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
import { userAPI, projectAPI, materialAPI, taskAPI, budgetAPI, vendorAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function ProjectManagerDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budget, setBudget] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [teamTaskModalVisible, setTeamTaskModalVisible] = useState(false);
  const [memberDetailsModalVisible, setMemberDetailsModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    vendor_code: '',
    vendor_type: 'supplier',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });
  const [materialRequests, setMaterialRequests] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    verifyUserRole();
    loadUserData();
    loadProjects();
    loadTeam();
    loadTasks();
    loadBudget();
    loadVendors();
    loadMaterialRequests();
  }, []);

  useEffect(() => {
    if (activePage === "Documents") {
      setTimeout(() => {
        navigation.navigate('Documents');
        setActivePage("Dashboard");
      }, 0);
    } else if (activePage === "Communications") {
      setTimeout(() => {
        navigation.navigate('CommunicationCenter');
        setActivePage("Dashboard");
      }, 0);
    }
  }, [activePage, navigation]);

  const verifyUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('✅ Current user role:', user.role);
        
        // Verify user is a project manager
        if (user.role !== 'project_manager') {
          console.warn('⚠️ Unauthorized access attempt. User role:', user.role);
          Alert.alert(
            'Access Denied',
            'You do not have permission to access the Project Manager Dashboard.',
            [{ text: 'OK', onPress: () => navigation.replace('Login') }]
          );
        }
      } else {
        console.warn('⚠️ No user data found');
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('❌ Error verifying user role:', error);
      navigation.replace('Login');
    }
  };

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

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      if (response.data && response.data.length > 0) {
        setProjects(response.data.map(project => ({
          id: project.id,
          name: project.name,
          progress: project.progress_percentage || 0,
          status: project.status,
          deadline: project.end_date,
          budget: project.total_budget || 0,
          spent: project.actual_cost || 0
        })));
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadTeam = async () => {
    try {
      const response = await userAPI.getAll();
      if (response.data && response.data.length > 0) {
        const teamMembers = response.data
          .filter(user => user.role !== 'admin' && user.is_active_employee)
          .map(user => ({
            id: user.id,
            name: user.username || user.first_name || 'Unknown',
            role: user.role?.replace('_', ' ').toUpperCase() || 'Worker',
            status: user.is_active_employee ? 'Available' : 'Inactive',
            currentTask: 'No current task assigned',
            performance: Math.floor(Math.random() * 20) + 80, // Random performance 80-100%
            email: user.email,
            phone: user.phone || 'Not provided'
          }));
        setTeam(teamMembers);
      } else {
        setTeam([]);
      }
    } catch (error) {
      console.error('Error loading team:', error);
      setTeam([]);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.map(task => ({
        id: task.id,
        title: task.title,
        assignee: task.assigned_to_name || 'Unassigned',
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadBudget = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudget(response.data.map(budget => ({
        category: budget.category,
        allocated: budget.allocated_amount,
        spent: budget.spent_amount,
        remaining: budget.allocated_amount - budget.spent_amount
      })));
    } catch (error) {
      console.error('Error loading budget:', error);
      setBudget([]);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
    }
  };

  const loadMaterialRequests = async () => {
    try {
      const response = await materialAPI.getRequests();
      setMaterialRequests(response.data || []);
    } catch (error) {
      console.error('Error loading material requests:', error);
      setMaterialRequests([]);
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

  const createTask = () => {
    if (!taskForm.title || !taskForm.assignee) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    
    if (editingTask) {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskForm }
          : task
      );
      setTasks(updatedTasks);
      Alert.alert('Success', 'Task updated successfully!');
    } else {
      const newTask = {
        id: tasks.length + 1,
        ...taskForm,
        status: 'Pending'
      };
      setTasks([newTask, ...tasks]);
      Alert.alert('Success', 'Task assigned successfully!');
    }
    
    setTaskForm({ title: '', description: '', assignee: '', priority: 'Medium', dueDate: '' });
    setEditingTask(null);
    setModalVisible(false);
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setModalVisible(true);
  };

  const createVendor = () => {
    if (!vendorForm.name || !vendorForm.vendor_code || !vendorForm.contact_person || !vendorForm.email) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    
    if (editingVendor) {
      const updatedVendors = vendors.map(vendor => 
        vendor.id === editingVendor.id 
          ? { ...vendor, ...vendorForm }
          : vendor
      );
      setVendors(updatedVendors);
      Alert.alert('Success', 'Vendor updated successfully!');
    } else {
      const newVendor = {
        id: vendors.length + 1,
        ...vendorForm,
        rating: 0,
        is_approved: false
      };
      setVendors([newVendor, ...vendors]);
      Alert.alert('Success', 'Vendor added successfully!');
    }
    
    setVendorForm({ name: '', vendor_code: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '', tax_id: '' });
    setEditingVendor(null);
    setVendorModalVisible(false);
  };

  const editVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      vendor_code: vendor.vendor_code,
      vendor_type: vendor.vendor_type,
      contact_person: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      tax_id: vendor.tax_id
    });
    setVendorModalVisible(true);
  };

  const renderContent = () => {
    switch (activePage) {
      case "Project Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📊 Project Management</Text>
            </View>
            
            {projects.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: project.status === 'Completed' ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress: {project.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                </View>
                
                <View style={styles.projectDetails}>
                  <View style={styles.projectDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.projectDetailText}>Deadline: {project.deadline}</Text>
                  </View>
                  <View style={styles.projectDetailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.projectDetailText}>
                      Budget: ${(project.spent / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ProjectManagement', { projectId: project.id, projectName: project.name })}>
                  <Text style={styles.viewButtonText}>Manage Project</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case "Team Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>👥 Team Management</Text>
            </View>
            
            {team.length === 0 ? (
              <View style={styles.emptyTeamState}>
                <Text style={styles.emptyStateTitle}>No Team Members Found</Text>
                <Text style={styles.emptyStateText}>Team members will appear here when users are registered in the system</Text>
              </View>
            ) : (
              team.map(member => (
                <View key={member.id} style={styles.teamCard}>
                  <View style={styles.teamHeader}>
                    <Text style={styles.teamName}>{member.name}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: member.status === 'Available' ? '#4CAF50' : '#FF9800'
                    }]}>
                      <Text style={styles.statusText}>{member.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.teamRole}>{member.role}</Text>
                  <Text style={styles.teamTask}>Current: {member.currentTask}</Text>
                  
                  <View style={styles.performanceContainer}>
                    <Text style={styles.performanceLabel}>Performance: {member.performance}%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${member.performance}%` }]} />
                    </View>
                  </View>
                  
                  <View style={styles.teamActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => {
                      setSelectedMember(member);
                      setTaskForm({...taskForm, assignee: member.name});
                      setTeamTaskModalVisible(true);
                    }}>
                      <Text style={styles.actionBtnText}>Assign Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => {
                      setSelectedMember(member);
                      setMemberDetailsModalVisible(true);
                    }}>
                      <Text style={styles.actionBtnText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );

      case "Task Assignment":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 Task Assignment</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Assign Task</Text>
              </TouchableOpacity>
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
                
                <View style={styles.taskDetails}>
                  <View style={styles.taskDetailRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.taskDetailText}>Assigned to: {task.assignee}</Text>
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
                  <TouchableOpacity style={styles.viewButton} onPress={() => editTask(task)}>
                    <Text style={styles.viewButtonText}>Edit Task</Text>
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
              <TouchableOpacity style={styles.addButton} onPress={() => setVendorModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Vendor</Text>
              </TouchableOpacity>
            </View>
            
            {vendors.map(vendor => (
              <View key={vendor.id} style={styles.vendorCard}>
                <View style={styles.vendorHeader}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{vendor.rating}</Text>
                  </View>
                </View>
                <Text style={styles.vendorType}>{vendor.vendor_type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.vendorContact}>Contact: {vendor.contact_person}</Text>
                <Text style={styles.vendorEmail}>Email: {vendor.email}</Text>
                <Text style={styles.vendorPhone}>Phone: {vendor.phone}</Text>
                <View style={styles.vendorActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => editVendor(vendor)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Documents":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📄 Documents</Text>
            </View>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Redirecting to Documents screen...</Text>
            </View>
          </ScrollView>
        );

      case "Communications":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💬 Communications</Text>
            </View>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Redirecting to Communication Center...</Text>
            </View>
          </ScrollView>
        );

      case "Material Requests":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📦 Material Requests</Text>
            </View>
            
            {materialRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No material requests found</Text>
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{materialRequests.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, {color: '#FF9800'}]}>{materialRequests.filter(r => r.status === 'pending').length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, {color: '#4CAF50'}]}>{materialRequests.filter(r => r.status === 'approved').length}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                  </View>
                </View>
                
                {materialRequests.map(request => (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestId}>{request.request_id}</Text>
                      <View style={[styles.urgencyBadge, {
                        backgroundColor: request.urgency === 'high' ? '#F44336' : request.urgency === 'medium' ? '#FF9800' : '#4CAF50'
                      }]}>
                        <Text style={styles.statusText}>{request.urgency?.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.requestMaterial}>{request.material_description}</Text>
                    <Text style={styles.requestQuantity}>Qty: {request.quantity} {request.unit}</Text>
                    <Text style={styles.requestCost}>Est. Cost: ₹{request.estimated_cost?.toLocaleString()}</Text>
                    <View style={{ marginTop: 8 }}>
                      <View style={[styles.statusBadge, {
                        backgroundColor: request.status === 'approved' ? '#4CAF50' : '#FF9800',
                        alignSelf: 'flex-start'
                      }]}>
                        <Text style={styles.statusText}>{request.status?.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        );

      case "Budget Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💰 Budget Management</Text>
            </View>
            
            <View style={styles.budgetSummary}>
              <Text style={styles.budgetTitle}>Total Project Budget</Text>
              <Text style={styles.budgetAmount}>
                ₹{budget.reduce((sum, item) => sum + item.allocated, 0).toLocaleString()}
              </Text>
              <Text style={styles.budgetSpent}>
                Spent: ₹{budget.reduce((sum, item) => sum + item.spent, 0).toLocaleString()} ({budget.length > 0 ? Math.round((budget.reduce((sum, item) => sum + item.spent, 0) / budget.reduce((sum, item) => sum + item.allocated, 0)) * 100) : 0}%)
              </Text>
            </View>
            
            {budget.map((item, index) => (
              <View key={index} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{item.category}</Text>
                  <Text style={styles.budgetPercentage}>
                    {Math.round((item.spent / item.allocated) * 100)}%
                  </Text>
                </View>
                
                <View style={styles.budgetDetails}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Allocated:</Text>
                    <Text style={styles.budgetValue}>${(item.allocated / 1000).toFixed(0)}K</Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Spent:</Text>
                    <Text style={styles.budgetValue}>${(item.spent / 1000).toFixed(0)}K</Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Remaining:</Text>
                    <Text style={[styles.budgetValue, { color: item.remaining > 0 ? '#4CAF50' : '#F44336' }]}>
                      ${(item.remaining / 1000).toFixed(0)}K
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      width: `${(item.spent / item.allocated) * 100}%`,
                      backgroundColor: (item.spent / item.allocated) > 0.9 ? '#F44336' : '#4CAF50'
                    }]} />
                  </View>
                </View>
              </View>
            ))}
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
            
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Navigate to Attendance Tracking to monitor team attendance</Text>
            </View>
          </ScrollView>
        );

      case "Logout":
        setLogoutModalVisible(true);
        setActivePage("Dashboard");
        return renderContent();

      default:
        return (
          <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
            {/* Professional Header */}
            <View style={styles.professionalHeader}>
              <View style={styles.headerGradient}>
                <View style={styles.headerContent}>
                  <View style={styles.managerIcon}>
                    <Ionicons name="briefcase" size={32} color="#FFD700" />
                  </View>
                  <Text style={styles.headerGreeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</Text>
                  <Text style={styles.managerName}>{user?.first_name || user?.username || 'Project Manager'}</Text>
                  <Text style={styles.roleTitle}>Project Management Excellence</Text>
                  <View style={styles.dateCard}>
                    <Text style={styles.currentDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                    <Text style={styles.currentTime}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Key Metrics Dashboard */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>📈 Project Portfolio Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, { borderLeftColor: '#2196F3' }]}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="construct" size={28} color="#2196F3" />
                    <View style={styles.trendIndicator}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={styles.trendText}>+15%</Text>
                    </View>
                  </View>
                  <Text style={styles.metricNumber}>{projects.length}</Text>
                  <Text style={styles.metricLabel}>Total Projects</Text>
                  <Text style={styles.metricDetail}>{projects.filter(p => p.status === 'In Progress').length} active, {projects.filter(p => p.status === 'Completed').length} completed</Text>
                </View>

                <View style={[styles.metricCard, { borderLeftColor: '#4CAF50' }]}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                    <View style={styles.trendIndicator}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={styles.trendText}>+22%</Text>
                    </View>
                  </View>
                  <Text style={styles.metricNumber}>{tasks.filter(t => t.status === 'Completed').length}</Text>
                  <Text style={styles.metricLabel}>Tasks Completed</Text>
                  <Text style={styles.metricDetail}>This week: {Math.floor(tasks.filter(t => t.status === 'Completed').length * 0.3)} tasks</Text>
                </View>

                <View style={[styles.metricCard, { borderLeftColor: '#FF9800' }]}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="people" size={28} color="#FF9800" />
                    <View style={styles.trendIndicator}>
                      <Ionicons name="checkmark" size={16} color="#4CAF50" />
                      <Text style={styles.trendText}>98%</Text>
                    </View>
                  </View>
                  <Text style={styles.metricNumber}>{team.length}</Text>
                  <Text style={styles.metricLabel}>Team Members</Text>
                  <Text style={styles.metricDetail}>{team.filter(m => m.status === 'Available').length} available, 98% efficiency</Text>
                </View>

                <View style={[styles.metricCard, { borderLeftColor: '#9C27B0' }]}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="cash" size={28} color="#9C27B0" />
                    <View style={styles.trendIndicator}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={styles.trendText}>+8%</Text>
                    </View>
                  </View>
                  <Text style={styles.metricNumber}>₹{budget.reduce((sum, item) => sum + item.allocated, 0).toLocaleString()}</Text>
                  <Text style={styles.metricLabel}>Portfolio Value</Text>
                  <Text style={styles.metricDetail}>{budget.length > 0 ? Math.round((budget.reduce((sum, item) => sum + item.spent, 0) / budget.reduce((sum, item) => sum + item.allocated, 0)) * 100) : 0}% utilized, on budget</Text>
                </View>
              </View>
            </View>

            {/* Priority Management */}
            <View style={styles.prioritySection}>
              <Text style={styles.sectionTitle}>⚡ Priority Management</Text>
              <View style={styles.priorityContainer}>
                {tasks.filter(t => t.priority === 'High').slice(0, 3).map((task) => (
                  <View key={task.id} style={[styles.priorityCard, { borderLeftColor: '#F44336' }]}>
                    <View style={styles.priorityIcon}>
                      <Ionicons name="warning" size={24} color="#F44336" />
                    </View>
                    <View style={styles.priorityContent}>
                      <Text style={styles.priorityTitle}>{task.title}</Text>
                      <Text style={styles.priorityText}>Assigned to: {task.assignee}</Text>
                      <Text style={styles.priorityProject}>Due: {task.dueDate || 'No deadline'}</Text>
                    </View>
                    <TouchableOpacity style={styles.priorityAction}>
                      <Ionicons name="chevron-forward" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
                {tasks.filter(t => t.priority === 'High').length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>No high priority tasks</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Management Control Center */}
            <View style={styles.controlSection}>
              <Text style={styles.sectionTitle}>🎯 Management Control Center</Text>
              <View style={styles.controlGrid}>
                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E3F2FD' }]}
                  onPress={() => setActivePage('Project Management')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="bar-chart" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Project Management</Text>
                  <Text style={styles.controlSubtitle}>{projects.length} active projects</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>85%</Text>
                    <Text style={styles.controlLabel}>On Schedule</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => setActivePage('Team Management')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="people" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Team Management</Text>
                  <Text style={styles.controlSubtitle}>{team.length} team members</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>98%</Text>
                    <Text style={styles.controlLabel}>Efficiency</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E8F5E8' }]}
                  onPress={() => setActivePage('Task Assignment')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="clipboard" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Task Assignment</Text>
                  <Text style={styles.controlSubtitle}>{tasks.length} total tasks</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>{tasks.filter(t => t.status === 'Completed').length}</Text>
                    <Text style={styles.controlLabel}>Completed</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#F3E5F5' }]}
                  onPress={() => setActivePage('Budget Management')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.controlIcon, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="cash" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlTitle}>Budget Management</Text>
                  <Text style={styles.controlSubtitle}>₹{budget.reduce((sum, item) => sum + item.allocated, 0).toLocaleString()} portfolio</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlValue}>65%</Text>
                    <Text style={styles.controlLabel}>Utilized</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Tools */}
            <View style={styles.toolsSection}>
              <Text style={styles.sectionTitle}>🔧 Quick Management Tools</Text>
              <View style={styles.toolsGrid}>
                <TouchableOpacity style={styles.toolItem} onPress={() => setActivePage('Vendor Management')}>
                  <Ionicons name="business" size={24} color="#673AB7" />
                  <Text style={styles.toolText}>Vendors</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => Alert.alert('Reports', 'Generate project reports')}>
                  <Ionicons name="document-text" size={24} color="#795548" />
                  <Text style={styles.toolText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => Alert.alert('Calendar', 'View project calendar')}>
                  <Ionicons name="calendar" size={24} color="#607D8B" />
                  <Text style={styles.toolText}>Calendar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => navigation.navigate('MaterialRequests')}>
                  <Ionicons name="cube" size={24} color="#FF5722" />
                  <Text style={styles.toolText}>Materials</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => navigation.navigate('CommunicationCenter')}>
                  <Ionicons name="chatbubbles" size={24} color="#009688" />
                  <Text style={styles.toolText}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolItem} onPress={() => Alert.alert('Settings', 'Project settings')}>
                  <Ionicons name="settings" size={24} color="#666" />
                  <Text style={styles.toolText}>Settings</Text>
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
          {activePage === "Dashboard" ? "Project Manager Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => {
        setModalVisible(false);
        setEditingTask(null);
        setTaskForm({ title: '', description: '', assignee: '', priority: 'Medium', dueDate: '' });
      }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Assign New Task'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title *"
              placeholderTextColor="#999"
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({...taskForm, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              placeholderTextColor="#999"
              value={taskForm.description}
              onChangeText={(text) => setTaskForm({...taskForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Assignee *"
              placeholderTextColor="#999"
              value={taskForm.assignee}
              onChangeText={(text) => setTaskForm({...taskForm, assignee: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={taskForm.dueDate}
              onChangeText={(text) => setTaskForm({...taskForm, dueDate: text})}
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              {['Low', 'Medium', 'High'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityOption, {
                    backgroundColor: taskForm.priority === priority ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setTaskForm({...taskForm, priority})}
                >
                  <Text style={[styles.priorityText, {
                    color: taskForm.priority === priority ? '#fff' : '#666'
                  }]}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setModalVisible(false);
                setEditingTask(null);
                setTaskForm({ title: '', description: '', assignee: '', priority: 'Medium', dueDate: '' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={createTask}>
                <Text style={styles.submitButtonText}>{editingTask ? 'Update Task' : 'Assign Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Team Task Assignment Modal */}
      <Modal animationType="slide" transparent={true} visible={teamTaskModalVisible} onRequestClose={() => setTeamTaskModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Task to {selectedMember?.name}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title *"
              placeholderTextColor="#999"
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({...taskForm, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              placeholderTextColor="#999"
              value={taskForm.description}
              onChangeText={(text) => setTaskForm({...taskForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={taskForm.dueDate}
              onChangeText={(text) => setTaskForm({...taskForm, dueDate: text})}
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              {['Low', 'Medium', 'High'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityOption, {
                    backgroundColor: taskForm.priority === priority ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setTaskForm({...taskForm, priority})}
                >
                  <Text style={[styles.priorityText, {
                    color: taskForm.priority === priority ? '#fff' : '#666'
                  }]}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setTeamTaskModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={() => {
                if (!taskForm.title) {
                  Alert.alert('Error', 'Please enter task title');
                  return;
                }
                const newTask = {
                  id: tasks.length + 1,
                  title: taskForm.title,
                  description: taskForm.description,
                  assignee: selectedMember?.name,
                  priority: taskForm.priority,
                  dueDate: taskForm.dueDate,
                  status: 'Pending'
                };
                setTasks([newTask, ...tasks]);
                setTaskForm({ title: '', description: '', assignee: '', priority: 'Medium', dueDate: '' });
                setTeamTaskModalVisible(false);
                Alert.alert('Success', `Task assigned to ${selectedMember?.name} successfully!`);
              }}>
                <Text style={styles.submitButtonText}>Assign Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member Details Modal */}
      <Modal animationType="slide" transparent={true} visible={memberDetailsModalVisible} onRequestClose={() => setMemberDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.memberDetailsHeader}>
              <Text style={styles.modalTitle}>{selectedMember?.name}</Text>
              <TouchableOpacity onPress={() => setMemberDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.memberDetailsContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{selectedMember?.role}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: selectedMember?.status === 'Available' ? '#4CAF50' : '#FF9800'
                }]}>
                  <Text style={styles.statusText}>{selectedMember?.status}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Current Task:</Text>
                <Text style={styles.detailValue}>{selectedMember?.currentTask}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Performance:</Text>
                <View style={styles.performanceDetail}>
                  <Text style={styles.performanceValue}>{selectedMember?.performance}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${selectedMember?.performance}%` }]} />
                  </View>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Contact Information:</Text>
                <Text style={styles.detailValue}>Email: {selectedMember?.email || 'Not provided'}</Text>
                <Text style={styles.detailValue}>Phone: {selectedMember?.phone || 'Not provided'}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Recent Activities:</Text>
                <Text style={styles.activityItem}>• Completed safety training certification</Text>
                <Text style={styles.activityItem}>• Updated project progress report</Text>
                <Text style={styles.activityItem}>• Attended team meeting on {new Date().toLocaleDateString()}</Text>
              </View>
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

      {/* Vendor Management Modal */}
      <Modal animationType="slide" transparent={true} visible={vendorModalVisible} onRequestClose={() => {
        setVendorModalVisible(false);
        setEditingVendor(null);
        setVendorForm({ name: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '' });
      }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Vendor Name *"
              placeholderTextColor="#999"
              value={vendorForm.name}
              onChangeText={(text) => setVendorForm({...vendorForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Vendor Code *"
              placeholderTextColor="#999"
              value={vendorForm.vendor_code}
              onChangeText={(text) => setVendorForm({...vendorForm, vendor_code: text})}
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Vendor Type:</Text>
              {[{key: 'supplier', label: 'Material Supplier'}, {key: 'subcontractor', label: 'Subcontractor'}, {key: 'equipment_rental', label: 'Equipment Rental'}, {key: 'service_provider', label: 'Service Provider'}].map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.priorityOption, {
                    backgroundColor: vendorForm.vendor_type === type.key ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setVendorForm({...vendorForm, vendor_type: type.key})}
                >
                  <Text style={[styles.priorityText, {
                    color: vendorForm.vendor_type === type.key ? '#fff' : '#666'
                  }]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Contact Person *"
              placeholderTextColor="#999"
              value={vendorForm.contact_person}
              onChangeText={(text) => setVendorForm({...vendorForm, contact_person: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#999"
              value={vendorForm.email}
              onChangeText={(text) => setVendorForm({...vendorForm, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              value={vendorForm.phone}
              onChangeText={(text) => setVendorForm({...vendorForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address"
              placeholderTextColor="#999"
              value={vendorForm.address}
              onChangeText={(text) => setVendorForm({...vendorForm, address: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tax ID"
              placeholderTextColor="#999"
              value={vendorForm.tax_id}
              onChangeText={(text) => setVendorForm({...vendorForm, tax_id: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setVendorModalVisible(false);
                setEditingVendor(null);
                setVendorForm({ name: '', vendor_code: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '', tax_id: '' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={createVendor}>
                <Text style={styles.submitButtonText}>{editingVendor ? 'Update Vendor' : 'Add Vendor'}</Text>
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
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'P'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Project Manager'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Project Manager'}</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />
        
        <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
          {[
            { title: "Dashboard", icon: "home" },
            { title: "Project Management", icon: "bar-chart" },
            { title: "Team Management", icon: "people" },
            { title: "Vendor Management", icon: "business" },
            { title: "Task Assignment", icon: "clipboard" },
            { title: "Budget Management", icon: "cash" },
            { title: "Material Requests", icon: "cube" },
            { title: "Documents", icon: "document-text" },
            { title: "Communications", icon: "chatbubbles" },
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
        </ScrollView>
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
  
  // Professional Header Styles
  professionalHeader: {
    marginBottom: 20,
  },
  headerGradient: {
    backgroundColor: "#003366",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: "center",
  },
  managerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  headerGreeting: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "500",
    marginBottom: 5,
  },
  managerName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  roleTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 15,
  },
  dateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
  },
  currentDate: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  currentTime: {
    color: "#B3D9FF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  // Metrics Section
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 3,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#003366",
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  metricDetail: {
    fontSize: 11,
    color: "#999",
    lineHeight: 15,
  },

  // Priority Section
  prioritySection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  priorityContainer: {
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

  // Control Section
  controlSection: {
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

  // Tools Section
  toolsSection: {
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
  projectsCard: {
    borderTopWidth: 3,
    borderTopColor: "#2196F3",
  },
  tasksCard: {
    borderTopWidth: 3,
    borderTopColor: "#4CAF50",
  },
  teamCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF9800",
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
  meetingAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  meetingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  meetingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginBottom: 2,
  },
  meetingText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
    fontWeight: "500",
  },
  meetingTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  successAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 2,
  },
  successText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
    fontWeight: "500",
  },
  successTime: {
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
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 20, marginBottom: 20 },
  statBox: { backgroundColor: "#fff", borderRadius: 12, padding: 15, alignItems: "center", flex: 1, marginHorizontal: 5, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#003366", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#666" },
  
  requestCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  requestId: { fontSize: 14, fontWeight: "600", color: "#003366" },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  requestMaterial: { fontSize: 14, color: "#333", marginBottom: 4 },
  requestQuantity: { fontSize: 12, color: "#666", marginBottom: 2 },
  requestCost: { fontSize: 12, color: "#4CAF50", fontWeight: "600", marginBottom: 8 },
  
  cardContainer: { paddingHorizontal: 10 },
  
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  pageContainer: { padding: 20, alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 25, paddingHorizontal: 15, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  
  projectCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  projectName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  projectDetails: { marginBottom: 15 },
  projectDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  projectDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  
  teamCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  teamHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  teamName: { fontSize: 16, fontWeight: "600", color: "#003366" },
  teamRole: { fontSize: 14, color: "#666", marginBottom: 4 },
  teamTask: { fontSize: 12, color: "#666", marginBottom: 10 },
  performanceContainer: { marginBottom: 15 },
  performanceLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  teamActions: { flexDirection: "row", justifyContent: "space-around" },
  actionBtn: { backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { color: "#fff", fontSize: 12 },
  
  taskCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  taskDetails: { marginBottom: 15 },
  taskDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  taskDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  taskActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  budgetSummary: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginHorizontal: 20, marginBottom: 20, alignItems: "center", elevation: 2 },
  budgetTitle: { fontSize: 16, color: "#666", marginBottom: 5 },
  budgetAmount: { fontSize: 28, fontWeight: "bold", color: "#003366", marginBottom: 5 },
  budgetSpent: { fontSize: 14, color: "#666" },
  
  budgetCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  budgetCategory: { fontSize: 16, fontWeight: "600", color: "#003366" },
  budgetPercentage: { fontSize: 14, fontWeight: "600", color: "#666" },
  budgetDetails: { marginBottom: 10 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  budgetLabel: { fontSize: 12, color: "#666" },
  budgetValue: { fontSize: 12, fontWeight: "600", color: "#003366" },
  
  vendorCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, color: "#666", marginLeft: 4 },
  vendorType: { fontSize: 12, color: "#666", marginBottom: 4 },
  vendorContact: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorEmail: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorPhone: { fontSize: 12, color: "#666", marginBottom: 10 },
  vendorActions: { flexDirection: "row", justifyContent: "space-around" },
  
  statusBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  viewButton: { alignSelf: "flex-start", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
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
  
  priorityContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, flexWrap: "wrap" },
  priorityLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  priorityOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
  priorityText: { fontSize: 12 },
  
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
    elevation: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.3, 
    shadowRadius: 10,
    zIndex: 1000
  },
  menuScrollView: {
    flex: 1,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999
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
  
  // Member details modal styles
  memberDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  memberDetailsContent: {
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  performanceDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginRight: 10,
    minWidth: 40,
  },
  activityItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    paddingLeft: 10,
  },
  emptyTeamState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  }
});