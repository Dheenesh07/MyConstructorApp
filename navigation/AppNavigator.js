 
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AdminDashboard from "../screens/AdminDashboard";
import ProjectManagerDashboard from "../screens/ProjectManagerDashboard";
import EngineerDashboard from "../screens/EngineerDashboard";
import ForemanDashboard from "../screens/ForemanDashboard";
import SubcontractorDashboard from "../screens/SubcontractorDashboard";
import WorkerDashboard from "../screens/WorkerDashboard";
import SafetyOfficerDashboard from "../screens/SafetyOfficerDashboard";
import QualityInspectorDashboard from "../screens/QualityInspectorDashboard";  
import ProjectManagement from "./screens/ProjectManagement";
import TaskAssignment from "./screens/TaskAssignment";
import DocumentManagement from "./screens/DocumentManagement";
import BudgetFinancials from "./screens/BudgetFinancials";
import PurchaseOrders from "./screens/PurchaseOrders";
import VendorProcurement from "./screens/VendorProcurement";
import ReportsAnalytics from "./screens/ReportsAnalytics";
import UserManagement from "./screens/UserManagement";
import EquipmentInventory from "./screens/EquipmentInventory";
import SafetyCompliance from "./screens/SafetyCompliance";
import CommunicationCenter from "./screens/CommunicationCenter";
import Settings from "./screens/Settings";
import InvoiceManagement from "./screens/InvoiceManagement";
import MaterialRequests from "./screens/MaterialRequests";
import Documents from "./screens/Documents";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
 
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#003366" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }} 
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ title: "Sign Up" }} 
        />

        {/* Role-based Dashboards */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ 
            title: "🏗️ Admin Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="ProjectManagerDashboard"
          component={ProjectManagerDashboard}
          options={{ 
            title: "📋 Project Manager Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="EngineerDashboard"
          component={EngineerDashboard}
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="ForemanDashboard"
          component={ForemanDashboard}
          options={{ 
            title: "👷♂️ Foreman Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="SubcontractorDashboard"
          component={SubcontractorDashboard}
          options={{ 
            title: "🔧 Subcontractor Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="WorkerDashboard"
          component={WorkerDashboard}
          options={{ 
            title: "👷 Worker Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="SafetyOfficerDashboard"
          component={SafetyOfficerDashboard}
          options={{ 
            title: "🦺 Safety Officer Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="QualityInspectorDashboard"
          component={QualityInspectorDashboard}
          options={{ 
            title: "🔍 Quality Inspector Dashboard",
            headerLeft: () => null,
            gestureEnabled: false
          }}
        />

        {/* Admin Pages */}
        <Stack.Screen
          name="ProjectManagement"
          component={ProjectManagement}
          options={{ title: "Project Management" }}
        />
        <Stack.Screen
          name="TaskAssignment"
          component={TaskAssignment}
          options={{ title: "Task Assignment" }}
        />
        <Stack.Screen
          name="DocumentManagement"
          component={DocumentManagement}
          options={{ title: "Document Management" }}
        />
        <Stack.Screen
          name="BudgetFinancials"
          component={BudgetFinancials}
          options={{ title: "Budget & Financials" }}
        />
        <Stack.Screen
          name="PurchaseOrders"
          component={PurchaseOrders}
          options={{ title: "Purchase Orders" }}
        />
        <Stack.Screen
          name="VendorProcurement"
          component={VendorProcurement}
          options={{ title: "Vendor & Procurement" }}
        />
        <Stack.Screen
          name="ReportsAnalytics"
          component={ReportsAnalytics}
          options={{ title: "Reports & Analytics" }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagement}
          options={{ title: "User Management" }}
        />
        <Stack.Screen
          name="EquipmentInventory"
          component={EquipmentInventory}
          options={{ title: "Equipment & Inventory" }}
        />
        <Stack.Screen
          name="SafetyCompliance"
          component={SafetyCompliance}
          options={{ title: "Safety & Compliance" }}
        />
        <Stack.Screen
          name="CommunicationCenter"
          component={CommunicationCenter}
          options={{ title: "Communication Center" }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ title: "Settings" }}
        />
        <Stack.Screen
          name="InvoiceManagement"
          component={InvoiceManagement}
          options={{ title: "Invoice Management" }}
        />
        <Stack.Screen
          name="MaterialRequests"
          component={MaterialRequests}
          options={{ title: "Material Requests" }}
        />
        <Stack.Screen
          name="Documents"
          component={Documents}
          options={{ title: "Documents" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
