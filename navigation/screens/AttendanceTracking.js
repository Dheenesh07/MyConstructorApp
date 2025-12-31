import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { attendanceAPI, projectAPI } from '../../utils/api';

export default function AttendanceTracking() {
  const [user, setUser] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

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
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const currentUser = JSON.parse(userData);
        const userId = currentUser.id || currentUser.user_id;
        
        let response;
        if (currentUser.role === 'admin') {
          // Admin sees all attendances
          response = await attendanceAPI.getAll();
        } else {
          // Other users see only their own
          response = await attendanceAPI.getByUser(userId);
        }
        
        setAttendances(response.data || []);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = (response.data || []).find(att => 
          att.date === today && att.check_in_time && !att.check_out_time &&
          (currentUser.role === 'admin' ? true : att.user === userId)
        );
        setTodayAttendance(todayRecord);
      }
    } catch (error) {
      console.error('Error loading attendances:', error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for attendance tracking.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not fetch your location. Please enable location services.');
      return null;
    }
  };

  const handleCheckIn = async () => {
    if (todayAttendance) {
      Alert.alert('Already Checked In', 'You have already checked in today.');
      return;
    }

    if (!projects.length) {
      Alert.alert('Error', 'No projects available. Please contact admin.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    const location = await getCurrentLocation();
    if (!location) return;

    setCurrentLocation(location);
    setMapModalVisible(true);
  };

  const confirmCheckIn = async () => {
    const now = new Date();
    const checkInData = {
      user: user.id || user.user_id,
      project: projects[0].id,
      check_in_time: now.toTimeString().split(' ')[0],
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };

    try {
      await attendanceAPI.checkIn(checkInData);
      Alert.alert('Success', `Checked in at ${checkInData.check_in_time}`);
      setMapModalVisible(false);
      loadAttendances();
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        Alert.alert(
          'Already Checked In', 
          'You can only check in once per day. Please check out first if you need to update your attendance.',
          [
            { text: 'OK' },
            { 
              text: 'Send Reminder', 
              onPress: () => Alert.alert('Reminder Sent', 'A reminder to check out has been sent to admin.')
            }
          ]
        );
      } else {
        Alert.alert('Error', `Failed to check in: ${error.response?.data?.detail || error.message}`);
      }
      setMapModalVisible(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      Alert.alert('Error', 'No active check-in found. Please check in first.');
      return;
    }

    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];
    
    const checkInParts = todayAttendance.check_in_time.split(':');
    const checkOutParts = checkOutTime.split(':');
    const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
    const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1]);
    const hoursWorked = (checkOutMinutes - checkInMinutes) / 60;
    const overtimeHours = Math.max(0, hoursWorked - 8);

    const checkOutData = {
      check_out_time: checkOutTime,
      hours_worked: parseFloat(hoursWorked.toFixed(2)),
      overtime_hours: parseFloat(overtimeHours.toFixed(2))
    };

    try {
      await attendanceAPI.checkOut(todayAttendance.id, checkOutData);
      Alert.alert('Success', `Checked out at ${checkOutTime}\nHours worked: ${hoursWorked.toFixed(2)}h`);
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
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          
          {todayAttendance ? (
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.statusText}>Checked In at {todayAttendance.check_in_time}</Text>
              </View>
              
              {todayAttendance.latitude && todayAttendance.longitude && (
                <View style={styles.mapPreviewContainer}>
                  <MapView
                    style={styles.mapPreview}
                    initialRegion={{
                      latitude: todayAttendance.latitude,
                      longitude: todayAttendance.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: todayAttendance.latitude,
                        longitude: todayAttendance.longitude,
                      }}
                      title="Check-in Location"
                    />
                  </MapView>
                  <Text style={styles.mapPreviewLabel}>
                    📍 {todayAttendance.latitude.toFixed(6)}, {todayAttendance.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
              
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

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'admin' ? 'All Members Attendance' : 'Attendance History'}
          </Text>
          {attendances.length > 0 ? (
            attendances.map((attendance) => (
              <View key={attendance.id} style={styles.attendanceCard}>
                <View style={styles.attendanceHeader}>
                  <View>
                    <Text style={styles.attendanceDate}>
                      {attendance.date || 'N/A'}
                    </Text>
                    {user?.role === 'admin' && (
                      <Text style={styles.userName}>
                        {attendance.user_name || `User ${attendance.user}`}
                      </Text>
                    )}
                  </View>
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

      <Modal visible={mapModalVisible} animationType="slide" transparent={true}>
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalContent}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>📍 Confirm Location</Text>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {currentLocation && (
              <>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                >
                  <Marker
                    coordinate={currentLocation}
                    title="Your Location"
                    description="Check-in location"
                  />
                </MapView>

                <View style={styles.locationInfo}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={20} color="#004AAD" />
                    <Text style={styles.locationText}>
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <Text style={styles.locationNote}>Verify this is your location</Text>
                </View>

                <View style={styles.mapModalActions}>
                  <TouchableOpacity style={styles.mapCancelButton} onPress={() => setMapModalVisible(false)}>
                    <Text style={styles.mapCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mapConfirmButton} onPress={confirmCheckIn}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.mapConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  userName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
  },
  map: {
    width: '100%',
    height: 300,
  },
  locationInfo: {
    padding: 15,
    backgroundColor: '#f5f9fc',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#003366',
    marginLeft: 8,
    fontWeight: '500',
  },
  locationNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  mapModalActions: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  mapCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  mapConfirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  mapConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapPreviewContainer: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapPreview: {
    width: '100%',
    height: 150,
  },
  mapPreviewLabel: {
    fontSize: 12,
    color: '#666',
    padding: 8,
    backgroundColor: '#f5f9fc',
    textAlign: 'center',
  },
});