import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal, TextInput, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get("window");
import { projectAPI, equipmentAPI, materialAPI } from "../../utils/api";

export default function ProjectManagement({ navigation, route }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [equipment, setEquipment] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const { projectId, projectName } = route.params || {};
  const [newProject, setNewProject] = useState({
    name: '',
    project_code: '',
    client: '',
    project_type: 'commercial',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    total_budget: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadProjects();
    if (projectId) {
      // Find and highlight the selected project
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projectId, projects]);

  const loadProjects = async () => {
    try {
      const [projectsRes, equipmentRes, materialRes] = await Promise.all([
        projectAPI.getAll(),
        equipmentAPI.getAll().catch(() => ({ data: [] })),
        materialAPI.getRequests().catch(() => ({ data: [] }))
      ]);
      if (projectsRes.data && projectsRes.data.length > 0) {
        setProjects(projectsRes.data);
      } else {
        setProjects([]);
      }
      setEquipment(equipmentRes.data || []);
      setMaterialRequests(materialRes.data || []);
    } catch (error) {
      console.error('Error loading projects:', error.response?.data || error.message);
      setProjects([]);
      setEquipment([]);
      setMaterialRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
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
      Alert.alert('Location Error', 'Could not fetch your location.');
      return null;
    }
  };

  const openMapSelector = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
      setSelectedLocation(location);
      setMapModalVisible(true);
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setNewProject({
        ...newProject,
        start_date: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setNewProject({
        ...newProject,
        end_date: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      setNewProject({
        ...newProject,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString()
      });
      setMapModalVisible(false);
    }
  };

  const createProject = async () => {
    // Validate required fields
    if (!newProject.name || !newProject.project_code || !newProject.client) {
      Alert.alert("Validation Error", "Please fill in Project Name, Project Code, and Client Name");
      return;
    }

    try {
      // Get current user ID
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user?.id) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      const projectData = {
        name: newProject.name,
        project_code: newProject.project_code,
        client: newProject.client,
        project_manager: user.id,
        project_type: newProject.project_type || 'commercial',
        description: newProject.description || '',
        location: newProject.location || '',
        latitude: newProject.latitude ? parseFloat(newProject.latitude) : null,
        longitude: newProject.longitude ? parseFloat(newProject.longitude) : null,
        status: 'planning',
        start_date: newProject.start_date.trim() || null,
        end_date: newProject.end_date.trim() || null,
        total_budget: newProject.total_budget ? parseFloat(newProject.total_budget) : 0
      };
      
      console.log('Creating project with data:', projectData);
      const response = await projectAPI.create(projectData);
      console.log('Project created:', response.data);
      
      Alert.alert("Success", "Project created successfully");
      setModalVisible(false);
      setNewProject({
        name: '',
        project_code: '',
        client: '',
        project_type: 'commercial',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        total_budget: '',
        start_date: '',
        end_date: ''
      });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      
      let errorMsg = "Failed to create project";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else {
          // Format field-specific errors
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMsg = errors || "Failed to create project";
        }
      }
      
      Alert.alert("Error", errorMsg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'planning': return '#ffc107';
      case 'completed': return '#6c757d';
      case 'on_hold': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderProject = ({ item }) => (
    <View style={[styles.projectCard, 
      selectedProject?.id === item.id && styles.selectedProjectCard
    ]}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
        </View>
        {selectedProject?.id === item.id && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>SELECTED</Text>
          </View>
        )}
      </View>
      <Text style={styles.projectCode}>Code: {item.project_code}</Text>
      <Text style={styles.projectClient}>Client: {item.client}</Text>
      <Text style={styles.projectBudget}>Budget: ${item.total_budget?.toLocaleString()}</Text>
      <Text style={styles.projectDates}>{item.start_date} - {item.end_date}</Text>
      
      {equipment.filter(e => e.current_project === item.id).length > 0 && (
        <View style={styles.equipmentSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="build" size={16} color="#003366" style={{marginRight: 6}} />
            <Text style={styles.equipmentTitle}>Assigned Equipment ({equipment.filter(e => e.current_project === item.id).length})</Text>
          </View>
          {equipment.filter(e => e.current_project === item.id).map(eq => (
            <Text key={eq.id} style={styles.equipmentItem}>• {eq.name} - {eq.status}</Text>
          ))}
        </View>
      )}
      
      {materialRequests.filter(r => r.project === item.id).length > 0 && (
        <View style={styles.materialSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cube" size={16} color="#003366" style={{marginRight: 6}} />
            <Text style={styles.materialTitle}>Material Requests ({materialRequests.filter(r => r.project === item.id).length})</Text>
          </View>
          {materialRequests.filter(r => r.project === item.id).slice(0, 3).map(req => (
            <View key={req.id} style={styles.materialItem}>
              <Text style={styles.materialDesc}>• {req.material_description}</Text>
              <View style={[styles.materialBadge, {
                backgroundColor: req.status === 'approved' ? '#4CAF50' : req.urgency === 'high' ? '#F44336' : '#FF9800'
              }]}>
                <Text style={styles.materialBadgeText}>{req.status?.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.projectActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedProject(item)}>
          <Text style={styles.actionButtonText}>Select Project</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, {backgroundColor: "#FF9800"}]} onPress={() => navigation.navigate('MaterialRequests', {projectId: item.id})}>
          <Text style={styles.actionButtonText}>Request Materials</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="construct" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Project Management</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Project</Text>
        </TouchableOpacity>
      </View>
      
      {projectName && (
        <View style={styles.contextHeader}>
          <Text style={styles.contextText}>Managing: {projectName}</Text>
        </View>
      )}

      {projects.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Projects Found</Text>
          <Text style={styles.emptyStateText}>Create your first project to get started</Text>
          <TouchableOpacity style={styles.createFirstButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.createFirstButtonText}>Create First Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={loadProjects}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.formInput}
                placeholder="Project Name *"
                placeholderTextColor="#999"
                value={newProject.name}
                onChangeText={(text) => setNewProject({...newProject, name: text})}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Project Code *"
                placeholderTextColor="#999"
                value={newProject.project_code}
                onChangeText={(text) => setNewProject({...newProject, project_code: text})}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Client Name *"
                placeholderTextColor="#999"
                value={newProject.client}
                onChangeText={(text) => setNewProject({...newProject, client: text})}
              />
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Description"
                placeholderTextColor="#999"
                value={newProject.description}
                onChangeText={(text) => setNewProject({...newProject, description: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.locationSection}>
                <Text style={styles.locationLabel}>Project Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Location Address"
                  placeholderTextColor="#999"
                  value={newProject.location}
                  onChangeText={(text) => setNewProject({...newProject, location: text})}
                />
                <TouchableOpacity style={styles.mapButton} onPress={openMapSelector}>
                  <Ionicons name="location" size={20} color="#fff" />
                  <Text style={styles.mapButtonText}>Select on Map</Text>
                </TouchableOpacity>
                {newProject.latitude && newProject.longitude && (
                  <Text style={styles.coordinatesText}>
                    📍 {parseFloat(newProject.latitude).toFixed(6)}, {parseFloat(newProject.longitude).toFixed(6)}
                  </Text>
                )}
              </View>
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                  <Ionicons name="calendar" size={20} color="#003366" />
                  <Text style={styles.dateButtonText}>
                    {newProject.start_date || 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                  <Ionicons name="calendar" size={20} color="#003366" />
                  <Text style={styles.dateButtonText}>
                    {newProject.end_date || 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Budget"
                placeholderTextColor="#999"
                value={newProject.total_budget}
                onChangeText={(text) => setNewProject({...newProject, total_budget: text})}
                keyboardType="numeric"
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createProject}>
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={mapModalVisible} animationType="slide" transparent={true}>
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalContent}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>📍 Select Project Location</Text>
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
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={(event) => {
                    setSelectedLocation(event.nativeEvent.coordinate);
                  }}
                >
                  {selectedLocation && (
                    <Marker
                      coordinate={selectedLocation}
                      title="Project Location"
                      description="Selected project site"
                    />
                  )}
                </MapView>

                <View style={styles.locationInfo}>
                  <Text style={styles.locationInstructions}>Tap on the map to select project location</Text>
                  {selectedLocation && (
                    <Text style={styles.selectedCoordinates}>
                      📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>

                <View style={styles.mapModalActions}>
                  <TouchableOpacity style={styles.mapCancelButton} onPress={() => setMapModalVisible(false)}>
                    <Text style={styles.mapCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.mapConfirmButton, !selectedLocation && styles.disabledButton]} 
                    onPress={confirmLocation}
                    disabled={!selectedLocation}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.mapConfirmText}>Confirm Location</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: "#004AAD",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  projectCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  projectCode: {
    color: "#666",
    marginBottom: 5,
  },
  projectClient: {
    color: "#666",
    marginBottom: 5,
  },
  projectBudget: {
    color: "#28a745",
    fontWeight: "600",
    marginBottom: 5,
  },
  projectDates: {
    color: "#666",
    fontSize: 12,
  },
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
    maxHeight: "90%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
  },
  formScrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  formInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: "#333",
    minHeight: 50,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#004AAD",
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  selectedProjectCard: {
    borderWidth: 2,
    borderColor: "#004AAD",
    backgroundColor: "#f0f8ff",
  },
  selectedBadge: {
    backgroundColor: "#004AAD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  contextHeader: {
    backgroundColor: "#004AAD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  contextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  projectActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#004AAD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  createFirstButton: {
    backgroundColor: "#004AAD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  equipmentSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#004AAD",
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 5,
  },
  equipmentItem: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
    marginTop: 2,
  },
  materialSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff8e1",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 5,
  },
  materialItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  materialDesc: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  materialBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  materialBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  locationSection: {
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#f0f8f0',
    padding: 8,
    borderRadius: 6,
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
  locationInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectedCoordinates: {
    fontSize: 14,
    color: '#003366',
    textAlign: 'center',
    fontWeight: '500',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  dateSection: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 50,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});