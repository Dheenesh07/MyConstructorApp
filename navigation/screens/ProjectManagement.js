import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
import { projectAPI, equipmentAPI, materialAPI } from "../../utils/api";

export default function ProjectManagement({ navigation, route }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
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
        equipmentAPI.getAll(),
        materialAPI.getRequests()
      ]);
      if (projectsRes.data && projectsRes.data.length > 0) {
        setProjects(projectsRes.data);
      } else {
        setProjects([]);
      }
      setEquipment(equipmentRes.data || []);
      setMaterialRequests(materialRes.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setEquipment([]);
      setMaterialRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      await projectAPI.create(newProject);
      Alert.alert("Success", "Project created successfully");
      setModalVisible(false);
      loadProjects();
    } catch (error) {
      Alert.alert("Error", "Failed to create project");
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
            <Ionicons name="build" size={16} color="#003366" />
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
            <Ionicons name="cube" size={16} color="#003366" />
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
          <Ionicons name="construct" size={24} color="#003366" />
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

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Project</Text>
          <ScrollView style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={newProject.name}
              onChangeText={(text) => setNewProject({...newProject, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Project Code"
              value={newProject.project_code}
              onChangeText={(text) => setNewProject({...newProject, project_code: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Client Name"
              value={newProject.client}
              onChangeText={(text) => setNewProject({...newProject, client: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newProject.description}
              onChangeText={(text) => setNewProject({...newProject, description: text})}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newProject.location}
              onChangeText={(text) => setNewProject({...newProject, location: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Budget"
              value={newProject.total_budget}
              onChangeText={(text) => setNewProject({...newProject, total_budget: text})}
              keyboardType="numeric"
            />
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createProject}>
              <Text style={styles.createButtonText}>Create</Text>
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  form: {
    flex: 1,
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
});