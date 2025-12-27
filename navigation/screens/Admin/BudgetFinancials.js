import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { budgetAPI, projectAPI } from '../../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BudgetFinancials() {
  const [budgets, setBudgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetForm, setBudgetForm] = useState({
    project: '',
    category: 'materials',
    description: '',
    allocated_amount: '',
    spent_amount: '0',
    committed_amount: '0',
    fiscal_year: new Date().getFullYear(),
    created_by: ''
  });

  useEffect(() => {
    loadBudgets();
    loadProjects();
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setBudgetForm(prev => ({ ...prev, created_by: user.id }));
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudgets(response.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
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

  const createBudget = async () => {
    if (!budgetForm.project || !budgetForm.description || !budgetForm.allocated_amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      await budgetAPI.create({
        ...budgetForm,
        allocated_amount: parseFloat(budgetForm.allocated_amount),
        spent_amount: parseFloat(budgetForm.spent_amount),
        committed_amount: parseFloat(budgetForm.committed_amount)
      });
      Alert.alert('Success', 'Budget created successfully');
      setModalVisible(false);
      setBudgetForm({
        project: '',
        category: 'materials',
        description: '',
        allocated_amount: '',
        spent_amount: '0',
        committed_amount: '0',
        fiscal_year: new Date().getFullYear(),
        created_by: budgetForm.created_by
      });
      loadBudgets();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create budget');
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const calculateRemaining = (allocated, spent, committed) => {
    return allocated - spent - committed;
  };

  const addExpense = async () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid expense amount');
      return;
    }
    try {
      const newSpent = parseFloat(selectedBudget.spent_amount) + parseFloat(expenseAmount);
      console.log('Updating budget:', selectedBudget.id, 'New spent:', newSpent);
      await budgetAPI.update(selectedBudget.id, { 
        spent_amount: newSpent
      });
      Alert.alert('Success', 'Expense added successfully');
      setExpenseModalVisible(false);
      setExpenseAmount('');
      setSelectedBudget(null);
      loadBudgets();
    } catch (error) {
      console.error('Error adding expense:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.spent_amount?.[0] || 
                       error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) || 
                       'Failed to add expense';
      Alert.alert('Error', errorMsg);
    }
  };

  const getTotalAllocated = () => budgets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
  const getTotalSpent = () => budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
  const getTotalCommitted = () => budgets.reduce((sum, b) => sum + (b.committed_amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Budget & Finance</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Budget</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹{(getTotalAllocated() / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Total Allocated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹{(getTotalSpent() / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹{(getTotalCommitted() / 1000000).toFixed(1)}M</Text>
          <Text style={styles.statLabel}>Committed</Text>
        </View>
      </View>

      <ScrollView style={styles.budgetsList}>
        {budgets.map((budget) => {
          const remaining = calculateRemaining(budget.allocated_amount, budget.spent_amount, budget.committed_amount);
          const spentPercent = ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(0);
          return (
            <View key={budget.id} style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetCategory}>{budget.category.toUpperCase()}</Text>
                <Text style={styles.budgetYear}>FY {budget.fiscal_year}</Text>
              </View>
              <Text style={styles.budgetProject}>{getProjectName(budget.project)}</Text>
              <Text style={styles.budgetDescription}>{budget.description}</Text>
              <View style={styles.budgetAmounts}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Allocated:</Text>
                  <Text style={styles.amountValue}>₹{(budget.allocated_amount / 1000000).toFixed(2)}M</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Spent:</Text>
                  <Text style={[styles.amountValue, { color: '#F44336' }]}>₹{(budget.spent_amount / 1000000).toFixed(2)}M</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Committed:</Text>
                  <Text style={styles.amountValue}>₹{(budget.committed_amount / 1000000).toFixed(2)}M</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Remaining:</Text>
                  <Text style={[styles.amountValue, { color: remaining > 0 ? '#4CAF50' : '#F44336' }]}>
                    ₹{(remaining / 1000000).toFixed(2)}M
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.addExpenseButton} 
                onPress={() => { setSelectedBudget(budget); setExpenseModalVisible(true); }}
              >
                <Text style={styles.addExpenseButtonText}>+ Add Expense</Text>
              </TouchableOpacity>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Spent: {spentPercent}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(spentPercent, 100)}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Budget</Text>
            <ScrollView>
              <Text style={styles.label}>Project *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.projectOption, budgetForm.project === project.id && styles.selectedProject]}
                    onPress={() => setBudgetForm({ ...budgetForm, project: project.id })}
                  >
                    <Text style={[styles.projectText, budgetForm.project === project.id && styles.selectedProjectText]}>
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryContainer}>
                {['materials', 'labor', 'equipment', 'overhead', 'other'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOption, budgetForm.category === cat && styles.selectedCategory]}
                    onPress={() => setBudgetForm({ ...budgetForm, category: cat })}
                  >
                    <Text style={[styles.categoryText, budgetForm.category === cat && styles.selectedCategoryText]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="Budget description"
                value={budgetForm.description}
                onChangeText={(text) => setBudgetForm({ ...budgetForm, description: text })}
              />

              <Text style={styles.label}>Allocated Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={budgetForm.allocated_amount}
                onChangeText={(text) => setBudgetForm({ ...budgetForm, allocated_amount: text })}
              />

              <Text style={styles.label}>Fiscal Year *</Text>
              <TextInput
                style={styles.input}
                placeholder="2024"
                keyboardType="numeric"
                value={budgetForm.fiscal_year.toString()}
                onChangeText={(text) => setBudgetForm({ ...budgetForm, fiscal_year: parseInt(text) || new Date().getFullYear() })}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={createBudget}>
                <Text style={styles.submitButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={expenseModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.expenseModalContent}>
              <Text style={styles.expenseModalTitle}>Add Expense</Text>
              {selectedBudget && (
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetInfoText}>{selectedBudget.category.toUpperCase()}</Text>
                  <Text style={styles.budgetInfoSubtext}>{getProjectName(selectedBudget.project)}</Text>
                  <Text style={styles.budgetInfoSubtext}>Current: ₹{(selectedBudget.spent_amount / 1000000).toFixed(2)}M</Text>
                </View>
              )}
              <Text style={styles.expenseLabel}>Amount *</Text>
              <TextInput
                style={styles.expenseInput}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
              />
              <View style={styles.expenseActions}>
                <TouchableOpacity 
                  style={styles.expenseCancelButton} 
                  onPress={() => { setExpenseModalVisible(false); setExpenseAmount(''); setSelectedBudget(null); }}
                >
                  <Text style={styles.expenseCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.expenseSubmitButton} onPress={addExpense}>
                  <Text style={styles.expenseSubmitText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9fc", padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  addButton: { backgroundColor: "#004AAD", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#004AAD" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 5 },
  budgetsList: { flex: 1 },
  budgetCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCategory: { fontSize: 14, fontWeight: "bold", color: "#004AAD" },
  budgetYear: { fontSize: 12, color: "#666" },
  budgetProject: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 4 },
  budgetDescription: { fontSize: 14, color: "#666", marginBottom: 12 },
  budgetAmounts: { marginBottom: 12 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  amountLabel: { fontSize: 13, color: "#666" },
  amountValue: { fontSize: 13, fontWeight: "600", color: "#003366" },
  progressContainer: { marginTop: 8 },
  progressLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  progressBar: { height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "90%", maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#003366", marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#003366", marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#dce3f0", fontSize: 14, marginBottom: 10 },
  projectScroll: { maxHeight: 30, marginBottom: 10 },
  projectOption: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, marginRight: 6, height: 26 },
  selectedProject: { backgroundColor: "#004AAD", borderColor: "#004AAD" },
  projectText: { fontSize: 12, color: "#666" },
  selectedProjectText: { color: "#fff", fontWeight: '600' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  categoryOption: { backgroundColor: "#f5f5f5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  selectedCategory: { backgroundColor: "#004AAD" },
  categoryText: { fontSize: 12, color: "#666" },
  selectedCategoryText: { color: "#fff", fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelButton: { flex: 0.48, backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: "#666", fontWeight: "600" },
  submitButton: { flex: 0.48, backgroundColor: "#004AAD", padding: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: "#fff", fontWeight: "600" },
  addExpenseButton: { backgroundColor: "#FF9800", padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  addExpenseButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  expenseModalContent: { 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    padding: 20, 
    width: 300,
    alignSelf: 'center'
  },
  expenseModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 15,
    textAlign: 'center'
  },
  budgetInfo: { 
    backgroundColor: "#f5f9fc", 
    padding: 12, 
    borderRadius: 6, 
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#004AAD"
  },
  budgetInfoText: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#004AAD", 
    marginBottom: 4 
  },
  budgetInfoSubtext: { 
    fontSize: 12, 
    color: "#666", 
    marginBottom: 2
  },
  expenseLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 8
  },
  expenseInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dce3f0",
    fontSize: 14,
    marginBottom: 15
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  expenseCancelButton: {
    flex: 0.48,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  expenseCancelText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14
  },
  expenseSubmitButton: {
    flex: 0.48,
    backgroundColor: "#004AAD",
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  expenseSubmitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
});
