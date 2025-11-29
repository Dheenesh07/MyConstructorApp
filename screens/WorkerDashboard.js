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
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskAPI, attendanceAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function WorkerDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [training, setTraining] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadTasks();
    loadAttendance();
    loadTraining();
    loadInstructions();
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
      const response = await taskAPI.getByUser(user?.id);
      setTasks(response.data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        location: task.location || 'Not specified'
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([
        { id: 1, title: 'Concrete Pouring - Foundation', description: 'Pour concrete for foundation section A1-A5', priority: 'high', status: 'in_progress', dueDate: '2024-01-15', location: 'Site A - North' }
      ]);
    }
  };

  const loadAttendance = () => {
    setAttendance({
      today: { status: 'Present', checkIn: '07:30', checkOut: null, hours: 0 },
      thisWeek: { totalHours: 32, daysPresent: 4, daysAbsent: 0 },
      thisMonth: { totalHours: 168, daysPresent: 21, daysAbsent: 1 }
    });
  };

  const loadTraining = () => {
    setTraining([
      { id: 1, title: 'Basic Safety Training', status: 'Completed', completedDate: '2024-01-08', certificate: true, validUntil: '2025-01-08' },
      { id: 2, title: 'Concrete Handling Safety', status: 'In Progress', progress: 75, dueDate: '2024-01-20' },
      { id: 3, title: 'Equipment Operation Safety', status: 'Not Started', dueDate: '2024-01-25' },
      { id: 4, title: 'First Aid Training', status: 'Completed', completedDate: '2024-01-05', certificate: true, validUntil: '2025-01-05' }
    ]);
  };

  const loadInstructions = () => {
    setInstructions([
      { id: 1, title: 'Daily Safety Briefing', type: 'Safety', date: '2024-01-12', content: 'Today\'s focus: PPE compliance and concrete pouring safety procedures.' },
      { id: 2, title: 'New Concrete Mix Procedure', type: 'Technical', date: '2024-01-11', content: 'Updated mixing ratios and curing procedures for foundation concrete.' },
      { id: 3, title: 'Site Access Changes', type: 'General', date: '2024-01-10', content: 'New entry point through Gate B. Gate A closed for maintenance.' },
      { id: 4, title: 'Weather Alert', type: 'Safety', date: '2024-01-09', content: 'Heavy rain expected. All outdoor concrete work postponed.' }
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

  const markAttendance = async (type) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    try {
      if (type === 'checkIn') {
        const response = await attendanceAPI.checkIn({
          user: user.id,
          project: 1, // Default project - should be dynamic
          check_in: new Date().toISOString()
        });
        setAttendance(prev => ({
          ...prev,
          today: { ...prev.today, checkIn: currentTime, status: 'Present', attendanceId: response.data.id }
        }));
        Alert.alert('Success', `Checked in at ${currentTime}`);
      } else {
        if (attendance.today.attendanceId) {
          await attendanceAPI.checkOut(attendance.today.attendanceId);
        }
        const checkInTime = attendance.today.checkIn;
        const hoursWorked = calculateHours(checkInTime, currentTime);
        setAttendance(prev => ({
          ...prev,
          today: { ...prev.today, checkOut: currentTime, hours: hoursWorked }
        }));
        Alert.alert('Success', `Checked out at ${currentTime}. Hours worked: ${hoursWorked}`);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    return ((outMinutes - inMinutes) / 60).toFixed(1);
  };

  const renderContent = () => {
    switch (activePage) {
      case "My Tasks":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📋 My Tasks</Text>
              <Text style={styles.taskCount}>{tasks.length} Tasks</Text>
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
                </View>
                
                <View style={styles.taskActions}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: task.status === 'Completed' ? '#4CAF50' : 
                                   task.status === 'In Progress' ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                  {task.status !== 'Completed' && (
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Instructions</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Attendance":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>⏰ Attendance</Text>
            </View>
            
            <View style={styles.attendanceCard}>
              <Text style={styles.attendanceTitle}>Today's Attendance</Text>
              <View style={styles.attendanceToday}>
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: attendance?.today.status === 'Present' ? '#4CAF50' : '#F44336'
                  }]}>
                    <Text style={styles.statusText}>{attendance?.today.status || 'Absent'}</Text>
                  </View>
                </View>
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Check In:</Text>
                  <Text style={styles.attendanceValue}>{attendance?.today.checkIn || 'Not checked in'}</Text>
                </View>
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Check Out:</Text>
                  <Text style={styles.attendanceValue}>{attendance?.today.checkOut || 'Not checked out'}</Text>
                </View>
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Hours:</Text>
                  <Text style={styles.attendanceValue}>{attendance?.today.hours || 0}h</Text>
                </View>
              </View>
              
              <View style={styles.attendanceActions}>
                {!attendance?.today.checkIn && (
                  <TouchableOpacity style={styles.checkInButton} onPress={() => markAttendance('checkIn')}>
                    <Ionicons name="log-in-outline" size={20} color="#fff" />
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  </TouchableOpacity>
                )}
                {attendance?.today.checkIn && !attendance?.today.checkOut && (
                  <TouchableOpacity style={styles.checkOutButton} onPress={() => markAttendance('checkOut')}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.checkOutButtonText}>Check Out</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.attendanceSummary}>
              <Text style={styles.summaryTitle}>This Week</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{attendance?.thisWeek.totalHours}h</Text>
                  <Text style={styles.summaryLabel}>Total Hours</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{attendance?.thisWeek.daysPresent}</Text>
                  <Text style={styles.summaryLabel}>Days Present</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{attendance?.thisWeek.daysAbsent}</Text>
                  <Text style={styles.summaryLabel}>Days Absent</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case "Safety Training":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🎓 Safety Training</Text>
            </View>
            
            {training.map(course => (
              <View key={course.id} style={styles.trainingCard}>
                <View style={styles.trainingHeader}>
                  <Text style={styles.trainingTitle}>{course.title}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: course.status === 'Completed' ? '#4CAF50' : 
                                   course.status === 'In Progress' ? '#FF9800' : '#9E9E9E'
                  }]}>
                    <Text style={styles.statusText}>{course.status}</Text>
                  </View>
                </View>
                
                {course.status === 'In Progress' && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Progress: {course.progress}%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                    </View>
                  </View>
                )}
                
                <View style={styles.trainingDetails}>
                  {course.completedDate && (
                    <View style={styles.trainingDetailRow}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                      <Text style={styles.trainingDetailText}>Completed: {course.completedDate}</Text>
                    </View>
                  )}
                  {course.dueDate && (
                    <View style={styles.trainingDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.trainingDetailText}>Due: {course.dueDate}</Text>
                    </View>
                  )}
                  {course.validUntil && (
                    <View style={styles.trainingDetailRow}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.trainingDetailText}>Valid until: {course.validUntil}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.trainingActions}>
                  {course.certificate && (
                    <TouchableOpacity style={styles.certificateButton}>
                      <Ionicons name="document-outline" size={16} color="#003366" />
                      <Text style={styles.certificateButtonText}>View Certificate</Text>
                    </TouchableOpacity>
                  )}
                  {course.status === 'In Progress' && (
                    <TouchableOpacity style={styles.continueButton}>
                      <Text style={styles.continueButtonText}>Continue Training</Text>
                    </TouchableOpacity>
                  )}
                  {course.status === 'Not Started' && (
                    <TouchableOpacity style={styles.startButton}>
                      <Text style={styles.startButtonText}>Start Training</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case "Work Instructions":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>📖 Work Instructions</Text>
            </View>
            
            {instructions.map(instruction => (
              <View key={instruction.id} style={styles.instructionCard}>
                <View style={styles.instructionHeader}>
                  <Text style={styles.instructionTitle}>{instruction.title}</Text>
                  <View style={[styles.typeBadge, { 
                    backgroundColor: instruction.type === 'Safety' ? '#F44336' : 
                                   instruction.type === 'Technical' ? '#2196F3' : '#FF9800'
                  }]}>
                    <Text style={styles.statusText}>{instruction.type}</Text>
                  </View>
                </View>
                
                <Text style={styles.instructionContent}>{instruction.content}</Text>
                
                <View style={styles.instructionFooter}>
                  <View style={styles.instructionDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.instructionDetailText}>{instruction.date}</Text>
                  </View>
                  <TouchableOpacity style={styles.readButton}>
                    <Text style={styles.readButtonText}>Mark as Read</Text>
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
          <ScrollView style={styles.fullContainer}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.welcome}>👷 Good morning, {user?.username || 'Worker'}!</Text>
              <Text style={styles.subtitle}>Beemji Construction - Worker Portal</Text>
              <Text style={styles.dateTime}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Shift: 7:00 AM - 4:00 PM</Text>
            </View>
            
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>🚨 Today's Priorities</Text>
              <View style={styles.alertCard}>
                <Ionicons name="hammer" size={20} color="#FF5722" />
                <Text style={styles.alertText}>High Priority: Complete concrete pouring - Block A foundation</Text>
              </View>
              <View style={styles.alertCard}>
                <Ionicons name="shield-checkmark" size={20} color="#FF9800" />
                <Text style={styles.alertText}>Safety briefing at 8:00 AM - Mandatory attendance</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'In Progress').length}</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{attendance?.thisWeek.totalHours || 0}h</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{training.filter(t => t.status === 'Completed').length}</Text>
                <Text style={styles.statLabel}>Training Complete</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <FlatList
              data={[
                { title: "📋 My Tasks", count: `${tasks.length} tasks` },
                { title: "⏰ Attendance", count: attendance?.today.status || 'Check status' },
                { title: "🎓 Safety Training", count: `${training.length} courses` },
                { title: "📖 Work Instructions", count: `${instructions.length} updates` },
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
          {activePage === "Dashboard" ? "Worker Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>

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

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'W'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Worker'}</Text>
            <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase() || 'Worker'}</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />
        
        {[
          { title: "Dashboard", icon: "home" },
          { title: "My Tasks", icon: "clipboard" },
          { title: "Attendance", icon: "time" },
          { title: "Safety Training", icon: "school" },
          { title: "Work Instructions", icon: "document-text" }
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
      
      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
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
  dateTime: { fontSize: 14, color: "#999", marginTop: 4, textAlign: "center" },
  
  alertsSection: { paddingHorizontal: 20, marginBottom: 20 },
  alertCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1, borderLeftWidth: 4, borderLeftColor: "#FF5722" },
  alertText: { marginLeft: 10, fontSize: 13, color: "#333", flex: 1 },
  
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
  taskCount: { fontSize: 14, color: "#666" },
  pageContainer: { padding: 20, alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 25, paddingHorizontal: 15, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  
  taskCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  taskDescription: { fontSize: 14, color: "#666", marginBottom: 10 },
  taskDetails: { marginBottom: 15 },
  taskDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  taskDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  taskActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  attendanceCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginHorizontal: 20, marginBottom: 20, elevation: 2 },
  attendanceTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 15 },
  attendanceToday: { marginBottom: 20 },
  attendanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  attendanceLabel: { fontSize: 14, color: "#666" },
  attendanceValue: { fontSize: 14, fontWeight: "600", color: "#003366" },
  attendanceActions: { alignItems: "center" },
  checkInButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#4CAF50", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  checkInButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  checkOutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F44336", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  checkOutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  
  attendanceSummary: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginHorizontal: 20, elevation: 2 },
  summaryTitle: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 15 },
  summaryStats: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },
  summaryNumber: { fontSize: 20, fontWeight: "bold", color: "#003366" },
  summaryLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  
  trainingCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  trainingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  trainingTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  progressContainer: { marginBottom: 15 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  trainingDetails: { marginBottom: 15 },
  trainingDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  trainingDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  trainingActions: { flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" },
  certificateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginBottom: 5 },
  certificateButtonText: { color: "#003366", fontSize: 12, marginLeft: 4 },
  continueButton: { backgroundColor: "#FF9800", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, marginBottom: 5 },
  continueButtonText: { color: "#fff", fontSize: 12 },
  startButton: { backgroundColor: "#4CAF50", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, marginBottom: 5 },
  startButtonText: { color: "#fff", fontSize: 12 },
  
  instructionCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  instructionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  instructionTitle: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  instructionContent: { fontSize: 14, color: "#666", marginBottom: 15, lineHeight: 20 },
  instructionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  instructionDetailRow: { flexDirection: "row", alignItems: "center" },
  instructionDetailText: { fontSize: 12, color: "#666", marginLeft: 6 },
  readButton: { backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  readButtonText: { color: "#fff", fontSize: 12 },
  
  statusBadge: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  viewButton: { alignSelf: "flex-start", backgroundColor: "#003366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  
  sideMenu: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: "#fff", paddingTop: 50, elevation: 8, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, zIndex: 2 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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