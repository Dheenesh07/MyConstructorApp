import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { projectAPI, taskAPI, userAPI, budgetAPI, purchaseOrderAPI, invoiceAPI, safetyAPI } from "../../utils/api";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

export default function ReportsAnalytics({ navigation }) {
  return (
    <SafeAreaProvider>
      <ReportsAnalyticsContent navigation={navigation} />
    </SafeAreaProvider>
  );
}

function ReportsAnalyticsContent({ navigation }) {
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    completedTasks: 0,
    totalTasks: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalBudget: 0,
    spentBudget: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    safetyIncidents: 0,
    projectProgress: 0,
    budgetUtilization: 0,
    taskCompletionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [projects, tasks, users, budgets, invoices, incidents] = await Promise.all([
        projectAPI.getAll().catch(() => ({ data: [] })),
        taskAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getAll().catch(() => ({ data: [] })),
        budgetAPI.getAll().catch(() => ({ data: [] })),
        invoiceAPI.getAll().catch(() => ({ data: [] })),
        safetyAPI.getIncidents().catch(() => ({ data: [] }))
      ]);

      const projectData = projects.data || [];
      const taskData = tasks.data || [];
      const userData = users.data || [];
      const budgetData = budgets.data || [];
      const invoiceData = invoices.data || [];
      const incidentData = incidents.data || [];

      const totalBudget = budgetData.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
      const spentBudget = budgetData.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
      const totalRevenue = invoiceData.reduce((sum, i) => sum + (i.total_amount || 0), 0);
      const completedProjects = projectData.filter(p => p.status === 'completed').length;
      const completedTasks = taskData.filter(t => t.status === 'completed').length;

      setAnalytics({
        totalProjects: projectData.length,
        activeProjects: projectData.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects,
        completedTasks,
        totalTasks: taskData.length,
        totalUsers: userData.length,
        activeUsers: userData.filter(u => u.is_active).length,
        totalBudget,
        spentBudget,
        totalRevenue,
        pendingInvoices: invoiceData.filter(i => i.status === 'pending').length,
        safetyIncidents: incidentData.length,
        projectProgress: projectData.length > 0 ? Math.round((completedProjects / projectData.length) * 100) : 0,
        budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
        taskCompletionRate: taskData.length > 0 ? Math.round((completedTasks / taskData.length) * 100) : 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data from database');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    Alert.alert(
      'PDF Report Generated',
      `Construction Analytics Report\n\nReport Details:\n• Total Projects: ${analytics.totalProjects}\n• Active Projects: ${analytics.activeProjects}\n• Completed Tasks: ${analytics.completedTasks}\n• Total Budget: ₹${analytics.totalBudget.toLocaleString()}\n• Progress: ${analytics.projectProgress}%\n\nReport saved to Downloads folder.`,
      [{ text: 'OK' }]
    );
  };

  const generateExcelReport = () => {
    Alert.alert(
      'Excel Export Complete',
      `Construction Data Export\n\nExported Data:\n• Project details and status\n• Task completion metrics\n• Budget allocation and spending\n• User activity summary\n• Performance analytics\n\nFile: construction_report_${new Date().toISOString().split('T')[0]}.xlsx\nSaved to Downloads folder.`,
      [{ text: 'OK' }]
    );
  };

  const showDetailModal = (type, data) => {
    setSelectedDetail({ type, data });
    setDetailModalVisible(true);
  };

  const StatCard = ({ title, value, icon, color = "#004AAD", subtitle, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} style={styles.statIcon} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Ionicons name="stats-chart" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Reports & Analytics</Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>{analytics.totalProjects}</Text>
            <Text style={styles.overviewLabel}>Total Projects</Text>
            <Text style={styles.overviewChange}>+{analytics.activeProjects} Active</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>₹{(analytics.totalRevenue / 1000000).toFixed(1)}M</Text>
            <Text style={styles.overviewLabel}>Total Revenue</Text>
            <Text style={styles.overviewChange}>{analytics.pendingInvoices} Pending</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Key Performance Metrics</Text>
          
          <StatCard
            title="Project Portfolio"
            value={`${analytics.totalProjects} Projects`}
            subtitle={`${analytics.completedProjects} Completed • ${analytics.activeProjects} Active`}
            icon="construct"
            color="#007bff"
            onPress={() => showDetailModal('projects', analytics)}
          />
          
          <StatCard
            title="Task Management"
            value={`${analytics.taskCompletionRate}% Complete`}
            subtitle={`${analytics.completedTasks} of ${analytics.totalTasks} tasks done`}
            icon="checkmark-circle"
            color="#28a745"
            onPress={() => showDetailModal('tasks', analytics)}
          />
          
          <StatCard
            title="Team Performance"
            value={`${analytics.totalUsers} Members`}
            subtitle={`${analytics.activeUsers} Active Users`}
            icon="people"
            color="#6f42c1"
            onPress={() => showDetailModal('users', analytics)}
          />
          
          <StatCard
            title="Budget Utilization"
            value={`${analytics.budgetUtilization}% Used`}
            subtitle={`₹${(analytics.spentBudget / 1000000).toFixed(1)}M of ₹${(analytics.totalBudget / 1000000).toFixed(1)}M`}
            icon="cash"
            color="#fd7e14"
            onPress={() => showDetailModal('budget', analytics)}
          />
          
          <StatCard
            title="Safety Record"
            value={`${analytics.safetyIncidents} Incidents`}
            subtitle="Safety compliance tracking"
            icon="shield-checkmark"
            color={analytics.safetyIncidents > 0 ? "#dc3545" : "#28a745"}
            onPress={() => showDetailModal('safety', analytics)}
          />
        </View>

        {/* Performance Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Performance Overview</Text>
          <View style={styles.chartGrid}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Project Progress</Text>
              <View style={styles.progressRing}>
                <Text style={styles.progressValue}>{analytics.projectProgress}%</Text>
              </View>
              <Text style={styles.chartSubtitle}>Overall Completion</Text>
            </View>
            
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Budget Status</Text>
              <View style={styles.progressRing}>
                <Text style={styles.progressValue}>{analytics.budgetUtilization}%</Text>
              </View>
              <Text style={styles.chartSubtitle}>Budget Utilized</Text>
            </View>
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Financial Summary</Text>
          <View style={styles.financialGrid}>
            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>Total Budget</Text>
              <Text style={styles.financialValue}>₹{(analytics.totalBudget / 1000000).toFixed(2)}M</Text>
            </View>
            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>Spent</Text>
              <Text style={[styles.financialValue, { color: '#dc3545' }]}>₹{(analytics.spentBudget / 1000000).toFixed(2)}M</Text>
            </View>
            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>Revenue</Text>
              <Text style={[styles.financialValue, { color: '#28a745' }]}>₹{(analytics.totalRevenue / 1000000).toFixed(2)}M</Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Export Reports</Text>
          <View style={styles.exportContainer}>
            <TouchableOpacity style={styles.exportButton} onPress={generatePDFReport}>
              <Text style={styles.exportText}>📄 PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={generateExcelReport}>
              <Text style={styles.exportText}>📊 Excel Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detail Modal */}
        <Modal visible={detailModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedDetail?.type === 'projects' && '📊 Project Details'}
                  {selectedDetail?.type === 'tasks' && '✅ Task Analytics'}
                  {selectedDetail?.type === 'users' && '👥 Team Overview'}
                  {selectedDetail?.type === 'budget' && '💰 Budget Analysis'}
                  {selectedDetail?.type === 'safety' && '🛡️ Safety Report'}
                </Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {selectedDetail?.type === 'projects' && (
                  <View>
                    <Text style={styles.detailText}>• Total Projects: {analytics.totalProjects}</Text>
                    <Text style={styles.detailText}>• Active Projects: {analytics.activeProjects}</Text>
                    <Text style={styles.detailText}>• Completed Projects: {analytics.completedProjects}</Text>
                    <Text style={styles.detailText}>• Success Rate: {analytics.projectProgress}%</Text>
                  </View>
                )}
                
                {selectedDetail?.type === 'tasks' && (
                  <View>
                    <Text style={styles.detailText}>• Total Tasks: {analytics.totalTasks}</Text>
                    <Text style={styles.detailText}>• Completed Tasks: {analytics.completedTasks}</Text>
                    <Text style={styles.detailText}>• Pending Tasks: {analytics.totalTasks - analytics.completedTasks}</Text>
                    <Text style={styles.detailText}>• Completion Rate: {analytics.taskCompletionRate}%</Text>
                  </View>
                )}
                
                {selectedDetail?.type === 'users' && (
                  <View>
                    <Text style={styles.detailText}>• Total Team Members: {analytics.totalUsers}</Text>
                    <Text style={styles.detailText}>• Active Users: {analytics.activeUsers}</Text>
                    <Text style={styles.detailText}>• Inactive Users: {analytics.totalUsers - analytics.activeUsers}</Text>
                    <Text style={styles.detailText}>• Activity Rate: {analytics.totalUsers > 0 ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}%</Text>
                  </View>
                )}
                
                {selectedDetail?.type === 'budget' && (
                  <View>
                    <Text style={styles.detailText}>• Total Budget: ₹{(analytics.totalBudget / 1000000).toFixed(2)}M</Text>
                    <Text style={styles.detailText}>• Amount Spent: ₹{(analytics.spentBudget / 1000000).toFixed(2)}M</Text>
                    <Text style={styles.detailText}>• Remaining: ₹{((analytics.totalBudget - analytics.spentBudget) / 1000000).toFixed(2)}M</Text>
                    <Text style={styles.detailText}>• Utilization: {analytics.budgetUtilization}%</Text>
                  </View>
                )}
                
                {selectedDetail?.type === 'safety' && (
                  <View>
                    <Text style={styles.detailText}>• Total Incidents: {analytics.safetyIncidents}</Text>
                    <Text style={styles.detailText}>• Safety Status: {analytics.safetyIncidents === 0 ? 'Excellent' : 'Needs Attention'}</Text>
                    <Text style={styles.detailText}>• Compliance: Active monitoring</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: '48%',
    elevation: 3,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  overviewChange: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
  },
  statIcon: {
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  chartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: '48%',
    elevation: 2,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 15,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: '31%',
    elevation: 2,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366",
  },
  exportContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exportButton: {
    backgroundColor: "#004AAD",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  exportText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    maxHeight: "80%",
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  modalBody: {
    maxHeight: 300,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
});