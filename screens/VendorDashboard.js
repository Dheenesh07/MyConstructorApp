import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vendorAPI } from '../utils/api';

const { width } = Dimensions.get("window");

export default function VendorDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-width * 0.75));
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendorType, setSelectedVendorType] = useState("all");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [addVendorModalVisible, setAddVendorModalVisible] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    vendor_type: 'supplier',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });
  const navigation = useNavigation();

  const vendorTypes = [
    { value: 'all', label: 'All Vendors', icon: 'business', color: '#003366' },
    { value: 'supplier', label: 'Material Supplier', icon: 'cube', color: '#4CAF50' },
    { value: 'equipment_rental', label: 'Equipment Rental', icon: 'construct', color: '#FF9800' },
    { value: 'subcontractor', label: 'Subcontractor', icon: 'people', color: '#2196F3' },
    { value: 'service_provider', label: 'Service Provider', icon: 'settings', color: '#9C27B0' }
  ];

  useEffect(() => {
    loadUserData();
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, selectedVendorType]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
      // Fallback data with more vendors for demonstration
      setVendors([
        { id: 1, name: 'ABC Construction Materials', vendor_type: 'supplier', contact_person: 'John Smith', email: 'john@abc.com', phone: '555-0101', rating: 4.5, is_approved: true },
        { id: 2, name: 'Heavy Equipment Rentals Inc', vendor_type: 'equipment_rental', contact_person: 'Sarah Johnson', email: 'sarah@her.com', phone: '555-0102', rating: 4.2, is_approved: true },
        { id: 3, name: 'Steel Works Subcontractors', vendor_type: 'subcontractor', contact_person: 'Mike Wilson', email: 'mike@steelworks.com', phone: '555-0103', rating: 4.8, is_approved: true },
        { id: 4, name: 'Quality Testing Services', vendor_type: 'service_provider', contact_person: 'Lisa Chen', email: 'lisa@qts.com', phone: '555-0104', rating: 4.3, is_approved: false },
        { id: 5, name: 'Premium Concrete Supply', vendor_type: 'supplier', contact_person: 'David Brown', email: 'david@concrete.com', phone: '555-0105', rating: 4.6, is_approved: true }
      ]);
    }
  };

  const filterVendors = () => {
    if (selectedVendorType === 'all') {
      setFilteredVendors(vendors);
    } else {
      setFilteredVendors(vendors.filter(vendor => vendor.vendor_type === selectedVendorType));
    }
  };

  const toggleMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
      Animated.timing(menuAnim, {
        toValue: -width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuClick = (page) => {
    toggleMenu();
    setActivePage(page);
  };

  const addVendor = async () => {
    if (!newVendor.name || !newVendor.contact_person || !newVendor.email) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    try {
      const vendorData = {
        ...newVendor,
        vendor_code: `VEN${String(vendors.length + 1).padStart(3, '0')}`,
        rating: 0,
        is_approved: false
      };
      
      const response = await vendorAPI.create(vendorData);
      setVendors([...vendors, response.data]);
      setNewVendor({ name: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '' });
      setAddVendorModalVisible(false);
      Alert.alert('Success', 'Vendor added successfully');
    } catch (error) {
      console.error('Error adding vendor:', error);
      Alert.alert('Error', 'Failed to add vendor');
    }
  };

  const getVendorTypeLabel = (type) => {
    const vendorType = vendorTypes.find(vt => vt.value === type);
    return vendorType ? vendorType.label : type;
  };

  const getVendorTypeColor = (type) => {
    const vendorType = vendorTypes.find(vt => vt.value === type);
    return vendorType ? vendorType.color : '#666';
  };

  const renderContent = () => {
    switch (activePage) {
      case "Vendor Management":
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>🏢 Vendor Management</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setAddVendorModalVisible(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Vendor</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {vendorTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterButton,
                    { backgroundColor: selectedVendorType === type.value ? type.color : '#f5f5f5' }
                  ]}
                  onPress={() => setSelectedVendorType(type.value)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={16} 
                    color={selectedVendorType === type.value ? '#fff' : type.color} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    { color: selectedVendorType === type.value ? '#fff' : type.color }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {filteredVendors.length > 0 ? (
              filteredVendors.map(vendor => (
                <View key={vendor.id} style={styles.vendorCard}>
                  <View style={styles.vendorHeader}>
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorName}>{vendor.name}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: getVendorTypeColor(vendor.vendor_type) }]}>
                        <Text style={styles.typeBadgeText}>{getVendorTypeLabel(vendor.vendor_type)}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: vendor.is_approved ? '#4CAF50' : '#FF9800'
                    }]}>
                      <Text style={styles.statusText}>{vendor.is_approved ? 'Approved' : 'Pending'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.vendorDetails}>
                    <View style={styles.vendorDetailRow}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.vendorDetailText}>{vendor.contact_person}</Text>
                    </View>
                    <View style={styles.vendorDetailRow}>
                      <Ionicons name="mail-outline" size={16} color="#666" />
                      <Text style={styles.vendorDetailText}>{vendor.email}</Text>
                    </View>
                    <View style={styles.vendorDetailRow}>
                      <Ionicons name="call-outline" size={16} color="#666" />
                      <Text style={styles.vendorDetailText}>{vendor.phone}</Text>
                    </View>
                    <View style={styles.vendorDetailRow}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.vendorDetailText}>Rating: {vendor.rating}/5.0</Text>
                    </View>
                  </View>
                  
                  <View style={styles.vendorActions}>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No Vendors Found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedVendorType === 'all' 
                    ? 'No vendors have been added yet. Click "Add Vendor" to get started.' 
                    : `No ${getVendorTypeLabel(selectedVendorType).toLowerCase()} vendors found.`
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        );

      default:
        return (
          <ScrollView style={styles.fullContainer}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.welcome}>🏢 Welcome to Vendor Portal</Text>
              <Text style={styles.subtitle}>Beemji Construction - Vendor Management</Text>
              <Text style={styles.dateTime}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            
            <View style={styles.statsContainer}>
              {vendorTypes.slice(1).map((type) => {
                const count = vendors.filter(v => v.vendor_type === type.value).length;
                return (
                  <View key={type.value} style={[styles.statCard, { borderLeftColor: type.color }]}>
                    <Ionicons name={type.icon} size={24} color={type.color} />
                    <Text style={styles.statNumber}>{count}</Text>
                    <Text style={styles.statLabel}>{type.label}</Text>
                  </View>
                );
              })}
            </View>
            
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <FlatList
              data={[
                { title: "🏢 Vendor Management", count: `${vendors.length} vendors` },
                { title: "📊 Performance Reports", count: "View analytics" },
                { title: "💰 Payment Management", count: "Process payments" },
                { title: "📋 Contract Management", count: "Manage contracts" },
              ]}
              numColumns={2}
              keyExtractor={(item) => item.title}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dashboardCard}
                  onPress={() => setActivePage(item.title.replace(/^[^ ]+\\s/, ""))}
                >
                  <Text style={styles.cardText}>{item.title}</Text>
                  <Text style={styles.cardCount}>{item.count}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.cardContainer}
              scrollEnabled={false}
            />
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activePage === "Dashboard" ? "Vendor Dashboard" : activePage}
        </Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {/* Add Vendor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addVendorModalVisible}
        onRequestClose={() => setAddVendorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vendor</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Vendor Name *"
              value={newVendor.name}
              onChangeText={(text) => setNewVendor({...newVendor, name: text})}
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Vendor Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vendorTypes.slice(1).map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      { backgroundColor: newVendor.vendor_type === type.value ? type.color : '#f5f5f5' }
                    ]}
                    onPress={() => setNewVendor({...newVendor, vendor_type: type.value})}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      { color: newVendor.vendor_type === type.value ? '#fff' : type.color }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Contact Person *"
              value={newVendor.contact_person}
              onChangeText={(text) => setNewVendor({...newVendor, contact_person: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={newVendor.email}
              onChangeText={(text) => setNewVendor({...newVendor, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newVendor.phone}
              onChangeText={(text) => setNewVendor({...newVendor, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address"
              value={newVendor.address}
              onChangeText={(text) => setNewVendor({...newVendor, address: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setAddVendorModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addVendor}>
                <Text style={styles.saveButtonText}>Add Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Ionicons name="log-out-outline" size={48} color="#FF6B6B" style={{ alignSelf: 'center', marginBottom: 15 }} />
            <Text style={styles.logoutModalTitle}>Confirm Logout</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.logoutModalActions}>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.cancelLogoutButton]} 
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelLogoutText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.confirmLogoutButton]} 
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('token');
                    setLogoutModalVisible(false);
                    navigation.navigate('Login');
                  } catch (error) {
                    console.error('Error during logout:', error);
                    setLogoutModalVisible(false);
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={styles.confirmLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.userProfileSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase() || 'V'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name || user?.username || 'Vendor'}</Text>
            <Text style={styles.userRole}>VENDOR MANAGER</Text>
          </View>
        </View>
        <View style={styles.menuDivider} />
        
        {[
          { title: "Dashboard", icon: "home" },
          { title: "Vendor Management", icon: "business" },
          { title: "Performance Reports", icon: "bar-chart" },
          { title: "Payment Management", icon: "card" },
          { title: "Contract Management", icon: "document-text" }
        ].map((item) => (
          <TouchableOpacity key={item.title} onPress={() => handleMenuClick(item.title)} style={[styles.menuItem, activePage === item.title && styles.activeMenuItem]}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={activePage === item.title ? item.icon : `${item.icon}-outline`} size={20} color={activePage === item.title ? "#fff" : "#003366"} />
            </View>
            <Text style={[styles.menuText, activePage === item.title && styles.activeMenuText]}>{item.title}</Text>
            {activePage === item.title && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
        
        <View style={styles.menuDivider} />
        <TouchableOpacity onPress={() => { toggleMenu(); setLogoutModalVisible(true); }} style={styles.logoutMenuItem}>
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          </View>
          <Text style={styles.logoutMenuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", padding: 15 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  content: { flex: 1 },
  fullContainer: { flex: 1, backgroundColor: "#f4f7fc" },
  
  dashboardHeader: { padding: 20, alignItems: "center" },
  welcome: { fontSize: 24, fontWeight: "700", color: "#003366" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" },
  dateTime: { fontSize: 14, color: "#999", marginTop: 4, textAlign: "center" },
  
  statsContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 15, margin: 5, alignItems: "center", elevation: 2, borderLeftWidth: 4, minWidth: width / 2.5 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#003366", marginTop: 5 },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4, textAlign: "center" },
  
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#003366", paddingHorizontal: 20, marginBottom: 10 },
  
  cardContainer: { paddingHorizontal: 10 },
  dashboardCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, margin: 10, elevation: 3, width: width / 2.4, alignItems: "center" },
  cardText: { fontSize: 14, color: "#003366", fontWeight: "600", textAlign: "center" },
  cardCount: { fontSize: 12, color: "#666", marginTop: 5 },
  
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontSize: 14, marginLeft: 5 },
  
  filterContainer: { paddingHorizontal: 20, marginBottom: 15 },
  filterButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  filterButtonText: { fontSize: 12, marginLeft: 5, fontWeight: "500" },
  
  vendorCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 15, elevation: 2 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 5 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  
  vendorDetails: { marginBottom: 15 },
  vendorDetailRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  vendorDetailText: { fontSize: 12, color: "#666", marginLeft: 8 },
  
  vendorActions: { flexDirection: "row", justifyContent: "space-around" },
  viewButton: { backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  editButton: { backgroundColor: "#FF9800", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  editButtonText: { color: "#fff", fontSize: 12 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: width * 0.9, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#003366", marginBottom: 15, textAlign: "center" },
  
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: "top" },
  
  pickerContainer: { marginBottom: 15 },
  pickerLabel: { fontSize: 14, color: "#003366", marginBottom: 8 },
  typeOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  typeOptionText: { fontSize: 12, fontWeight: "500" },
  
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  cancelButton: { flex: 0.45, backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, alignItems: "center" },
  cancelButtonText: { color: "#666", fontSize: 14 },
  saveButton: { flex: 0.45, backgroundColor: "#003366", padding: 12, borderRadius: 8, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 14 },
  
  // Menu styles
  sideMenu: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: "#fff", paddingTop: 50, elevation: 8, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, zIndex: 2 },
  userProfileSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20, backgroundColor: "#f8f9fa" },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#003366", alignItems: "center", justifyContent: "center", marginRight: 15 },
  userAvatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#003366", marginBottom: 2 },
  userRole: { fontSize: 12, color: "#666" },
  menuDivider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 10, borderRadius: 8, position: "relative" },
  activeMenuItem: { backgroundColor: "#003366" },
  menuIconContainer: { width: 24, alignItems: "center" },
  menuText: { marginLeft: 15, fontSize: 15, color: "#003366", fontWeight: "500" },
  activeMenuText: { color: "#fff" },
  activeIndicator: { position: "absolute", right: 0, top: "50%", marginTop: -10, width: 3, height: 20, backgroundColor: "#fff", borderRadius: 2 },
  logoutMenuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8, backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#ffe0e0" },
  logoutIconContainer: { width: 24, alignItems: "center" },
  logoutMenuText: { marginLeft: 15, fontSize: 15, color: "#FF6B6B", fontWeight: "500" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1 },
  
  // Logout modal styles
  logoutModalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: width * 0.85, alignItems: "center" },
  logoutModalTitle: { fontSize: 20, fontWeight: "600", color: "#003366", marginBottom: 8, textAlign: "center" },
  logoutModalMessage: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  logoutModalActions: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
  logoutModalButton: { flex: 0.48, borderRadius: 8, padding: 12, alignItems: "center" },
  cancelLogoutButton: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#ddd" },
  confirmLogoutButton: { backgroundColor: "#FF6B6B" },
  cancelLogoutText: { color: "#666", fontSize: 14, fontWeight: "500" },
  confirmLogoutText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  
  // Empty state styles
  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateTitle: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 15, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: "#999", textAlign: "center", lineHeight: 20 },
});