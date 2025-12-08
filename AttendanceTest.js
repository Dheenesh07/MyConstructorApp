import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { attendanceAPI } from './utils/api';

export default function AttendanceTest() {
  const [results, setResults] = useState('');
  const [projectId, setProjectId] = useState('1');
  const [attendanceId, setAttendanceId] = useState('');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => `[${timestamp}] ${message}\n\n${prev}`);
  };

  const testGetAll = async () => {
    try {
      addLog('🔍 Testing GET all attendance...');
      const response = await attendanceAPI.getAll();
      addLog(`✅ SUCCESS: Got ${response.data.length} records\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      addLog(`❌ ERROR: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const testCheckIn = async () => {
    try {
      addLog('🔍 Testing POST check-in...');
      const data = {
        project: parseInt(projectId),
        check_in_time: new Date().toTimeString().split(' ')[0],
        latitude: 40.7128,
        longitude: -74.0060,
        notes: 'Test check-in from app'
      };
      addLog(`📤 Sending: ${JSON.stringify(data, null, 2)}`);
      const response = await attendanceAPI.checkIn(data);
      addLog(`✅ SUCCESS: Checked in!\n${JSON.stringify(response.data, null, 2)}`);
      setAttendanceId(response.data.id?.toString() || '');
    } catch (error) {
      addLog(`❌ ERROR: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const testCheckOut = async () => {
    if (!attendanceId) {
      addLog('❌ ERROR: Please enter attendance ID');
      return;
    }
    try {
      addLog(`🔍 Testing PATCH check-out for ID: ${attendanceId}...`);
      const data = {
        check_out_time: new Date().toTimeString().split(' ')[0],
        hours_worked: 8.5,
        overtime_hours: 0.5
      };
      addLog(`📤 Sending: ${JSON.stringify(data, null, 2)}`);
      const response = await attendanceAPI.checkOut(parseInt(attendanceId), data);
      addLog(`✅ SUCCESS: Checked out!\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      addLog(`❌ ERROR: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Attendance API Test</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Project ID:</Text>
        <TextInput
          style={styles.input}
          value={projectId}
          onChangeText={setProjectId}
          keyboardType="numeric"
          placeholder="Enter project ID"
        />
        
        <Text style={styles.label}>Attendance ID (for check-out):</Text>
        <TextInput
          style={styles.input}
          value={attendanceId}
          onChangeText={setAttendanceId}
          keyboardType="numeric"
          placeholder="Enter attendance ID"
        />
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={testGetAll}>
          <Text style={styles.buttonText}>GET All Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={testCheckIn}>
          <Text style={styles.buttonText}>POST Check-In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF9800' }]} onPress={testCheckOut}>
          <Text style={styles.buttonText}>PATCH Check-Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#666' }]} onPress={() => setResults('')}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>📋 Test Results:</Text>
        <Text style={styles.resultsText}>{results || 'No tests run yet. Click a button above to test.'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#003366',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  buttonSection: {
    padding: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#000',
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  resultsTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultsText: {
    color: '#0f0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
