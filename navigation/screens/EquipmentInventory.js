import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { equipmentAPI, projectAPI, userAPI } from '../../utils/api';

export default function EquipmentInventory({ navigation }) {
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentRes, projectsRes, usersRes] = await Promise.all([
        equipmentAPI.getAll(),
        projectAPI.getAll(),
        userAPI.getAll()
      ]);
      setEquipment(equipmentRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    equipment_id: '',
    name: '',
    category: 'Heavy Machinery',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: '',
    location: ''
  });
  const [assignForm, setAssignForm] = useState({
    current_project: '',
    assigned_to: '',
    location: ''
  });

  const getEquipmentIcon = (category) => {
    if (category?.toLowerCase().includes('heavy')) return 'construct';
    if (category?.toLowerCase().includes('lifting')) return 'arrow-up-circle';
    if (category?.toLowerCase().includes('safety')) return 'shield-checkmark';
    if (category?.toLowerCase().includes('tool')) return 'build';
    return 'settings';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#28a745';
      case 'in_use': return '#007bff';
      case 'maintenance': return '#ffc107';
      case 'out_of_order': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const addEquipment = async () => {
    if (!newEquipment.equipment_id || !newEquipment.name) {
      Alert.alert('Error', 'Please fill required fields (ID and Name)');
      return;
    }
    try {
      const response = await equipmentAPI.create({
        ...newEquipment,
        status: 'available',
        purchase_cost: parseFloat(newEquipment.purchase_cost) || 0
      });
      setEquipment([response.data, ...equipment]);
      Alert.alert('Success', 'Equipment added successfully');
      setModalVisible(false);
      setNewEquipment({
        equipment_id: '',
        name: '',
        category: 'Heavy Machinery',
        model: '',
        serial_number: '',
        purchase_date: '',
        purchase_cost: '',
        location: ''
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add equipment');
    }
  };

  const openAssignModal = (item) => {
    setSelectedEquipment(item);
    setAssignForm({
      current_project: item.current_project || '',
      assigned_to: item.assigned_to || '',
      location: item.location || ''
    });
    setAssignModalVisible(true);
  };

  const assignEquipment = async () => {
    if (!assignForm.current_project || !assignForm.assigned_to) {
      Alert.alert('Error', 'Please select both project and user');
      return;
    }
    try {
      const response = await equipmentAPI.update(selectedEquipment.id, {
        status: 'in_use',
        current_project: parseInt(assignForm.current_project),
        assigned_to: parseInt(assignForm.assigned_to),
        location: assignForm.location || selectedEquipment.location
      });
      setEquipment(prev => prev.map(item => 
        item.id === selectedEquipment.id ? response.data : item
      ));
      Alert.alert('Success', 'Equipment assigned successfully');
      setAssignModalVisible(false);
    } catch (error) {
      console.error('Error assigning equipment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to assign equipment');
    }
  };

  const returnEquipment = async (id) => {
    try {
      const response = await equipmentAPI.update(id, {
        status: 'available',
        current_project: null,
        assigned_to: null
      });
      setEquipment(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      Alert.alert('Success', 'Equipment returned successfully');
    } catch (error) {
      console.error('Error returning equipment:', error);
      Alert.alert('Error', 'Failed to return equipment');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await equipmentAPI.update(id, { status: newStatus });
      setEquipment(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      Alert.alert('Success', 'Equipment status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderEquipment = ({ item }) => (
    <View style={styles.equipmentCard}>
      <View style={styles.equipmentHeader}>
        <Ionicons name={getEquipmentIcon(item.category)} size={24} color="#003366" style={styles.equipmentIcon} />
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          <Text style={styles.equipmentId}>ID: {item.equipment_id}</Text>
          <Text style={styles.equipmentLocation}>📍 {item.location || 'Not specified'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.equipmentDetails}>
        <Text style={styles.detailText}>Category: {item.category}</Text>
        {item.model && <Text style={styles.detailText}>Model: {item.model}</Text>}
        {item.current_project_name && (
          <Text style={styles.detailText}>Project: {item.current_project_name}</Text>
        )}
        {item.assigned_to_name && (
          <Text style={styles.detailText}>Assigned to: {item.assigned_to_name}</Text>
        )}
      </View>

      <View style={styles.equipmentActions}>
        {item.status === 'available' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openAssignModal(item)}
          >
            <Text style={styles.actionButtonText}>Assign</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in_use' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => returnEquipment(item.id)}
          >
            <Text style={styles.actionButtonText}>Return</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ffc107' }]}
          onPress={() => updateStatus(item.id, 'maintenance')}
        >
          <Text style={styles.actionButtonText}>Maintenance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="build" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Equipment & Inventory</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Equipment</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{equipment.filter(e => e.status === 'available').length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{equipment.filter(e => e.status === 'in_use').length}</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{equipment.filter(e => e.status === 'maintenance').length}</Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </View>
      </View>

      {loading && <Text style={styles.loadingText}>Loading equipment...</Text>}

      {/* Equipment List */}
      <FlatList
        data={equipment}
        renderItem={renderEquipment}
        keyExtractor={(item) => item.id.toString()}
        style={styles.equipmentList}
      />

      {/* Add Equipment Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Equipment</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Equipment ID (e.g., EQ001) *"
            value={newEquipment.equipment_id}
            onChangeText={(text) => setNewEquipment({...newEquipment, equipment_id: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Equipment Name *"
            value={newEquipment.name}
            onChangeText={(text) => setNewEquipment({...newEquipment, name: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Category (e.g., Heavy Machinery)"
            value={newEquipment.category}
            onChangeText={(text) => setNewEquipment({...newEquipment, category: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Model"
            value={newEquipment.model}
            onChangeText={(text) => setNewEquipment({...newEquipment, model: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Serial Number"
            value={newEquipment.serial_number}
            onChangeText={(text) => setNewEquipment({...newEquipment, serial_number: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Purchase Date (YYYY-MM-DD)"
            value={newEquipment.purchase_date}
            onChangeText={(text) => setNewEquipment({...newEquipment, purchase_date: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Purchase Cost"
            value={newEquipment.purchase_cost}
            onChangeText={(text) => setNewEquipment({...newEquipment, purchase_cost: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEquipment.location}
            onChangeText={(text) => setNewEquipment({...newEquipment, location: text})}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={addEquipment}>
              <Text style={styles.createButtonText}>Add Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Equipment Modal */}
      <Modal visible={assignModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Assign Equipment: {selectedEquipment?.name}</Text>
          
          <Text style={styles.inputLabel}>Select Project *</Text>
          <ScrollView style={styles.pickerScroll} horizontal showsHorizontalScrollIndicator={false}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.pickerOption,
                  assignForm.current_project === project.id && styles.selectedPicker
                ]}
                onPress={() => setAssignForm({...assignForm, current_project: project.id})}
              >
                <Text style={[
                  styles.pickerText,
                  assignForm.current_project === project.id && styles.selectedPickerText
                ]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Assign To User *</Text>
          <ScrollView style={styles.pickerScroll} horizontal showsHorizontalScrollIndicator={false}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.pickerOption,
                  assignForm.assigned_to === user.id && styles.selectedPicker
                ]}
                onPress={() => setAssignForm({...assignForm, assigned_to: user.id})}
              >
                <Text style={[
                  styles.pickerText,
                  assignForm.assigned_to === user.id && styles.selectedPickerText
                ]}>
                  {user.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Location (optional)"
            value={assignForm.location}
            onChangeText={(text) => setAssignForm({...assignForm, location: text})}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAssignModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={assignEquipment}>
              <Text style={styles.createButtonText}>Assign Equipment</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#004AAD",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  equipmentList: {
    flex: 1,
  },
  equipmentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  equipmentIcon: {
    marginRight: 15,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  equipmentId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  equipmentLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
    marginTop: 10,
  },
  pickerScroll: {
    maxHeight: 50,
    marginBottom: 15,
  },
  pickerOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPicker: {
    backgroundColor: '#004AAD',
    borderColor: '#004AAD',
  },
  pickerText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPickerText: {
    color: '#fff',
    fontWeight: '600',
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
  equipmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  equipmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeContainer: {
    marginBottom: 20,
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
    backgroundColor: "#004AAD",
    borderColor: "#004AAD",
  },
  typeText: {
    fontSize: 14,
    color: "#666",
  },
  selectedTypeText: {
    color: "#fff",
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
});