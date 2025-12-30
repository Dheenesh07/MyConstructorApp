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
import { userAPI, projectAPI, vendorAPI, safetyAPI, qualityAPI, budgetAPI, purchaseOrderAPI, invoiceAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'worker',
    phone: ''
  });
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'Progress',
    description: ''
  });
  const [viewReportModalVisible, setViewReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'worker',
    phone: ''
  });
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsType, setSettingsType] = useState('');
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'minor',
    location_details: '',
    injured_person: '',
    project: ''
  });
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [viewVendorModalVisible, setViewVendorModalVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    vendor_code: '',
    vendor_type: 'supplier',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    rating: 4.0,
    is_approved: true
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Beemji Construction',
    address: '123 Construction Ave, Building City',
    phone: '+91 98765 43210',
    email: 'info@beemji.com'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false
  });
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadUsers();
    loadProjects();
    loadReports();
    loadVendors();
    loadIncidents();
    loadInspections();
    loadBudgets();
    loadPurchaseOrders();
    loadInvoices();
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

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.map(user => ({
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        status: user.is_active_employee ? 'Active' : 'Inactive',
        lastLogin: user.last_login?.split('T')[0] || 'Never'
      })));
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'project_manager', status: 'Active', lastLogin: '2024-01-12' }
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      if (response.data && response.data.length > 0) {
        setProjects(response.data.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress_percentage || 0,
          budget: project.total_budget || 0,
          spent: project.actual_cost || 0,
          manager: project.project_manager_name || 'Not assigned'
        })));
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadReports = () => {
    setReports([
      { id: 1, title: 'Monthly Progress Report', type: 'Progress', date: '2024-01-12', status: 'Generated' },
      { id: 2, title: 'Budget Analysis Q1', type: 'Financial', date: '2024-01-10', status: 'Pending' },
      { id: 3, title: 'Safety Compliance Report', type: 'Safety', date: '2024-01-08', status: 'Generated' }
    ]);
  };

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([
        { id: 1, name: 'ABC Construction Materials', vendor_code: 'VEN001', vendor_type: 'supplier', contact_person: 'John Smith', email: 'john@abc.com', phone: '555-0101', address: '123 Main St', tax_id: 'TAX001', rating: 4.5, is_approved: true },
        { id: 2, name: 'Heavy Equipment Rentals', vendor_code: 'VEN002', vendor_type: 'equipment_rental', contact_person: 'Sarah Johnson', email: 'sarah@her.com', phone: '555-0102', address: '456 Oak Ave', tax_id: 'TAX002', rating: 4.2, is_approved: true },
        { id: 3, name: 'Elite Subcontractors', vendor_code: 'VEN003', vendor_type: 'subcontractor', contact_person: 'Mike Davis', email: 'mike@elite.com', phone: '555-0103', address: '789 Pine Rd', tax_id: 'TAX003', rating: 4.8, is_approved: false }
      ]);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await safetyAPI.getIncidents();
      setIncidents(response.data || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([]);
    }
  };

  const loadInspections = async () => {
    try {
      const response = await qualityAPI.getInspections();
      setInspections(response.data || []);
    } catch (error) {
      console.error('Error loading inspections:', error);
      setInspections([]);
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudgets(response.data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderAPI.getAll();
      setPurchaseOrders(response.data || []);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      setPurchaseOrders([]);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const calculateComplianceRate = () => {
    if (inspections.length === 0) return 0;
    const passedInspections = inspections.filter(i => i.status === 'passed').length;
    return Math.round((passedInspections / inspections.length) * 100);
  };

  const calculateDaysSafe = () => {
    if (incidents.length === 0) return 0;
    const sortedIncidents = incidents.sort((a, b) => 
      new Date(b.incident_date) - new Date(a.incident_date)
    );
    const lastIncident = sortedIncidents[0];
    if (!lastIncident || !lastIncident.incident_date) return 0;
    const lastIncidentDate = new Date(lastIncident.incident_date);
    const today = new Date();
    const diffTime = Math.abs(today - lastIncidentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalRevenue = () => {
    return invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  };

  const calculateBudgetEfficiency = () => {
    if (budgets.length === 0) return 0;
    const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
    if (totalAllocated === 0) return 0;
    return Math.round((1 - (totalSpent / totalAllocated)) * 100);
  };

  const getPendingApprovals = () => {
    const pendingPOs = purchaseOrders.filter(po => po.status === 'draft' || po.status === 'pending').length;
    const pendingVendors = vendors.filter(v => !v.is_approved).length;
    return pendingPOs + pendingVendors;
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

  const generateReport = () => {
    if (!reportForm.title || !reportForm.description) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    const newReport = {
      id: reports.length + 1,
      title: reportForm.title,
      type: reportForm.type,
      date: new Date().toISOString().split('T')[0],
      status: 'Generated'
    };
    setReports([newReport, ...reports]);
    setReportForm({ title: '', type: 'Progress', description: '' });
    setReportModalVisible(false);
    Alert.alert('Success', 'Report generated successfully!');
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setViewReportModalVisible(true);
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || ''
    });
    setEditUserModalVisible(true);
  };

  const updateUser = async () => {
    if (!editUserForm.name || !editUserForm.email) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, name: editUserForm.name, email: editUserForm.email, role: editUserForm.role }
          : user
      );
      setUsers(updatedUsers);
      setEditUserModalVisible(false);
      Alert.alert('Success', 'User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const deleteUser = (user) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedUsers = users.filter(u => u.id !== user.id);
            setUsers(updatedUsers);
            Alert.alert('Success', 'User deleted successfully!');
          }
        }
      ]
    );
  };

  const openSettings = (type) => {
    setSettingsType(type);
    setSettingsModalVisible(true);
  };

  const reportIncident = async () => {
    if (!incidentForm.title || !incidentForm.description || !incidentForm.project) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      // In a real app, this would call the API to create the incident
      const selectedProject = projects.find(p => p.id === incidentForm.project);
      const newIncident = {
        id: Date.now(),
        incident_id: `INC-${String(Date.now()).slice(-3)}`,
        title: incidentForm.title,
        description: incidentForm.description,
        severity: incidentForm.severity,
        location_details: incidentForm.location_details,
        injured_person: incidentForm.injured_person,
        project: incidentForm.project,
        project_name: selectedProject?.name || 'Unknown Project',
        status: 'reported',
        reported_date: new Date().toISOString().split('T')[0],
        reported_by: user?.username || 'Admin'
      };
      
      setIncidents([newIncident, ...incidents]);
      setIncidentForm({
        title: '',
        description: '',
        severity: 'minor',
        location_details: '',
        injured_person: '',
        project: ''
      });
      setIncidentModalVisible(false);
      Alert.alert('Success', 'Safety incident reported successfully! Incident ID: ' + newIncident.incident_id);
    } catch (error) {
      console.error('Error reporting incident:', error);
      Alert.alert('Error', 'Failed to report incident');
    }
  };

  const handleSettingsAction = () => {
    switch (settingsType) {
      case 'company':
        Alert.alert('Success', 'Company information updated successfully!');
        break;
      case 'notifications':
        Alert.alert('Success', 'Notification settings updated successfully!');
        break;
      case 'permissions':
        Alert.alert('Success', 'User permissions updated successfully!');
        break;
      case 'password':
        Alert.alert('Success', 'Password policy updated successfully!');
        break;
      case 'backup':
        Alert.alert('Backup Started', 'Database backup initiated. You will be notified when complete.');
        break;
      case 'updates':
        Alert.alert('System Updated', 'System is up to date. Version 2.1.3 installed.');
        break;
      default:
        Alert.alert('Success', 'Settings updated successfully!');
    }
    setSettingsModalVisible(false);
  };

  const createVendor = async () => {
    if (!vendorForm.name || !vendorForm.email || !vendorForm.phone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      const response = await vendorAPI.create(vendorForm);
      setVendors([response.data, ...vendors]);
      setVendorForm({
        name: '',
        vendor_code: '',
        vendor_type: 'supplier',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        rating: 4.0,
        is_approved: true
      });
      setVendorModalVisible(false);
      Alert.alert('Success', 'Vendor created successfully!');
      loadVendors();
    } catch (error) {
      console.error('Error creating vendor:', error);
      Alert.alert('Error', `Failed to create vendor: ${error.response?.data?.detail || error.message}`);
    }
  };

  const createUser = async () => {
    if (!userForm.name || !userForm.email) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      const response = await userAPI.create({
        username: userForm.email.split('@')[0],
        email: userForm.email,
        role: userForm.role,
        phone: userForm.phone,
        password: 'TempPass123!',
        employee_id: `EMP${Date.now().toString().slice(-4)}`,
        department: 'Construction'
      });
      const newUser = {
        id: response.data.id,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: 'Active',
        lastLogin: 'Never'
      };
      setUsers([newUser, ...users]);
      setUserForm({ name: '', email: '', role: 'worker', phone: '' });
      setModalVisible(false);
      Alert.alert('Success', 'User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "User Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>👥 User Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
            
            {users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: user.status === 'Active' ? '#4CAF50' : '#F44336' }]}>
                    <Text style={styles.statusText}>{user.status}</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userDetails}>
                  <Text style={styles.userRole}>{user.role.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.userLastLogin}>Last login: {user.lastLogin}</Text>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => editUser(user)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteUser(user)}>
                    <Text style={styles.actionBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Project Overview":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📊 Project Overview</Text>
            </View>
            
            {projects.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: project.status === 'completed' ? '#4CAF50' : 
                                   project.status === 'active' || project.status === 'in_progress' ? '#FF9800' : 
                                   project.status === 'planning' ? '#2196F3' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{project.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress: {project.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                </View>
                
                <View style={styles.projectStats}>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Budget</Text>
                    <Text style={styles.statValue}>${(project.budget / 1000000).toFixed(1)}M</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statValue}>${(project.spent / 1000000).toFixed(1)}M</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Manager</Text>
                    <Text style={styles.statValue}>{project.manager}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "System Reports":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📈 System Reports</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setReportModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Generate Report</Text>
              </TouchableOpacity>
            </View>
            
            {reports.map(report => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: report.status === 'Generated' ? '#4CAF50' : '#FF9800' }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.reportType}>Type: {report.type}</Text>
                  <Text style={styles.reportDate}>Date: {report.date}</Text>
                </View>
                <TouchableOpacity style={styles.viewButton} onPress={() => viewReport(report)}>
                  <Text style={styles.viewButtonText}>View Report</Text>
                </TouchableOpacity>
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
                  <View style={[styles.statusBadge, { 
                    backgroundColor: vendor.is_approved ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{vendor.is_approved ? 'Approved' : 'Pending'}</Text>
                  </View>
                </View>
                <Text style={styles.vendorType}>{vendor.vendor_type?.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.userEmail}>{vendor.email} • {vendor.phone}</Text>
                <View style={styles.vendorActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedVendor(vendor); setViewVendorModalVisible(true); }}>
                    <Text style={styles.actionBtnText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: vendor.is_approved ? '#FF9800' : '#4CAF50' }]}>
                    <Text style={styles.actionBtnText}>{vendor.is_approved ? 'Suspend' : 'Approve'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Project Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💼 Project Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProjectManagement')}>
                <Ionicons name="briefcase" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Projects</Text>
              </TouchableOpacity>
            </View>
            
            {projects.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: project.status === 'completed' ? '#4CAF50' : 
                                   project.status === 'active' || project.status === 'in_progress' ? '#FF9800' : 
                                   project.status === 'planning' ? '#2196F3' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{project.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress: {project.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                </View>
                
                <View style={styles.projectStats}>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Budget</Text>
                    <Text style={styles.statValue}>${(project.budget / 1000000).toFixed(1)}M</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statValue}>${(project.spent / 1000000).toFixed(1)}M</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Text style={styles.statLabel}>Manager</Text>
                    <Text style={styles.statValue}>{project.manager}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Task Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 Task Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('TaskAssignment')}>
                <Ionicons name="clipboard" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Tasks</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Task Overview</Text>
              <Text style={styles.managementDescription}>Assign, track, and monitor all project tasks across teams</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('TaskAssignment')}>
                <Text style={styles.managementButtonText}>Open Task Management</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.managementDescription}>Track check-in/check-out times and monitor employee attendance records</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('AttendanceTracking')}>
                <Text style={styles.managementButtonText}>Open Attendance Tracking</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Material Requests":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📦 Material Requests</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('MaterialRequests')}>
                <Ionicons name="cube" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Requests</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Material Request Management</Text>
              <Text style={styles.managementDescription}>Create, approve, and track material requests</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('MaterialRequests')}>
                <Text style={styles.managementButtonText}>Open Material Requests</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Purchase Orders":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🛒 Purchase Orders</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PurchaseOrders')}>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Orders</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Purchase Order Management</Text>
              <Text style={styles.managementDescription}>Create, approve, and track purchase orders</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('PurchaseOrders')}>
                <Text style={styles.managementButtonText}>Open Purchase Orders</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Invoice Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📄 Invoice Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('InvoiceManagement')}>
                <Ionicons name="receipt" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Invoices</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Invoice Control</Text>
              <Text style={styles.managementDescription}>Create, approve, and track vendor invoices</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('InvoiceManagement')}>
                <Text style={styles.managementButtonText}>Open Invoice Management</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Budget & Finance":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💰 Budget & Finance</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('BudgetFinancials')}>
                <Ionicons name="cash" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Budget</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Financial Control</Text>
              <Text style={styles.managementDescription}>Monitor budgets, expenses, and financial performance</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('BudgetFinancials')}>
                <Text style={styles.managementButtonText}>Open Budget Management</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Equipment Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🔧 Equipment Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('EquipmentInventory')}>
                <Ionicons name="build" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Equipment</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Asset Control</Text>
              <Text style={styles.managementDescription}>Track equipment, maintenance schedules, and inventory</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('EquipmentInventory')}>
                <Text style={styles.managementButtonText}>Open Equipment Management</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Documents":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📄 Documents</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('DocumentManagement')}>
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Documents</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Document Management</Text>
              <Text style={styles.managementDescription}>Upload, organize, and manage project documents, blueprints, and reports</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('DocumentManagement')}>
                <Text style={styles.managementButtonText}>Open Documents</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Communication Center":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>💬 Communication Center</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CommunicationCenter')}>
                <Ionicons name="chatbubbles" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Open Messages</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Team Communications</Text>
              <Text style={styles.managementDescription}>Send and receive messages, progress updates, safety alerts, and issue reports</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('CommunicationCenter')}>
                <Text style={styles.managementButtonText}>Open Communication Center</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Safety & Compliance":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🛡️ Safety & Compliance</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('SafetyCompliance')}>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Manage Safety</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.safetyStats}>
              <View style={styles.safetyStatCard}>
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                <Text style={styles.safetyStatNumber}>{calculateComplianceRate()}%</Text>
                <Text style={styles.safetyStatLabel}>Compliance Rate</Text>
              </View>
              <View style={styles.safetyStatCard}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <Text style={styles.safetyStatNumber}>{incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length}</Text>
                <Text style={styles.safetyStatLabel}>Open Incidents</Text>
              </View>
              <View style={styles.safetyStatCard}>
                <Ionicons name="calendar" size={24} color="#2196F3" />
                <Text style={styles.safetyStatNumber}>{calculateDaysSafe()}</Text>
                <Text style={styles.safetyStatLabel}>Days Since Last Incident</Text>
              </View>
            </View>
            
            <View style={styles.incidentCard}>
              <Text style={styles.incidentTitle}>Recent Safety Incidents</Text>
              {incidents.map(incident => (
                <View key={incident.id} style={styles.incidentItem}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentId}>{incident.incident_id}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: incident.status === 'resolved' ? '#4CAF50' : 
                                     incident.status === 'investigating' ? '#FF9800' : '#2196F3'
                    }]}>
                      <Text style={styles.statusText}>{incident.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.incidentDesc}>{incident.title}</Text>
                  <Text style={styles.incidentDate}>Reported: {incident.reported_date} • Site: {incident.project_name}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.managementCard} onPress={() => navigation.navigate('SafetyCompliance')}>
              <Text style={styles.managementTitle}>Full Safety Management</Text>
              <Text style={styles.managementDescription}>View all incidents, inspections, and compliance details</Text>
              <View style={styles.managementButton}>
                <Text style={styles.managementButtonText}>Open Safety & Compliance</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        );

      case "Reports & Analytics":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📈 Reports & Analytics</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ReportsAnalytics')}>
                <Ionicons name="bar-chart" size={20} color="#fff" />
                <Text style={styles.addButtonText}>View Reports</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.managementCard}>
              <Text style={styles.managementTitle}>Business Intelligence</Text>
              <Text style={styles.managementDescription}>Generate reports and analyze performance metrics</Text>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('ReportsAnalytics')}>
                <Text style={styles.managementButtonText}>Open Reports & Analytics</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "System Settings":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>⚙️ System Settings</Text>
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>General Settings</Text>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('company')}>
                <Ionicons name="business-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>Company Information</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('notifications')}>
                <Ionicons name="notifications-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>Notification Settings</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Security</Text>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('permissions')}>
                <Ionicons name="shield-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>User Permissions</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('password')}>
                <Ionicons name="key-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>Password Policy</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>System</Text>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('backup')}>
                <Ionicons name="server-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>Database Backup</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSettings('updates')}>
                <Ionicons name="download-outline" size={20} color="#003366" />
                <Text style={styles.settingsText}>System Updates</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "Logout":
        setLogoutModalVisible(true);
        setActivePage("Dashboard");
        return renderContent();

      default:
        return (
          <ScrollView style={styles.fullContainer}>
            {/* Executive Header */}
            <View style={styles.executiveHeader}>
              <View style={styles.headerContent}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.executiveWelcome}>🏗️ Executive Command Center</Text>
                  <Text style={styles.executiveSubtitle}>Welcome back, {user?.first_name || user?.username || 'Administrator'}</Text>
                  <Text style={styles.companyName}>Beemji Construction Ltd.</Text>
                </View>
                <View style={styles.dateTimeCard}>
                  <Text style={styles.currentDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                  <Text style={styles.currentTime}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatNumber}>{projects.filter(p => p.status === 'active').length}</Text>
                  <Text style={styles.headerStatLabel}>Active Projects</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatNumber}>₹{(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 10000000).toFixed(1)}Cr</Text>
                  <Text style={styles.headerStatLabel}>Total Portfolio</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatNumber}>{Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)}%</Text>
                  <Text style={styles.headerStatLabel}>Avg Progress</Text>
                </View>
              </View>
            </View>

            {/* Key Performance Indicators */}
            <View style={styles.kpiSection}>
              <Text style={styles.sectionTitle}>📊 Key Performance Indicators</Text>
              <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, { borderLeftColor: '#4CAF50' }]}>
                  <View style={styles.kpiHeader}>
                    <Ionicons name="people" size={28} color="#4CAF50" />
                    <View style={styles.kpiTrend}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={[styles.kpiTrendText, { color: '#4CAF50' }]}>+12%</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiNumber}>{users.length}</Text>
                  <Text style={styles.kpiLabel}>Total Workforce</Text>
                  <Text style={styles.kpiSubtext}>{users.filter(u => u.status === 'Active').length} active employees</Text>
                </View>

                <View style={[styles.kpiCard, { borderLeftColor: '#2196F3' }]}>
                  <View style={styles.kpiHeader}>
                    <Ionicons name="construct" size={28} color="#2196F3" />
                    <View style={styles.kpiTrend}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={[styles.kpiTrendText, { color: '#4CAF50' }]}>+18%</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiNumber}>{projects.length}</Text>
                  <Text style={styles.kpiLabel}>Project Portfolio</Text>
                  <Text style={styles.kpiSubtext}>{projects.filter(p => p.status === 'active').length} in progress, {projects.filter(p => p.status === 'completed').length} completed</Text>
                </View>

                <View style={[styles.kpiCard, { borderLeftColor: '#FF9800' }]}>
                  <View style={styles.kpiHeader}>
                    <Ionicons name="cash" size={28} color="#FF9800" />
                    <View style={styles.kpiTrend}>
                      <Ionicons name="trending-up" size={16} color="#4CAF50" />
                      <Text style={[styles.kpiTrendText, { color: '#4CAF50' }]}>{invoices.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiNumber}>₹{(calculateTotalRevenue() / 1000000).toFixed(1)}M</Text>
                  <Text style={styles.kpiLabel}>Total Revenue</Text>
                  <Text style={styles.kpiSubtext}>{invoices.length} invoices processed</Text>
                </View>

                <View style={[styles.kpiCard, { borderLeftColor: '#9C27B0' }]}>
                  <View style={styles.kpiHeader}>
                    <Ionicons name="business" size={28} color="#9C27B0" />
                    <View style={styles.kpiTrend}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.kpiTrendText, { color: '#4CAF50' }]}>{vendors.filter(v => v.is_approved).length}</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiNumber}>{vendors.length}</Text>
                  <Text style={styles.kpiLabel}>Vendor Network</Text>
                  <Text style={styles.kpiSubtext}>{vendors.filter(v => v.is_approved).length} approved partners</Text>
                </View>
              </View>
            </View>

            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Executive Alerts & Notifications</Text>
              <View style={styles.alertsContainer}>
                {budgets.some(b => (b.spent_amount / b.allocated_amount) > 0.9) && (
                  <View style={[styles.alertCard, { borderLeftColor: '#FF5722' }]}>
                    <View style={styles.alertIcon}>
                      <Ionicons name="warning" size={24} color="#FF5722" />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Budget Alert</Text>
                      <Text style={styles.alertText}>{budgets.filter(b => (b.spent_amount / b.allocated_amount) > 0.9).length} budget(s) exceeding 90% utilization</Text>
                      <Text style={styles.alertTime}>Real-time</Text>
                    </View>
                  </View>
                )}

                {getPendingApprovals() > 0 && (
                  <View style={[styles.alertCard, { borderLeftColor: '#FF9800' }]}>
                    <View style={styles.alertIcon}>
                      <Ionicons name="time" size={24} color="#FF9800" />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Pending Approvals</Text>
                      <Text style={styles.alertText}>{getPendingApprovals()} items awaiting approval</Text>
                      <Text style={styles.alertTime}>Real-time</Text>
                    </View>
                  </View>
                )}

                {incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length > 0 && (
                  <View style={[styles.alertCard, { borderLeftColor: '#F44336' }]}>
                    <View style={styles.alertIcon}>
                      <Ionicons name="alert-circle" size={24} color="#F44336" />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Open Safety Incidents</Text>
                      <Text style={styles.alertText}>{incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length} incident(s) require attention</Text>
                      <Text style={styles.alertTime}>Real-time</Text>
                    </View>
                  </View>
                )}

                {projects.filter(p => p.progress < 50 && p.status === 'active').length > 0 && (
                  <View style={[styles.alertCard, { borderLeftColor: '#2196F3' }]}>
                    <View style={styles.alertIcon}>
                      <Ionicons name="calendar" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Project Progress</Text>
                      <Text style={styles.alertText}>{projects.filter(p => p.progress < 50 && p.status === 'active').length} project(s) below 50% completion</Text>
                      <Text style={styles.alertTime}>Real-time</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Management Control Center */}
            <View style={styles.controlCenter}>
              <Text style={styles.sectionTitle}>🎛️ Management Control Center</Text>
              <View style={styles.controlGrid}>
                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E3F2FD' }]}
                  onPress={() => setActivePage('Project Management')}
                >
                  <View style={styles.controlIcon}>
                    <Ionicons name="briefcase" size={32} color="#1976D2" />
                  </View>
                  <Text style={styles.controlTitle}>Project Management</Text>
                  <Text style={styles.controlSubtitle}>{projects.length} active projects</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlMetricValue}>₹{(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M</Text>
                    <Text style={styles.controlMetricLabel}>Total Value</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#E8F5E8' }]}
                  onPress={() => setActivePage('User Management')}
                >
                  <View style={styles.controlIcon}>
                    <Ionicons name="people" size={32} color="#388E3C" />
                  </View>
                  <Text style={styles.controlTitle}>Workforce Management</Text>
                  <Text style={styles.controlSubtitle}>{users.length} total employees</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlMetricValue}>{users.filter(u => u.status === 'Active').length}</Text>
                    <Text style={styles.controlMetricLabel}>Active Users</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#FFF3E0' }]}
                  onPress={() => setActivePage('Budget & Finance')}
                >
                  <View style={styles.controlIcon}>
                    <Ionicons name="cash" size={32} color="#F57C00" />
                  </View>
                  <Text style={styles.controlTitle}>Financial Control</Text>
                  <Text style={styles.controlSubtitle}>Budget & Analytics</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlMetricValue}>{calculateBudgetEfficiency()}%</Text>
                    <Text style={styles.controlMetricLabel}>Budget Efficiency</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlCard, { backgroundColor: '#FCE4EC' }]}
                  onPress={() => setActivePage('Safety & Compliance')}
                >
                  <View style={styles.controlIcon}>
                    <Ionicons name="shield-checkmark" size={32} color="#C2185B" />
                  </View>
                  <Text style={styles.controlTitle}>Safety & Compliance</Text>
                  <Text style={styles.controlSubtitle}>Risk Management</Text>
                  <View style={styles.controlMetric}>
                    <Text style={styles.controlMetricValue}>{calculateComplianceRate()}%</Text>
                    <Text style={styles.controlMetricLabel}>Compliance Rate</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Access Tools */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.sectionTitle}>⚡ Quick Access Tools</Text>
              <View style={styles.quickAccessGrid}>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('Vendor Management')}>
                  <Ionicons name="business" size={24} color="#9C27B0" />
                  <Text style={styles.quickAccessText}>Vendors</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('Equipment Management')}>
                  <Ionicons name="build" size={24} color="#607D8B" />
                  <Text style={styles.quickAccessText}>Equipment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('Documents')}>
                  <Ionicons name="document-text" size={24} color="#795548" />
                  <Text style={styles.quickAccessText}>Documents</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('Reports & Analytics')}>
                  <Ionicons name="bar-chart" size={24} color="#FF5722" />
                  <Text style={styles.quickAccessText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('Task Management')}>
                  <Ionicons name="clipboard" size={24} color="#FF9800" />
                  <Text style={styles.quickAccessText}>Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessItem} onPress={() => setActivePage('System Settings')}>
                  <Ionicons name="settings" size={24} color="#666" />
                  <Text style={styles.quickAccessText}>Settings</Text>
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
          {activePage === "Dashboard" ? "Admin Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#999"
              value={userForm.name}
              onChangeText={(text) => setUserForm({...userForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#999"
              value={userForm.email}
              onChangeText={(text) => setUserForm({...userForm, email: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#999"
              value={userForm.phone}
              onChangeText={(text) => setUserForm({...userForm, phone: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              {['worker', 'foreman', 'site_engineer', 'project_manager'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, {
                    backgroundColor: userForm.role === role ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setUserForm({...userForm, role})}
                >
                  <Text style={[styles.roleText, {
                    color: userForm.role === role ? '#fff' : '#666'
                  }]}>{role.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={createUser}>
                <Text style={styles.submitButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Generation Modal */}
      <Modal animationType="slide" transparent={true} visible={reportModalVisible} onRequestClose={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Report</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Report Title *"
              placeholderTextColor="#999"
              value={reportForm.title}
              onChangeText={(text) => setReportForm({...reportForm, title: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Report Type:</Text>
              {['Progress', 'Financial', 'Safety', 'Quality'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.roleOption, {
                    backgroundColor: reportForm.type === type ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setReportForm({...reportForm, type})}
                >
                  <Text style={[styles.roleText, {
                    color: reportForm.type === type ? '#fff' : '#666'
                  }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Report Description *"
              placeholderTextColor="#999"
              value={reportForm.description}
              onChangeText={(text) => setReportForm({...reportForm, description: text})}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={generateReport}>
                <Text style={styles.submitButtonText}>Generate Report</Text>
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
                  <Text style={styles.metadataLabel}>Generated:</Text>
                  <Text style={styles.metadataValue}>{selectedReport?.date}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: selectedReport?.status === 'Generated' ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{selectedReport?.status}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Executive Summary</Text>
                <Text style={styles.reportContent}>
                  {selectedReport?.type === 'Progress' ? 
                    'Overall project portfolio performance shows strong momentum with 85% of active projects meeting or exceeding timeline expectations. Key achievements include successful completion of 3 major milestones and effective resource allocation across all departments.' :
                  selectedReport?.type === 'Financial' ?
                    'Q1 financial analysis reveals robust performance with total revenue of ₹2.4M, representing 8.5% growth over previous quarter. Budget adherence across projects averages 94% with controlled cost overruns in acceptable ranges.' :
                  selectedReport?.type === 'Safety' ?
                    'Safety compliance metrics demonstrate excellent performance with zero major incidents reported. All safety protocols are being followed with 98% compliance rate across all active construction sites.' :
                    'Quality assurance standards maintained at 96% compliance rate. Material quality inspections show consistent adherence to specifications with minimal rework requirements across all active projects.'
                  }
                </Text>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Key Metrics</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricNumber}>{projects.length}</Text>
                    <Text style={styles.metricLabel}>Total Projects</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricNumber}>{users.length}</Text>
                    <Text style={styles.metricLabel}>Active Users</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricNumber}>₹2.4M</Text>
                    <Text style={styles.metricLabel}>Revenue</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricNumber}>94%</Text>
                    <Text style={styles.metricLabel}>Completion Rate</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Recommendations</Text>
                <Text style={styles.reportContent}>
                  • Continue current project management strategies\n• Increase focus on cost optimization initiatives\n• Implement additional safety training programs\n• Expand quality control measures for new projects\n• Consider resource reallocation for Q2 planning
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.reportViewActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={16} color="#003366" />
                <Text style={styles.actionButtonText}>Export PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={16} color="#003366" />
                <Text style={styles.actionButtonText}>Share Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal animationType="slide" transparent={true} visible={editUserModalVisible} onRequestClose={() => setEditUserModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User - {selectedUser?.name}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#999"
              value={editUserForm.name}
              onChangeText={(text) => setEditUserForm({...editUserForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#999"
              value={editUserForm.email}
              onChangeText={(text) => setEditUserForm({...editUserForm, email: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#999"
              value={editUserForm.phone}
              onChangeText={(text) => setEditUserForm({...editUserForm, phone: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              {['worker', 'foreman', 'site_engineer', 'project_manager', 'safety_officer', 'quality_inspector'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, {
                    backgroundColor: editUserForm.role === role ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setEditUserForm({...editUserForm, role})}
                >
                  <Text style={[styles.roleText, {
                    color: editUserForm.role === role ? '#fff' : '#666'
                  }]}>{role.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditUserModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={updateUser}>
                <Text style={styles.submitButtonText}>Update User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal animationType="slide" transparent={true} visible={settingsModalVisible} onRequestClose={() => setSettingsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {settingsType === 'company' ? 'Company Information' :
               settingsType === 'notifications' ? 'Notification Settings' :
               settingsType === 'permissions' ? 'User Permissions' :
               settingsType === 'password' ? 'Password Policy' :
               settingsType === 'backup' ? 'Database Backup' :
               settingsType === 'updates' ? 'System Updates' : 'Settings'}
            </Text>
            
            <ScrollView style={styles.settingsModalContent}>
              {settingsType === 'company' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    placeholderTextColor="#999"
                    value={companyInfo.name}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, name: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    placeholderTextColor="#999"
                    value={companyInfo.address}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, address: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    placeholderTextColor="#999"
                    value={companyInfo.phone}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, phone: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={companyInfo.email}
                    onChangeText={(text) => setCompanyInfo({...companyInfo, email: text})}
                  />
                </>
              )}
              
              {settingsType === 'notifications' && (
                <View style={styles.settingsOptions}>
                  <TouchableOpacity 
                    style={styles.settingOption} 
                    onPress={() => setNotificationSettings({...notificationSettings, email: !notificationSettings.email})}
                  >
                    <Text style={styles.optionText}>Email Notifications</Text>
                    <View style={[styles.toggleButton, { backgroundColor: notificationSettings.email ? '#4CAF50' : '#ccc' }]}>
                      <Text style={styles.toggleText}>{notificationSettings.email ? 'ON' : 'OFF'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.settingOption} 
                    onPress={() => setNotificationSettings({...notificationSettings, push: !notificationSettings.push})}
                  >
                    <Text style={styles.optionText}>Push Notifications</Text>
                    <View style={[styles.toggleButton, { backgroundColor: notificationSettings.push ? '#4CAF50' : '#ccc' }]}>
                      <Text style={styles.toggleText}>{notificationSettings.push ? 'ON' : 'OFF'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.settingOption} 
                    onPress={() => setNotificationSettings({...notificationSettings, sms: !notificationSettings.sms})}
                  >
                    <Text style={styles.optionText}>SMS Alerts</Text>
                    <View style={[styles.toggleButton, { backgroundColor: notificationSettings.sms ? '#4CAF50' : '#ccc' }]}>
                      <Text style={styles.toggleText}>{notificationSettings.sms ? 'ON' : 'OFF'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              
              {settingsType === 'permissions' && (
                <View style={styles.settingsOptions}>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Admin Access</Text>
                    <Text style={styles.optionStatus}>Full Control</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Project Manager</Text>
                    <Text style={styles.optionStatus}>Project Level</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Site Engineer</Text>
                    <Text style={styles.optionStatus}>Technical Access</Text>
                  </View>
                </View>
              )}
              
              {settingsType === 'password' && (
                <View style={styles.settingsOptions}>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Minimum Length</Text>
                    <Text style={styles.optionStatus}>8 characters</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Require Special Characters</Text>
                    <Text style={styles.optionStatus}>Yes</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Password Expiry</Text>
                    <Text style={styles.optionStatus}>90 days</Text>
                  </View>
                </View>
              )}
              
              {settingsType === 'backup' && (
                <View style={styles.settingsOptions}>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Last Backup</Text>
                    <Text style={styles.optionStatus}>2024-01-12 03:00 AM</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Backup Frequency</Text>
                    <Text style={styles.optionStatus}>Daily</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Storage Location</Text>
                    <Text style={styles.optionStatus}>AWS S3</Text>
                  </View>
                </View>
              )}
              
              {settingsType === 'updates' && (
                <View style={styles.settingsOptions}>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Current Version</Text>
                    <Text style={styles.optionStatus}>v2.1.3</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Last Update</Text>
                    <Text style={styles.optionStatus}>2024-01-10</Text>
                  </View>
                  <View style={styles.settingOption}>
                    <Text style={styles.optionText}>Auto Updates</Text>
                    <Text style={styles.optionStatus}>Enabled</Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSettingsAction}>
                <Text style={styles.submitButtonText}>
                  {settingsType === 'backup' ? 'Start Backup' :
                   settingsType === 'updates' ? 'Check Updates' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Incident Modal */}
      <Modal animationType="slide" transparent={true} visible={incidentModalVisible} onRequestClose={() => setIncidentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Safety Incident</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Incident Title *"
              placeholderTextColor="#999"
              value={incidentForm.title}
              onChangeText={(text) => setIncidentForm({...incidentForm, title: text})}
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Project:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectSelector}>
                {projects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.roleOption, {
                      backgroundColor: incidentForm.project === project.id ? '#003366' : '#f5f5f5'
                    }]}
                    onPress={() => setIncidentForm({...incidentForm, project: project.id})}
                  >
                    <Text style={[styles.roleText, {
                      color: incidentForm.project === project.id ? '#fff' : '#666'
                    }]}>{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Severity:</Text>
              {['minor', 'moderate', 'major', 'critical'].map(severity => (
                <TouchableOpacity
                  key={severity}
                  style={[styles.roleOption, {
                    backgroundColor: incidentForm.severity === severity ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setIncidentForm({...incidentForm, severity})}
                >
                  <Text style={[styles.roleText, {
                    color: incidentForm.severity === severity ? '#fff' : '#666'
                  }]}>{severity.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Location Details *"
              placeholderTextColor="#999"
              value={incidentForm.location_details}
              onChangeText={(text) => setIncidentForm({...incidentForm, location_details: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Injured Person (if any)"
              placeholderTextColor="#999"
              value={incidentForm.injured_person}
              onChangeText={(text) => setIncidentForm({...incidentForm, injured_person: text})}
            />
            
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Incident Description *"
              placeholderTextColor="#999"
              value={incidentForm.description}
              onChangeText={(text) => setIncidentForm({...incidentForm, description: text})}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIncidentModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={reportIncident}>
                <Text style={styles.submitButtonText}>Report Incident</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Vendor Modal */}
      <Modal animationType="slide" transparent={true} visible={vendorModalVisible} onRequestClose={() => setVendorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.vendorModalContainer}>
            <Text style={styles.modalTitle}>Add New Vendor</Text>
            <ScrollView style={styles.vendorScrollView}>
              <TextInput
                style={styles.input}
                placeholder="Vendor Name *"
                placeholderTextColor="#999"
                value={vendorForm.name}
                onChangeText={(text) => setVendorForm({...vendorForm, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Vendor Code (e.g., VEN001)"
                placeholderTextColor="#999"
                value={vendorForm.vendor_code}
                onChangeText={(text) => setVendorForm({...vendorForm, vendor_code: text})}
              />
              
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Vendor Type:</Text>
                {['supplier', 'equipment_rental', 'subcontractor', 'consultant'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.roleOption, {
                      backgroundColor: vendorForm.vendor_type === type ? '#003366' : '#f5f5f5'
                    }]}
                    onPress={() => setVendorForm({...vendorForm, vendor_type: type})}
                  >
                    <Text style={[styles.roleText, {
                      color: vendorForm.vendor_type === type ? '#fff' : '#666'
                    }]}>{type.replace('_', ' ')}</Text>
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
                placeholder="Phone *"
                placeholderTextColor="#999"
                value={vendorForm.phone}
                onChangeText={(text) => setVendorForm({...vendorForm, phone: text})}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#999"
                value={vendorForm.address}
                onChangeText={(text) => setVendorForm({...vendorForm, address: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Tax ID"
                placeholderTextColor="#999"
                value={vendorForm.tax_id}
                onChangeText={(text) => setVendorForm({...vendorForm, tax_id: text})}
              />
              
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setVendorModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={createVendor}>
                <Text style={styles.submitButtonText}>Create Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Vendor Details Modal */}
      <Modal animationType="slide" transparent={true} visible={viewVendorModalVisible} onRequestClose={() => setViewVendorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.reportViewHeader}>
              <Text style={styles.modalTitle}>{selectedVendor?.name}</Text>
              <TouchableOpacity onPress={() => setViewVendorModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reportViewContent}>
              <View style={styles.reportMetadata}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Vendor Code:</Text>
                  <Text style={styles.metadataValue}>{selectedVendor?.vendor_code || 'N/A'}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Type:</Text>
                  <Text style={styles.metadataValue}>{selectedVendor?.vendor_type?.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: selectedVendor?.is_approved ? '#4CAF50' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{selectedVendor?.is_approved ? 'Approved' : 'Pending'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Contact Information</Text>
                <View style={styles.reportMetadata}>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Contact Person:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.contact_person || 'N/A'}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Email:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.email}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Phone:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.phone}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Address:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.address || 'N/A'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.sectionHeader}>Business Details</Text>
                <View style={styles.reportMetadata}>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Tax ID:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.tax_id || 'N/A'}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Rating:</Text>
                    <Text style={styles.metadataValue}>{selectedVendor?.rating ? `${selectedVendor.rating}/5.0` : 'N/A'}</Text>
                  </View>
                </View>
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

      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'A'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Admin'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Administrator'}</Text>
          </View>
        </View>
        
        <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.menuDivider} />
          
          {[
            { title: "Dashboard", icon: "home" },
            { title: "Project Management", icon: "briefcase" },
            { title: "User Management", icon: "people" },
            { title: "Task Management", icon: "clipboard" },
            { title: "Attendance Tracking", icon: "time" },
            { title: "Vendor Management", icon: "business" },
            { title: "Material Requests", icon: "cube" },
            { title: "Purchase Orders", icon: "cart" },
            { title: "Invoice Management", icon: "receipt" },
            { title: "Budget & Finance", icon: "cash" },
            { title: "Equipment Management", icon: "build" },
            { title: "Documents", icon: "document-text" },
            { title: "Safety & Compliance", icon: "shield-checkmark" },
            { title: "Communication Center", icon: "chatbubbles" },
            { title: "Reports & Analytics", icon: "bar-chart" },
            { title: "System Settings", icon: "settings" }
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
  
  // Executive Header Styles
  executiveHeader: {
    backgroundColor: "linear-gradient(135deg, #003366 0%, #004080 100%)",
    backgroundColor: "#003366",
    paddingTop: 20,
    paddingBottom: 25,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  executiveWelcome: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  executiveSubtitle: {
    fontSize: 16,
    color: "#B3D9FF",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: "#80BFFF",
    fontWeight: "600",
  },
  dateTimeCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 100,
  },
  currentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  currentTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B3D9FF",
  },
  headerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  headerStat: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 15,
    minWidth: 90,
  },
  headerStatNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 11,
    color: "#B3D9FF",
    textAlign: "center",
  },

  // KPI Section Styles
  kpiSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  kpiTrend: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kpiTrendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  kpiNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#003366",
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 12,
    color: "#999",
    lineHeight: 16,
  },

  // Enhanced Alerts Section
  alertsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 5,
    elevation: 3,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    borderLeftWidth: 4,
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 11,
    color: "#999",
  },
  alertAction: {
    padding: 8,
  },

  // Control Center Styles
  controlCenter: {
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
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlIcon: {
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 6,
  },
  controlSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  controlMetric: {
    alignItems: "flex-start",
  },
  controlMetricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#003366",
  },
  controlMetricLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  // Quick Access Styles
  quickAccessSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  quickAccessItem: {
    alignItems: "center",
    width: "30%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003366",
    marginTop: 8,
    textAlign: "center",
  },

  // Legacy styles (keeping for compatibility)
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
  
  alertsSection: { paddingHorizontal: 20, marginBottom: 25 },
  
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
  
  userCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  userHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  userName: { fontSize: 16, fontWeight: "600", color: "#003366" },
  userEmail: { fontSize: 14, color: "#666", marginBottom: 8 },
  userDetails: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  userRole: { fontSize: 12, color: "#003366", fontWeight: "500" },
  userLastLogin: { fontSize: 12, color: "#666" },
  userActions: { flexDirection: "row", justifyContent: "space-around" },
  actionBtn: { backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: "#F44336" },
  actionBtnText: { color: "#fff", fontSize: 12 },
  
  projectCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  projectName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  projectStats: { flexDirection: "row", justifyContent: "space-around" },
  projectStat: { alignItems: "center" },
  statLabel: { fontSize: 10, color: "#666" },
  statValue: { fontSize: 12, fontWeight: "600", color: "#003366", marginTop: 2 },
  
  reportCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  reportTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  reportDetails: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  reportType: { fontSize: 12, color: "#666" },
  reportDate: { fontSize: 12, color: "#666" },
  
  vendorCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  vendorType: { fontSize: 12, color: "#666", marginBottom: 10 },
  vendorActions: { flexDirection: "row", justifyContent: "space-around" },
  
  managementCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginHorizontal: 20, marginBottom: 15, elevation: 2, alignItems: "center" },
  managementTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 8 },
  managementDescription: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 15, lineHeight: 20 },
  managementButton: { backgroundColor: "#003366", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  managementButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  
  statusBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  viewButton: { alignSelf: "flex-start", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
  },
  vendorModalContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: width * 0.9, maxHeight: "85%" },
  vendorScrollView: { maxHeight: 450 },
  
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
  
  roleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, flexWrap: "wrap" },
  roleLabel: { fontSize: 14, color: "#666", marginRight: 10, width: "100%", marginBottom: 5 },
  roleOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  roleText: { fontSize: 12 },
  
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  modalButton: { flex: 0.48, borderRadius: 8, padding: 12, alignItems: "center" },
  cancelButton: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#ddd" },
  cancelButtonText: { color: "#666", fontSize: 14 },
  submitButton: { backgroundColor: "#003366" },
  submitButtonText: { color: "#fff", fontSize: 14 },
  
  sideMenu: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: "#fff", paddingTop: 50, elevation: 8, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10 },
  menuScrollView: { flex: 1 },
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
  
  // Settings styles
  settingsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  settingsText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
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
  metricItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    margin: 5,
    flex: 1,
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
  
  // Settings modal styles
  settingsModalContent: {
    maxHeight: 300,
  },
  settingsOptions: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
  },
  settingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  optionStatus: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: "center",
  },
  toggleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  
  // Project selector styles
  projectSelector: {
    maxHeight: 40,
    marginTop: 5,
  },
  
  // Safety & Compliance styles
  safetyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  safetyStatCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    width: '30%',
    height: 85,
  },
  safetyStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
  },
  safetyStatLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
    numberOfLines: 2,
  },
  incidentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  incidentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  incidentId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  incidentDesc: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  incidentDate: {
    fontSize: 12,
    color: "#666",
  },
  complianceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  complianceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  complianceText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
});