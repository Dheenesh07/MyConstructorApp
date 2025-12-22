import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from "react-native";
import { safetyAPI, qualityAPI, projectAPI, taskAPI, userAPI } from "../../utils/api";

export default function SafetyCompliance({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('incidents');
  const [newIncident, setNewIncident] = useState({
    title: '',
    type: 'minor',
    description: '',
    location: '',
    injured_person: '',
    project: '',
    reported_by: ''
  });

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      const [incidentsRes, inspectionsRes, projectsRes, tasksRes, usersRes] = await Promise.all([
        safetyAPI.getIncidents(),
        qualityAPI.getInspections(),
        projectAPI.getAll(),
        taskAPI.getAll(),
        userAPI.getAll()
      ]);
      setIncidents(incidentsRes.data || []);
      setInspections(inspectionsRes.data || []);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading safety data:', error);
      Alert.alert('Error', 'Failed to load safety data from database');
    }
  };

  const addIncident = async () => {
    if (!newIncident.title || !newIncident.description || !newIncident.location || !newIncident.project || !newIncident.reported_by) {
      Alert.alert('Error', 'Please fill all required fields (Title, Project, Description, Location, Reported By)');
      return;
    }
    try {
      const payload = {
        incident_id: `INC${Date.now()}`,
        project: parseInt(newIncident.project),
        title: newIncident.title,
        description: newIncident.description,
        severity: newIncident.type,
        location_details: newIncident.location,
        injured_person: newIncident.injured_person || '',
        reported_by: parseInt(newIncident.reported_by),
        incident_date: new Date().toISOString(),
        status: 'reported'
      };
      const response = await safetyAPI.reportIncident(payload);
      setIncidents([response.data, ...incidents]);
      Alert.alert("Success", "Safety incident saved to database");
      setModalVisible(false);
      setNewIncident({
        title: '',
        type: 'minor',
        description: '',
        location: '',
        injured_person: '',
        project: '',
        reported_by: ''
      });
    } catch (error) {
      console.error('Error reporting incident:', error);
      Alert.alert('Error', 'Failed to save incident to database');
    }
  };

  const getIncidentColor = (type) => {
    switch (type) {
      case 'minor': return '#ffc107';
      case 'major': return '#dc3545';
      case 'critical': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'resolved': return '#28a745';
      case 'investigating': return '#ffc107';
      case 'open': return '#007bff';
      default: return '#6c757d';
    }
  };

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    investigated_by: '',
    corrective_actions: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const [newInspection, setNewInspection] = useState({
    inspection_type: '',
    project: '',
    task: '',
    inspector: '',
    scheduled_date: '',
    checklist_items: ''
  });

  const [inspectionUpdateModalVisible, setInspectionUpdateModalVisible] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectionUpdateForm, setInspectionUpdateForm] = useState({
    status: 'passed',
    actual_date: '',
    observations: '',
    score: '',
    recommendations: ''
  });

  const openUpdateModal = (incident) => {
    setSelectedIncident(incident);
    setUpdateForm({
      status: incident.status || 'investigating',
      investigated_by: '',
      corrective_actions: ''
    });
    setUpdateModalVisible(true);
  };

  const updateIncident = async () => {
    if (!updateForm.status) {
      Alert.alert('Error', 'Please select a status');
      return;
    }
    setIsUpdating(true);
    try {
      const payload = {
        status: updateForm.status,
        investigated_by: parseInt(updateForm.investigated_by) || null,
        corrective_actions: updateForm.corrective_actions
      };
      const response = await safetyAPI.updateIncident(selectedIncident.id, payload);
      setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? response.data : inc));
      setUpdateModalVisible(false);
      Alert.alert('Success', `Incident ${selectedIncident.incident_id} investigation updated successfully!`);
    } catch (error) {
      console.error('Error updating incident:', error);
      Alert.alert('Error', `Failed to update incident: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const scheduleInspection = async () => {
    if (!newInspection.inspection_type || !newInspection.project || !newInspection.inspector || !newInspection.scheduled_date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      const payload = {
        inspection_id: `QI${Date.now()}`,
        project: parseInt(newInspection.project),
        task: newInspection.task ? parseInt(newInspection.task) : null,
        inspector: parseInt(newInspection.inspector),
        inspection_type: newInspection.inspection_type,
        scheduled_date: newInspection.scheduled_date,
        checklist_items: newInspection.checklist_items
      };
      console.log('Sending inspection payload:', payload);
      const response = await qualityAPI.createInspection(payload);
      setInspections([response.data, ...inspections]);
      Alert.alert('Success', 'Inspection scheduled successfully');
      setInspectionModalVisible(false);
      setNewInspection({ inspection_type: '', project: '', task: '', inspector: '', scheduled_date: '', checklist_items: '' });
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      console.error('Error response:', error.response?.data);
      console.log('Inspection payload sent:', JSON.stringify(payload, null, 2));
      Alert.alert('Error', `Failed to schedule inspection: ${error.response?.data?.detail || error.message}`);
    }
  };

  const openInspectionUpdateModal = (inspection) => {
    setSelectedInspection(inspection);
    setInspectionUpdateForm({
      status: inspection.status || 'passed',
      actual_date: '',
      observations: '',
      score: '',
      recommendations: ''
    });
    setInspectionUpdateModalVisible(true);
  };

  const updateInspectionResult = async () => {
    try {
      const payload = {
        status: inspectionUpdateForm.status,
        actual_date: inspectionUpdateForm.actual_date,
        observations: inspectionUpdateForm.observations,
        score: inspectionUpdateForm.score ? parseInt(inspectionUpdateForm.score) : null,
        recommendations: inspectionUpdateForm.recommendations
      };
      const response = await qualityAPI.updateInspection(selectedInspection.id, payload);
      setInspections(inspections.map(insp => insp.id === selectedInspection.id ? response.data : insp));
      Alert.alert('Success', 'Inspection updated successfully');
      setInspectionUpdateModalVisible(false);
    } catch (error) {
      console.error('Error updating inspection:', error);
      Alert.alert('Error', 'Failed to update inspection');
    }
  };

  const renderIncident = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: getIncidentColor(item.severity || item.type) }]}>
          <Text style={styles.badgeText}>{(item.severity || item.type || 'minor').toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title || item.description}</Text>
      <Text style={styles.cardDetail}>📍 {item.location_details || item.location}</Text>
      <Text style={styles.cardDetail}>👤 {item.injured_person || item.reporter}</Text>
      <Text style={styles.cardDetail}>📅 {item.incident_date?.split('T')[0] || item.date}</Text>
      <TouchableOpacity style={styles.updateButton} onPress={() => openUpdateModal(item)}>
        <Text style={styles.updateButtonText}>Update Investigation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInspection = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.inspection_type || item.area}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{(item.status || 'scheduled').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardDetail}>👤 Inspector: {item.inspector}</Text>
      <Text style={styles.cardDetail}>📅 Scheduled: {item.scheduled_date}</Text>
      {item.actual_date && <Text style={styles.cardDetail}>✅ Completed: {item.actual_date}</Text>}
      {item.score && <Text style={styles.cardDetail}>📊 Score: {item.score}%</Text>}
      <TouchableOpacity style={styles.updateButton} onPress={() => openInspectionUpdateModal(item)}>
        <Text style={styles.updateButtonText}>Update Result</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#003366" />
          <Text style={styles.title}>Safety & Compliance</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => activeTab === 'incidents' ? setModalVisible(true) : setInspectionModalVisible(true)}
        >
          <Text style={styles.addButtonText}>
            {activeTab === 'incidents' ? '+ Report Incident' : '+ Schedule Inspection'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Safety Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{incidents.length}</Text>
          <Text style={styles.statLabel}>Total Incidents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{incidents.filter(i => i.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inspections.filter(i => i.status === 'passed').length}</Text>
          <Text style={styles.statLabel}>Passed Inspections</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incidents' && styles.activeTab]}
          onPress={() => setActiveTab('incidents')}
        >
          <Text style={[styles.tabText, activeTab === 'incidents' && styles.activeTabText]}>
            Incidents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inspections' && styles.activeTab]}
          onPress={() => setActiveTab('inspections')}
        >
          <Text style={[styles.tabText, activeTab === 'inspections' && styles.activeTabText]}>
            Inspections
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'incidents' ? incidents : inspections}
        renderItem={activeTab === 'incidents' ? renderIncident : renderInspection}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Report Safety Incident</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            value={newIncident.title}
            onChangeText={(text) => setNewIncident({...newIncident, title: text})}
          />
          
          <Text style={styles.typeLabel}>Select Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.typeOption, newIncident.project === project.id && styles.selectedType]}
                onPress={() => setNewIncident({...newIncident, project: project.id})}
              >
                <Text style={[styles.typeText, newIncident.project === project.id && styles.selectedTypeText]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Incident Severity *</Text>
            {['minor', 'major', 'critical'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  newIncident.type === type && styles.selectedType
                ]}
                onPress={() => setNewIncident({...newIncident, type})}
              >
                <Text style={[
                  styles.typeText,
                  newIncident.type === type && styles.selectedTypeText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Description *"
            value={newIncident.description}
            onChangeText={(text) => setNewIncident({...newIncident, description: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location Details *"
            value={newIncident.location}
            onChangeText={(text) => setNewIncident({...newIncident, location: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Injured Person (if any)"
            value={newIncident.injured_person}
            onChangeText={(text) => setNewIncident({...newIncident, injured_person: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Reported By (User ID) *"
            value={newIncident.reported_by}
            onChangeText={(text) => setNewIncident({...newIncident, reported_by: text})}
            keyboardType="numeric"
          />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={addIncident}>
              <Text style={styles.createButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Investigation Modal */}
      <Modal visible={updateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Investigation</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.incidentInfo}>Incident: {selectedIncident?.title}</Text>
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Status *</Text>
            {['reported', 'investigating', 'resolved', 'closed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.typeOption,
                  updateForm.status === status && styles.selectedType
                ]}
                onPress={() => setUpdateForm({...updateForm, status})}
              >
                <Text style={[
                  styles.typeText,
                  updateForm.status === status && styles.selectedTypeText
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Investigated By (User ID)"
            value={updateForm.investigated_by}
            onChangeText={(text) => setUpdateForm({...updateForm, investigated_by: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Corrective Actions"
            value={updateForm.corrective_actions}
            onChangeText={(text) => setUpdateForm({...updateForm, corrective_actions: text})}
            multiline
          />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setUpdateModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, isUpdating && { opacity: 0.6 }]} 
              onPress={updateIncident}
              disabled={isUpdating}
            >
              <Text style={styles.createButtonText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Inspection Modal */}
      <Modal visible={inspectionModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Schedule Quality Inspection</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.input}
            placeholder="Inspection Type *"
            value={newInspection.inspection_type}
            onChangeText={(text) => setNewInspection({...newInspection, inspection_type: text})}
          />
          
          <Text style={styles.typeLabel}>Select Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.typeOption, newInspection.project === project.id && styles.selectedType]}
                onPress={() => setNewInspection({...newInspection, project: project.id})}
              >
                <Text style={[styles.typeText, newInspection.project === project.id && styles.selectedTypeText]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.typeLabel}>Select Task (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.typeOption, newInspection.task === task.id && styles.selectedType]}
                onPress={() => setNewInspection({...newInspection, task: task.id})}
              >
                <Text style={[styles.typeText, newInspection.task === task.id && styles.selectedTypeText]}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.typeLabel}>Select Inspector *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.typeOption, newInspection.inspector === user.id && styles.selectedType]}
                onPress={() => setNewInspection({...newInspection, inspector: user.id})}
              >
                <Text style={[styles.typeText, newInspection.inspector === user.id && styles.selectedTypeText]}>
                  {user.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TextInput
            style={styles.input}
            placeholder="Scheduled Date (YYYY-MM-DD) *"
            value={newInspection.scheduled_date}
            onChangeText={(text) => setNewInspection({...newInspection, scheduled_date: text})}
          />
          
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Checklist Items (e.g., 1. Check concrete\n2. Verify rebar)"
            value={newInspection.checklist_items}
            onChangeText={(text) => setNewInspection({...newInspection, checklist_items: text})}
            multiline
          />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setInspectionModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={scheduleInspection}>
              <Text style={styles.createButtonText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Inspection Result Modal */}
      <Modal visible={inspectionUpdateModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Inspection Result</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.incidentInfo}>Inspection: {selectedInspection?.inspection_type}</Text>
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Status *</Text>
            {['passed', 'failed', 'pending'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.typeOption,
                  inspectionUpdateForm.status === status && styles.selectedType
                ]}
                onPress={() => setInspectionUpdateForm({...inspectionUpdateForm, status})}
              >
                <Text style={[
                  styles.typeText,
                  inspectionUpdateForm.status === status && styles.selectedTypeText
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Actual Date (YYYY-MM-DD)"
            value={inspectionUpdateForm.actual_date}
            onChangeText={(text) => setInspectionUpdateForm({...inspectionUpdateForm, actual_date: text})}
          />
          
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Observations"
            value={inspectionUpdateForm.observations}
            onChangeText={(text) => setInspectionUpdateForm({...inspectionUpdateForm, observations: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Score (0-100)"
            value={inspectionUpdateForm.score}
            onChangeText={(text) => setInspectionUpdateForm({...inspectionUpdateForm, score: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Recommendations"
            value={inspectionUpdateForm.recommendations}
            onChangeText={(text) => setInspectionUpdateForm({...inspectionUpdateForm, recommendations: text})}
            multiline
          />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setInspectionUpdateModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={updateInspectionResult}>
              <Text style={styles.createButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
  },
  addButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc3545",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#004AAD",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f9fc",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 20,
  },
  typeContainer: {
    marginBottom: 15,
  },
  projectScroll: {
    flexGrow: 0,
    marginBottom: 15,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  typeOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
  },
  typeText: {
    fontSize: 14,
    color: "#666",
  },
  selectedTypeText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  updateButton: {
    backgroundColor: "#004AAD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  incidentInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: 'italic',
  },
});