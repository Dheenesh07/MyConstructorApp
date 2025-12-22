import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { userAPI } from "../../utils/api";

export default function UserManagement({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'worker',
    phone: '',
    employee_id: '',
    department: ''
  });

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'site_engineer', label: 'Site Engineer' },
    { value: 'foreman', label: 'Foreman' },
    { value: 'worker', label: 'Worker' },
    { value: 'safety_officer', label: 'Safety Officer' },
    { value: 'quality_inspector', label: 'Quality Inspector' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users from database');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      await userAPI.create(newUser);
      Alert.alert("Success", "User created successfully");
      setModalVisible(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'worker',
        phone: '',
        employee_id: '',
        department: ''
      });
      loadUsers();
    } catch (error) {
      Alert.alert("Error", "Failed to create user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'project_manager': return '#007bff';
      case 'site_engineer': return '#28a745';
      case 'foreman': return '#fd7e14';
      case 'worker': return '#6c757d';
      case 'safety_officer': return '#ffc107';
      case 'quality_inspector': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return 'construct';
      case 'project_manager': return 'clipboard';
      case 'site_engineer': return 'hammer';
      case 'foreman': return 'person';
      case 'worker': return 'people';
      case 'safety_officer': return 'shield-checkmark';
      case 'quality_inspector': return 'search';
      default: return 'person';
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Ionicons name={getRoleIcon(item.role)} size={24} color="#003366" style={styles.userIcon} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.detail}>ID: {item.employee_id}</Text>
        <Text style={styles.detail}>Dept: {item.department}</Text>
        <Text style={styles.detail}>Phone: {item.phone}</Text>
      </View>
      <View style={styles.userActions}>
        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.statusText}>{item.is_active ? 'ACTIVE' : 'INACTIVE'}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="people" size={24} color="#003366" />
          <Text style={styles.title}>User Management</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.is_active).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'worker').length}</Text>
          <Text style={styles.statLabel}>Workers</Text>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadUsers}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New User</Text>
          <ScrollView style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) => setNewUser({...newUser, username: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({...newUser, email: text})}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUser.password}
              onChangeText={(text) => setNewUser({...newUser, password: text})}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newUser.phone}
              onChangeText={(text) => setNewUser({...newUser, phone: text})}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Employee ID"
              value={newUser.employee_id}
              onChangeText={(text) => setNewUser({...newUser, employee_id: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Department"
              value={newUser.department}
              onChangeText={(text) => setNewUser({...newUser, department: text})}
            />
            <Text style={styles.roleLabel}>Role:</Text>
            <View style={styles.roleSelector}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    newUser.role === role.value && styles.selectedRole
                  ]}
                  onPress={() => setNewUser({...newUser, role: role.value})}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newUser.role === role.value && styles.selectedRoleText
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createUser}>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#004AAD",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  userCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detail: {
    fontSize: 12,
    color: "#666",
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
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
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  roleOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedRole: {
    backgroundColor: "#004AAD",
    borderColor: "#004AAD",
  },
  roleOptionText: {
    fontSize: 12,
    color: "#666",
  },
  selectedRoleText: {
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