import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { projectAPI, budgetAPI } from "../../utils/api";

export default function BudgetFinancials({ navigation }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    project_id: '',
    category: 'materials',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      // Load projects
      const projectsResponse = await projectAPI.getAll();
      const projects = projectsResponse.data || [];
      
      // Load budgets/expenses from backend
      const budgetsResponse = await budgetAPI.getAll();
      const backendExpenses = budgetsResponse.data || [];
      
      // Map projects with budget data
      const projectsWithBudgets = projects.map(project => ({
        ...project,
        allocated_amount: project.total_budget || 0,
        spent_amount: project.actual_cost || 0,
        committed_amount: 0,
        categories: [
          { category: "materials", allocated: (project.total_budget || 0) * 0.4, spent: 0, committed: 0 },
          { category: "labor", allocated: (project.total_budget || 0) * 0.3, spent: 0, committed: 0 },
          { category: "equipment", allocated: (project.total_budget || 0) * 0.2, spent: 0, committed: 0 },
          { category: "overhead", allocated: (project.total_budget || 0) * 0.1, spent: 0, committed: 0 }
        ]
      }));
      
      setBudgets(projectsWithBudgets);
      setExpenses(backendExpenses);
      
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budget data from backend');
      setBudgets([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (!budgets || budgets.length === 0) {
      Alert.alert('Error', 'No projects available. Please create a project first.');
      return;
    }
    
    setLoading(true);
    try {
      const expenseData = {
        project: budgets[0].id,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        expense_date: newExpense.date,
        vendor: 'Manual Entry'
      };
      
      // Save to backend
      const response = await budgetAPI.create(expenseData);
      
      Alert.alert("Success", "Expense added successfully!");
      
      // Reload data from backend to show updated values
      await loadBudgets();
      setModalVisible(false);
      setNewExpense({
        project_id: '',
        category: 'materials',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', `Failed to add expense: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetProgress = (spent, allocated) => {
    return Math.round((spent / allocated) * 100);
  };
  
  const getRemainingAmount = (allocated, spent, committed) => {
    return allocated - spent - committed;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return '#28a745';
    if (percentage < 80) return '#ffc107';
    return '#dc3545';
  };

  const renderBudgetCard = (project) => {
    const progress = getBudgetProgress(project.spent, project.total_budget);
    const progressColor = getProgressColor(progress);

    return (
      <View key={project.id} style={styles.budgetCard}>
        <Text style={styles.projectName}>{project.name}</Text>
        
        <View style={styles.budgetSummary}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Allocated</Text>
            <Text style={styles.budgetValue}>₹{project.allocated_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={[styles.budgetValue, { color: '#dc3545' }]}>
              ₹{project.spent_amount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Committed</Text>
            <Text style={[styles.budgetValue, { color: '#ffc107' }]}>
              ₹{project.committed_amount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetValue, { color: '#28a745' }]}>
              ₹{getRemainingAmount(project.allocated_amount, project.spent_amount, project.committed_amount)?.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Budget Utilization</Text>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {getBudgetProgress(project.spent_amount, project.allocated_amount)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getBudgetProgress(project.spent_amount, project.allocated_amount)}%`, backgroundColor: progressColor }
              ]} 
            />
          </View>
        </View>

        {project.categories && (
          <View style={styles.expenseBreakdown}>
            <Text style={styles.expenseTitle}>Budget by Category</Text>
            {project.categories.map((category, index) => {
              const categoryProgress = getBudgetProgress(category.spent, category.allocated);
              const categoryColor = getProgressColor(categoryProgress);
              return (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.category.charAt(0).toUpperCase() + category.category.slice(1)}</Text>
                    <Text style={styles.categoryProgress}>{categoryProgress}%</Text>
                  </View>
                  <View style={styles.categoryAmounts}>
                    <Text style={styles.categoryAmount}>Allocated: ₹{category.allocated?.toLocaleString()}</Text>
                    <Text style={[styles.categoryAmount, { color: '#dc3545' }]}>Spent: ₹{category.spent?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${categoryProgress}%`, backgroundColor: categoryColor }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="cash" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Budget & Financials</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBudgets} />
        }
      >
        {budgets && budgets.length > 0 ? (
          budgets.map(renderBudgetCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No budget data available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadBudgets}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Expense</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={newExpense.amount}
            onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newExpense.description}
            onChangeText={(text) => setNewExpense({...newExpense, description: text})}
            multiline
          />

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category:</Text>
            {['materials', 'labor', 'equipment', 'subcontractor', 'overhead', 'contingency'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  newExpense.category === cat && styles.selectedCategory
                ]}
                onPress={() => setNewExpense({...newExpense, category: cat})}
              >
                <Text style={[
                  styles.categoryText,
                  newExpense.category === cat && styles.selectedCategoryText
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.recentExpenses}>
            <Text style={styles.expenseTitle}>Recent Expenses</Text>
            {expenses.slice(-3).map((expense) => (
              <View key={expense.id} style={styles.recentExpenseItem}>
                <View>
                  <Text style={styles.recentExpenseDesc}>{expense.description}</Text>
                  <Text style={styles.recentExpenseCategory}>{expense.category} • {expense.date}</Text>
                </View>
                <Text style={styles.recentExpenseAmount}>₹{expense.amount?.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={addExpense}>
              <Text style={styles.createButtonText}>Add Expense</Text>
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
  budgetCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: "#003366",
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  expenseBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 15,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  expenseCategory: {
    fontSize: 14,
    color: "#666",
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#003366",
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
  categoryContainer: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 10,
  },
  categoryOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: "#004AAD",
    borderColor: "#004AAD",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryText: {
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
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#003366',
  },
  categoryProgress: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  categoryAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 12,
    color: '#666',
  },
  recentExpenses: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  recentExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  recentExpenseDesc: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '500',
  },
  recentExpenseCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentExpenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});