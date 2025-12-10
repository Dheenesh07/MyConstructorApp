import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Picker, ScrollView } from "react-native";
import { taskAPI, userAPI, projectAPI } from "../../utils/api";

export default function TaskAssignment({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: null,
    assigned_to: null,
    priority: 'medium',
    status: 'not_started',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    estimated_hours: 0
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
    loadUsers();
    loadProjects();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks from database');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const createTask = async () => {
    if (!newTask.title || !newTask.project) {
      Alert.alert("Error", "Please fill in title and select a project");
      return;
    }
    
    try {
      const taskData = {
        ...newTask,
        project: parseInt(newTask.project),
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
        estimated_hours: parseFloat(newTask.estimated_hours) || 0,
        start_date: newTask.start_date,
        due_date: newTask.due_date
      };
      
      if (editingTask) {
        await taskAPI.update(editingTask.id, taskData);
        Alert.alert("Success", "Task updated successfully");
      } else {
        await taskAPI.create(taskData);
        Alert.alert("Success", "Task created successfully");
      }
      
      setModalVisible(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        project: null,
        assigned_to: null,
        priority: 'medium',
        status: 'not_started',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        estimated_hours: 0
      });
      loadTasks();
    } catch (error) {
      console.error('Task operation error:', error);
      Alert.alert("Error", editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      project: task.project?.id || task.project,
      assigned_to: task.assigned_to?.id || task.assigned_to,
      priority: task.priority,
      status: task.status,
      start_date: task.start_date || new Date().toISOString().split('T')[0],
      due_date: task.due_date || new Date().toISOString().split('T')[0],
      estimated_hours: task.estimated_hours || 0
    });
    setModalVisible(true);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      loadTasks();
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'not_started': return '#6c757d';
      case 'on_hold': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.badgeText}>{item.priority?.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.assignedTo}>Assigned to: {item.assigned_to?.username || 'Unassigned'}</Text>
      <View style={styles.taskFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status?.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <Text style={styles.dueDate}>Due: {item.due_date}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ffc107' }]}
          onPress={() => editTask(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#007bff' }]}
          onPress={() => updateTaskStatus(item.id, 'in_progress')}
        >
          <Text style={styles.actionButtonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#28a745' }]}
          onPress={() => updateTaskStatus(item.id, 'completed')}
        >
          <Text style={styles.actionButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Task Assignment</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTasks}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Create New Task'}</Text>
          <ScrollView 
            style={styles.modalScrollView} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask({...newTask, title: text})}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={newTask.description}
            onChangeText={(text) => setNewTask({...newTask, description: text})}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Project *</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newTask.project}
                onValueChange={(value) => setNewTask({...newTask, project: value})}
                style={styles.pickerStyle}
              >
                <Picker.Item label="Select Project" value={null} />
                {projects.map(project => (
                  <Picker.Item key={project.id} label={`${project.project_code} - ${project.name}`} value={project.id} />
                ))}
              </Picker>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Start Date (YYYY-MM-DD)"
            value={newTask.start_date}
            onChangeText={(text) => setNewTask({...newTask, start_date: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            value={newTask.due_date}
            onChangeText={(text) => setNewTask({...newTask, due_date: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Estimated Hours"
            value={newTask.estimated_hours.toString()}
            onChangeText={(text) => setNewTask({...newTask, estimated_hours: text})}
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Priority:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newTask.priority}
                onValueChange={(value) => setNewTask({...newTask, priority: value})}
                style={styles.pickerStyle}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="High" value="high" />
                <Picker.Item label="Critical" value="critical" />
              </Picker>
            </View>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Assign to User:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newTask.assigned_to}
                onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}
                style={styles.pickerStyle}
              >
                <Picker.Item label="Select User" value={null} />
                {users.map(user => (
                  <Picker.Item key={user.id} label={user.username} value={user.id} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              setModalVisible(false);
              setEditingTask(null);
              setNewTask({
                title: '',
                description: '',
                project: null,
                assigned_to: null,
                priority: 'medium',
                status: 'not_started',
                start_date: new Date().toISOString().split('T')[0],
                due_date: new Date().toISOString().split('T')[0],
                estimated_hours: 0
              });
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createTask}>
              <Text style={styles.createButtonText}>{editingTask ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
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
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  taskDescription: {
    color: "#666",
    marginBottom: 10,
  },
  assignedTo: {
    color: "#333",
    fontWeight: "500",
    marginBottom: 10,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueDate: {
    color: "#666",
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f9fc",
  },
  modalScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
    minHeight: '100%',
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#003366",
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerStyle: {
    height: 50,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    minHeight: 100,
    maxHeight: 150,
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: 'center',
  },
  dateButtonText: {
    color: "#003366",
    fontSize: 16,
  },
});