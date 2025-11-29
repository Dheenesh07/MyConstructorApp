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
import { userAPI } from '../utils/api';

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
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadProjects();
    loadTeam();
    loadTasks();
    loadBudget();
    loadVendors();
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

  const loadProjects = () => {
    setProjects([
      { id: 1, name: 'Residential Complex A', progress: 65, status: 'In Progress', deadline: '2024-06-15', budget: 2500000, spent: 1625000 },
      { id: 2, name: 'Office Building B', progress: 25, status: 'In Progress', deadline: '2024-08-30', budget: 5000000, spent: 1250000 },
      { id: 3, name: 'Shopping Mall C', progress: 100, status: 'Completed', deadline: '2024-01-15', budget: 8000000, spent: 7800000 }
    ]);
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

  const loadTasks = () => {
    setTasks([
      { id: 1, title: 'Foundation Inspection', assignee: 'Sarah Davis', priority: 'High', status: 'In Progress', dueDate: '2024-01-15' },
      { id: 2, title: 'Material Procurement', assignee: 'Mike Johnson', priority: 'Medium', status: 'Pending', dueDate: '2024-01-18' },
      { id: 3, title: 'Safety Training', assignee: 'Lisa Wilson', priority: 'High', status: 'Completed', dueDate: '2024-01-12' },
      { id: 4, title: 'Quality Audit', assignee: 'Tom Brown', priority: 'Medium', status: 'In Progress', dueDate: '2024-01-20' }
    ]);
  };

  const loadBudget = () => {
    setBudget([
      { category: 'Materials', allocated: 1500000, spent: 980000, remaining: 520000 },
      { category: 'Labor', allocated: 800000, spent: 520000, remaining: 280000 },
      { category: 'Equipment', allocated: 300000, spent: 180000, remaining: 120000 },
      { category: 'Overhead', allocated: 200000, spent: 145000, remaining: 55000 }
    ]);
  };

  const loadVendors = () => {
    setVendors([
      { id: 1, name: 'ABC Construction Materials', vendor_code: 'VEN001', vendor_type: 'supplier', contact_person: 'John Smith', email: 'john@abc.com', phone: '555-0101', address: '123 Main St', tax_id: 'TAX001', rating: 4.5, is_approved: true },
      { id: 2, name: 'Heavy Equipment Rentals', vendor_code: 'VEN002', vendor_type: 'equipment_rental', contact_person: 'Sarah Johnson', email: 'sarah@her.com', phone: '555-0102', address: '456 Oak Ave', tax_id: 'TAX002', rating: 4.2, is_approved: true },
      { id: 3, name: 'Elite Subcontractors', vendor_code: 'VEN003', vendor_type: 'subcontractor', contact_person: 'Mike Davis', email: 'mike@elite.com', phone: '555-0103', address: '789 Pine Rd', tax_id: 'TAX003', rating: 4.8, is_approved: false }
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

      case "Budget Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💰 Budget Management</Text>
            </View>
            
            <View style={styles.budgetSummary}>
              <Text style={styles.budgetTitle}>Total Project Budget</Text>
              <Text style={styles.budgetAmount}>$2.8M</Text>
              <Text style={styles.budgetSpent}>Spent: $1.825M (65%)</Text>
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

      case "Logout":
        setLogoutModalVisible(true);
        setActivePage("Dashboard");
        return renderContent();

      default:
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.welcome}>📋 Welcome back, {user?.username || 'Project Manager'}!</Text>
              <Text style={styles.subtitle}>Beemji Construction - Project Management Hub</Text>
              <Text style={styles.dateTime}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name="construct" size={24} color="#2196F3" />
                </View>
                <Text style={styles.metricNumber}>{projects.filter(p => p.status === 'In Progress').length}</Text>
                <Text style={styles.metricLabel}>Active Projects</Text>
                <Text style={styles.metricChange}>85% on schedule</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.metricNumber}>{tasks.filter(t => t.status === 'Completed').length}</Text>
                <Text style={styles.metricLabel}>Tasks Completed</Text>
                <Text style={styles.metricChange}>+15 this week</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name="people" size={24} color="#FF9800" />
                </View>
                <Text style={styles.metricNumber}>{team.length}</Text>
                <Text style={styles.metricLabel}>Team Members</Text>
                <Text style={styles.metricChange}>98% attendance</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.metricNumber}>₹1.8M</Text>
                <Text style={styles.metricLabel}>Project Value</Text>
                <Text style={styles.metricChange}>Within budget</Text>
              </View>
            </View>
            
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Project Priorities</Text>
              <View style={styles.alertCard}>
                <Ionicons name="time" size={20} color="#FF5722" />
                <Text style={styles.alertText}>Residential Complex A: Foundation inspection due today</Text>
              </View>
              <View style={styles.alertCard}>
                <Ionicons name="people" size={20} color="#FF9800" />
                <Text style={styles.alertText}>Team standup at 2:00 PM - Weekly progress review</Text>
              </View>
              <View style={styles.alertCard}>
                <Ionicons name="cash" size={20} color="#4CAF50" />
                <Text style={styles.alertText}>Budget approval received for Office Building B</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>📊 Quick Actions</Text>
            <FlatList
              data={[
                { title: "📊 Project Management", count: `${projects.length} projects`, color: '#2196F3' },
                { title: "👥 Team Management", count: `${team.length} members`, color: '#FF9800' },
                { title: "📋 Task Assignment", count: `${tasks.length} tasks`, color: '#4CAF50' },
                { title: "💰 Budget Management", count: '$2.8M budget', color: '#9C27B0' },
              ]}
              numColumns={2}
              keyExtractor={(item) => item.title}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.actionCard, { borderLeftColor: item.color }]}
                  onPress={() => setActivePage(item.title.replace(/^[^ ]+\s/, ""))}
                >
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionCount}>{item.count}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#666" style={styles.actionArrow} />
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
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({...taskForm, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              value={taskForm.description}
              onChangeText={(text) => setTaskForm({...taskForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Assignee *"
              value={taskForm.assignee}
              onChangeText={(text) => setTaskForm({...taskForm, assignee: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
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
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({...taskForm, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              value={taskForm.description}
              onChangeText={(text) => setTaskForm({...taskForm, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
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
              value={vendorForm.name}
              onChangeText={(text) => setVendorForm({...vendorForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Vendor Code *"
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
              value={vendorForm.contact_person}
              onChangeText={(text) => setVendorForm({...vendorForm, contact_person: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={vendorForm.email}
              onChangeText={(text) => setVendorForm({...vendorForm, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={vendorForm.phone}
              onChangeText={(text) => setVendorForm({...vendorForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address"
              value={vendorForm.address}
              onChangeText={(text) => setVendorForm({...vendorForm, address: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tax ID"
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
        
        {[
          { title: "Dashboard", icon: "home" },
          { title: "Project Management", icon: "bar-chart" },
          { title: "Team Management", icon: "people" },
          { title: "Vendor Management", icon: "business" },
          { title: "Task Assignment", icon: "clipboard" },
          { title: "Budget Management", icon: "cash" }
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
  
  dashboardHeader: { padding: 20, alignItems: "center", backgroundColor: "#fff", marginBottom: 20, elevation: 2 },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  dateTime: { fontSize: 14, color: "#999", marginTop: 4, textAlign: "center" },
  
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, marginBottom: 20 },
  metricCard: { width: "48%", backgroundColor: "#fff", borderRadius: 12, padding: 15, margin: "1%", elevation: 3 },
  metricIcon: { alignSelf: "flex-start", marginBottom: 10 },
  metricNumber: { fontSize: 28, fontWeight: "bold", color: "#003366", marginBottom: 4 },
  metricLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  metricChange: { fontSize: 11, color: "#4CAF50", fontWeight: "500" },
  
  alertsSection: { paddingHorizontal: 20, marginBottom: 20 },
  alertCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1, borderLeftWidth: 4, borderLeftColor: "#FF5722" },
  alertText: { marginLeft: 10, fontSize: 13, color: "#333", flex: 1 },
  
  actionCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, margin: 10, elevation: 2, width: width / 2.4, borderLeftWidth: 4 },
  actionTitle: { fontSize: 13, color: "#003366", fontWeight: "600", marginBottom: 8 },
  actionCount: { fontSize: 11, color: "#666", marginBottom: 8 },
  actionArrow: { alignSelf: "flex-end" },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
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
  
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: "#fff" },
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
});