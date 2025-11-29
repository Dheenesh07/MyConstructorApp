import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { projectAPI } from "../../utils/api";

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
    try {
      const response = await projectAPI.getAll();
      setBudgets(response.data || []);
    } catch (error) {
      setBudgets([
        {
          id: 1,
          project_code: "PROJ001",
          name: "Downtown Office Complex",
          allocated_amount: 50000000,
          spent_amount: 15000000,
          committed_amount: 5000000,
          categories: [
            { category: "materials", allocated: 20000000, spent: 8000000, committed: 2000000 },
            { category: "labor", allocated: 15000000, spent: 5000000, committed: 2000000 },
            { category: "equipment", allocated: 10000000, spent: 2000000, committed: 1000000 },
            { category: "subcontractor", allocated: 3000000, spent: 0, committed: 0 },
            { category: "overhead", allocated: 2000000, spent: 0, committed: 0 }
          ]
        },
        {
          id: 2,
          project_code: "PROJ002",
          name: "Luxury Apartments",
          allocated_amount: 25000000,
          spent_amount: 12000000,
          committed_amount: 3000000,
          categories: [
            { category: "materials", allocated: 12000000, spent: 7000000, committed: 1500000 },
            { category: "labor", allocated: 8000000, spent: 3500000, committed: 1000000 },
            { category: "equipment", allocated: 3000000, spent: 1500000, committed: 500000 },
            { category: "overhead", allocated: 2000000, spent: 0, committed: 0 }
          ]
        }
      ]);
      
      setExpenses([
        { id: 1, project_id: 1, category: "materials", amount: 50000, description: "Concrete delivery", date: "2024-03-15", vendor: "ABC Materials" },
        { id: 2, project_id: 1, category: "labor", amount: 25000, description: "Weekly payroll", date: "2024-03-18", vendor: "Construction Crew" },
        { id: 3, project_id: 2, category: "equipment", amount: 15000, description: "Crane rental", date: "2024-03-20", vendor: "Heavy Equipment Co" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    const expense = {
      id: expenses.length + 1,
      project_id: 1, // Default to first project
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      vendor: 'Manual Entry'
    };
    
    setExpenses([...expenses, expense]);
    
    // Update budget spent amount
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === 1) {
        return {
          ...budget,
          spent_amount: budget.spent_amount + expense.amount,
          categories: budget.categories.map(cat => 
            cat.category === expense.category 
              ? { ...cat, spent: cat.spent + expense.amount }
              : cat
          )
        };
      }
      return budget;
    });
    setBudgets(updatedBudgets);
    
    Alert.alert("Success", "Expense added successfully");
    setModalVisible(false);
    setNewExpense({
      project_id: '',
      category: 'materials',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
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
            <Text style={styles.budgetValue}>${project.allocated_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={[styles.budgetValue, { color: '#dc3545' }]}>
              ${project.spent_amount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Committed</Text>
            <Text style={[styles.budgetValue, { color: '#ffc107' }]}>
              ${project.committed_amount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetValue, { color: '#28a745' }]}>
              ${getRemainingAmount(project.allocated_amount, project.spent_amount, project.committed_amount)?.toLocaleString()}
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
                    <Text style={styles.categoryAmount}>Allocated: ${category.allocated?.toLocaleString()}</Text>
                    <Text style={[styles.categoryAmount, { color: '#dc3545' }]}>Spent: ${category.spent?.toLocaleString()}</Text>
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
        <Text style={styles.title}>💰 Budget & Financials</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {budgets.map(renderBudgetCard)}
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
                <Text style={styles.recentExpenseAmount}>${expense.amount?.toLocaleString()}</Text>
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
});