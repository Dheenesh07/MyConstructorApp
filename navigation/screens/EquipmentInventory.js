import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from "react-native";

export default function EquipmentInventory({ navigation }) {
  const [equipment, setEquipment] = useState([
    {
      id: 1,
      name: "Excavator CAT 320",
      type: "heavy_machinery",
      status: "available",
      location: "Site A",
      condition: "good",
      lastMaintenance: "2024-03-01"
    },
    {
      id: 2,
      name: "Concrete Mixer",
      type: "machinery",
      status: "in_use",
      location: "Site B",
      condition: "excellent",
      lastMaintenance: "2024-02-15"
    },
    {
      id: 3,
      name: "Safety Helmets (50x)",
      type: "safety",
      status: "available",
      location: "Warehouse",
      condition: "good",
      lastMaintenance: "N/A"
    },
    {
      id: 4,
      name: "Tower Crane",
      type: "heavy_machinery",
      status: "maintenance",
      location: "Site A",
      condition: "fair",
      lastMaintenance: "2024-03-20"
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'machinery',
    location: '',
    condition: 'good'
  });

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'heavy_machinery': return '🚜';
      case 'machinery': return '⚙️';
      case 'safety': return '🦺';
      case 'tools': return '🔧';
      default: return '📦';
    }
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

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#28a745';
      case 'good': return '#007bff';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const addEquipment = () => {
    const newId = equipment.length + 1;
    setEquipment([...equipment, { 
      ...newEquipment, 
      id: newId, 
      status: 'available',
      lastMaintenance: 'N/A'
    }]);
    Alert.alert("Success", "Equipment added successfully");
    setModalVisible(false);
    setNewEquipment({
      name: '',
      type: 'machinery',
      location: '',
      condition: 'good'
    });
  };

  const updateStatus = (id, newStatus) => {
    setEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    Alert.alert("Success", "Equipment status updated");
  };

  const renderEquipment = ({ item }) => (
    <View style={styles.equipmentCard}>
      <View style={styles.equipmentHeader}>
        <Text style={styles.equipmentIcon}>{getEquipmentIcon(item.type)}</Text>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          <Text style={styles.equipmentLocation}>📍 {item.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.equipmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) }]}>
            <Text style={styles.badgeText}>{item.condition.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.detailText}>Last Maintenance: {item.lastMaintenance}</Text>
      </View>

      <View style={styles.equipmentActions}>
        {item.status === 'available' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => updateStatus(item.id, 'in_use')}
          >
            <Text style={styles.actionButtonText}>Use</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in_use' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => updateStatus(item.id, 'available')}
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
        <Text style={styles.title}>🛠️ Equipment & Inventory</Text>
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
            placeholder="Equipment Name"
            value={newEquipment.name}
            onChangeText={(text) => setNewEquipment({...newEquipment, name: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEquipment.location}
            onChangeText={(text) => setNewEquipment({...newEquipment, location: text})}
          />

          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Equipment Type:</Text>
            {['machinery', 'heavy_machinery', 'safety', 'tools'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  newEquipment.type === type && styles.selectedType
                ]}
                onPress={() => setNewEquipment({...newEquipment, type})}
              >
                <Text style={[
                  styles.typeText,
                  newEquipment.type === type && styles.selectedTypeText
                ]}>
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
    fontSize: 24,
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
  equipmentLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
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