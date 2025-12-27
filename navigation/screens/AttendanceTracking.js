import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceAPI, projectAPI } from '../../utils/api';

export default function AttendanceTracking() {
  const [user, setUser] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    loadUserData();
    loadProjects();
    loadAttendances();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAttendances = async () => {
    setLoading(true);
    try {
      // Debug: Check token before API call
      const token = await AsyncStorage.getItem('access');
      console.log('Token before attendance API call:', token ? 'EXISTS' : 'MISSING');
      
      const response = await attendanceAPI.getAll();
      console.log('Attendance response:', response.data);
      setAttendances(response.data);
      
      // Check if there's a check-in today without check-out
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = response.data.find(att => 
        att.check_in_time?.startsWith(today) && !att.check_out_time
      );
      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error('Error loading attendances:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Don't show error alert, just use empty data
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    // Mock location - in production, use expo-location
    return {
      latitude: 40.7128,
      longitude: -74.0060
    };
  };

  const handleCheckIn = async () => {
    if (!projects.length) {
      Alert.alert('Error', 'No projects available. Please contact admin.');
      return;
    }

    const location = getCurrentLocation();
    const checkInData = {
      project: projects[0].id, // Use first project or let user select
      check_in_time: new Date().toTimeString().split(' ')[0], // HH:MM:SS
      latitude: location.latitude,
      longitude: location.longitude,
      notes: 'Check-in via mobile app'
    };

    try {
      console.log('Check-in data:', checkInData);
      const response = await attendanceAPI.checkIn(checkInData);
      console.log('Check-in response:', response.data);
      Alert.alert('Success', 'Checked in successfully!');
      loadAttendances();
    } catch (error) {
      console.error('Check-in error:', error.response?.data || error);
      Alert.alert('Error', `Failed to check in: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      Alert.alert('Error', 'No active check-in found');
      return;
    }

    const checkInTime = new Date(`1970-01-01T${todayAttendance.check_in_time}`);
    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, hoursWorked - 8);

    const checkOutData = {
      check_out_time: checkOutTime.toTimeString().split(' ')[0],
      hours_worked: parseFloat(hoursWorked.toFixed(2)),
      overtime_hours: parseFloat(overtimeHours.toFixed(2))
    };

    try {
      console.log('Check-out data:', checkOutData);
      const response = await attendanceAPI.checkOut(todayAttendance.id, checkOutData);
      console.log('Check-out response:', response.data);
      Alert.alert('Success', `Checked out successfully! Hours worked: ${hoursWorked.toFixed(2)}`);
      loadAttendances();
    } catch (error) {
      console.error('Check-out error:', error.response?.data || error);
      Alert.alert('Error', `Failed to check out: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="time" size={24} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.title}>Attendance Tracking</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAttendances} />
        }
      >
        {/* Check-in/Check-out Card */}
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          
          {todayAttendance ? (
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.statusText}>Checked In at {todayAttendance.check_in_time}</Text>
              </View>
              <TouchableOpacity style={styles.checkOutButton} onPress={handleCheckOut}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Check In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attendance History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          {attendances.length > 0 ? (
            attendances.map((attendance) => (
              <View key={attendance.id} style={styles.attendanceCard}>
                <View style={styles.attendanceHeader}>
                  <Text style={styles.attendanceDate}>
                    {attendance.check_in_time ? new Date(attendance.check_in_time).toLocaleDateString() : 'N/A'}
                  </Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: attendance.check_out_time ? '#4CAF50' : '#FF9800' 
                  }]}>
                    <Text style={styles.statusBadgeText}>
                      {attendance.check_out_time ? 'Complete' : 'In Progress'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.attendanceDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      In: {attendance.check_in_time || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Out: {attendance.check_out_time || 'Not checked out'}
                    </Text>
                  </View>
                  {attendance.hours_worked && (
                    <View style={styles.detailRow}>
                      <Ionicons name="hourglass-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Hours: {attendance.hours_worked}h
                        {attendance.overtime_hours > 0 && ` (OT: ${attendance.overtime_hours}h)`}
                      </Text>
                    </View>
                  )}
                  {attendance.notes && (
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>{attendance.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9fc',
  },
  header: {
    backgroundColor: '#003366',
    padding: 20,
    paddingTop: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 10,
    fontWeight: '500',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  checkOutButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 15,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  attendanceDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
