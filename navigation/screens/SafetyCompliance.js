import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from "react-native";

export default function SafetyCompliance({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('incidents');
  const [newIncident, setNewIncident] = useState({
    type: 'minor',
    description: '',
    location: '',
    reporter: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = () => {
    // Mock safety data
    setIncidents([
      {
        id: 1,
        type: 'minor',
        description: 'Worker slipped on wet surface',
        location: 'Site A - Floor 3',
        reporter: 'John Smith',
        date: '2024-03-15',
        status: 'resolved'
      },
      {
        id: 2,
        type: 'major',
        description: 'Equipment malfunction - crane',
        location: 'Site B - Main Area',
        reporter: 'Safety Officer',
        date: '2024-03-10',
        status: 'investigating'
      }
    ]);

    setInspections([
      {
        id: 1,
        area: 'Scaffolding - Building A',
        inspector: 'Mike Johnson',
        date: '2024-03-20',
        status: 'passed',
        score: 95
      },
      {
        id: 2,
        area: 'Electrical Systems',
        inspector: 'Sarah Wilson',
        date: '2024-03-18',
        status: 'failed',
        score: 65
      }
    ]);
  };

  const addIncident = () => {
    const newId = incidents.length + 1;
    setIncidents([...incidents, { ...newIncident, id: newId, status: 'open' }]);
    Alert.alert("Success", "Safety incident reported successfully");
    setModalVisible(false);
    setNewIncident({
      type: 'minor',
      description: '',
      location: '',
      reporter: '',
      date: new Date().toISOString().split('T')[0]
    });
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

  const renderIncident = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: getIncidentColor(item.type) }]}>
          <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.description}</Text>
      <Text style={styles.cardDetail}>📍 {item.location}</Text>
      <Text style={styles.cardDetail}>👤 Reported by: {item.reporter}</Text>
      <Text style={styles.cardDetail}>📅 {item.date}</Text>
    </View>
  );

  const renderInspection = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.area}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardDetail}>👤 Inspector: {item.inspector}</Text>
      <Text style={styles.cardDetail}>📅 Date: {item.date}</Text>
      <Text style={styles.cardDetail}>📊 Score: {item.score}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦺 Safety & Compliance</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Report Incident</Text>
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
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Incident Type:</Text>
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
            placeholder="Description"
            value={newIncident.description}
            onChangeText={(text) => setNewIncident({...newIncident, description: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newIncident.location}
            onChangeText={(text) => setNewIncident({...newIncident, location: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Reporter Name"
            value={newIncident.reporter}
            onChangeText={(text) => setNewIncident({...newIncident, reporter: text})}
          />

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
});