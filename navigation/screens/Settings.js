import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from "@react-navigation/native";

export default function Settings() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    locationTracking: false,
    safetyAlerts: true,
    weeklyReports: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearCache = async () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached data?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully");
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert("Export Data", "Data export feature will be available soon");
  };

  const logout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Logout error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, subtitle, value, onToggle, type = "switch" }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === "switch" && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#767577", true: "#004AAD" }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      )}
      {type === "arrow" && (
        <Text style={styles.arrow}>›</Text>
      )}
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <SectionHeader title="Notifications" />
      <View style={styles.section}>
        <SettingItem
          title="Push Notifications"
          subtitle="Receive notifications for important updates"
          value={settings.notifications}
          onToggle={() => toggleSetting('notifications')}
        />
        <SettingItem
          title="Safety Alerts"
          subtitle="Get notified about safety incidents"
          value={settings.safetyAlerts}
          onToggle={() => toggleSetting('safetyAlerts')}
        />
        <SettingItem
          title="Weekly Reports"
          subtitle="Receive weekly project summary reports"
          value={settings.weeklyReports}
          onToggle={() => toggleSetting('weeklyReports')}
        />
      </View>

      <SectionHeader title="App Preferences" />
      <View style={styles.section}>
        <SettingItem
          title="Dark Mode"
          subtitle="Use dark theme for the app"
          value={settings.darkMode}
          onToggle={() => toggleSetting('darkMode')}
        />
        <SettingItem
          title="Auto Sync"
          subtitle="Automatically sync data when connected"
          value={settings.autoSync}
          onToggle={() => toggleSetting('autoSync')}
        />
        <SettingItem
          title="Location Tracking"
          subtitle="Allow app to track your location for site check-ins"
          value={settings.locationTracking}
          onToggle={() => toggleSetting('locationTracking')}
        />
      </View>

      <SectionHeader title="Data Management" />
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionItem} onPress={clearCache}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Clear Cache</Text>
            <Text style={styles.actionSubtitle}>Free up storage space</Text>
          </View>
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={exportData}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Export Data</Text>
            <Text style={styles.actionSubtitle}>Download your data as CSV/PDF</Text>
          </View>
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title="About" />
      <View style={styles.section}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build Number</Text>
          <Text style={styles.infoValue}>2024.03.001</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>March 2024</Text>
        </View>
      </View>

      <SectionHeader title="Support" />
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Help & FAQ</Text>
            <Text style={styles.actionSubtitle}>Get help with common questions</Text>
          </View>
          <Text style={styles.actionIcon}>❓</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Contact Support</Text>
            <Text style={styles.actionSubtitle}>Get in touch with our support team</Text>
          </View>
          <Text style={styles.actionIcon}>📞</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Privacy Policy</Text>
            <Text style={styles.actionSubtitle}>Read our privacy policy</Text>
          </View>
          <Text style={styles.actionIcon}>🔒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#003366",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: "#ccc",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#003366",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionIcon: {
    fontSize: 20,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#003366",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  logoutSection: {
    marginTop: 30,
    marginBottom: 50,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});