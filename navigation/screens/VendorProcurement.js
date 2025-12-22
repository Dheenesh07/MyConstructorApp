import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { vendorAPI } from "../../utils/api";

const { width } = Dimensions.get("window");

export default function VendorProcurement() {
  const [vendors, setVendors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    vendor_code: '',
    vendor_type: 'supplier',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      setVendors([
        { id: 1, name: 'ABC Construction Materials', vendor_code: 'VEN001', vendor_type: 'supplier', contact_person: 'John Smith', email: 'john@abc.com', phone: '555-0101', address: '123 Main St', tax_id: 'TAX001', rating: 4.5, is_approved: true },
        { id: 2, name: 'Heavy Equipment Rentals', vendor_code: 'VEN002', vendor_type: 'equipment_rental', contact_person: 'Sarah Johnson', email: 'sarah@her.com', phone: '555-0102', address: '456 Oak Ave', tax_id: 'TAX002', rating: 4.2, is_approved: true }
      ]);
    }
  };

  const createVendor = async () => {
    if (!vendorForm.name || !vendorForm.vendor_code || !vendorForm.contact_person || !vendorForm.email) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    
    try {
      if (editingVendor) {
        await vendorAPI.update(editingVendor.id, vendorForm);
        Alert.alert('Success', 'Vendor updated successfully!');
      } else {
        await vendorAPI.create({...vendorForm, rating: 0, is_approved: false});
        Alert.alert('Success', 'Vendor created successfully!');
      }
      
      setModalVisible(false);
      setEditingVendor(null);
      setVendorForm({ name: '', vendor_code: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '', tax_id: '' });
      loadVendors();
    } catch (error) {
      Alert.alert('Error', 'Failed to save vendor');
    }
  };

  const editVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      name: vendor.name,
      vendor_code: vendor.vendor_code,
      vendor_type: vendor.vendor_type,
      contact_person: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      tax_id: vendor.tax_id
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="construct" size={24} color="#003366" />
          <Text style={styles.title}>Vendor & Procurement</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Vendor</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {vendors.map(vendor => (
          <View key={vendor.id} style={styles.vendorCard}>
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: vendor.is_approved ? '#4CAF50' : '#FF9800' }]}>
                <Text style={styles.statusText}>{vendor.is_approved ? 'Approved' : 'Pending'}</Text>
              </View>
            </View>
            <Text style={styles.vendorCode}>Code: {vendor.vendor_code}</Text>
            <Text style={styles.vendorType}>{vendor.vendor_type?.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.vendorContact}>Contact: {vendor.contact_person}</Text>
            <Text style={styles.vendorEmail}>Email: {vendor.email}</Text>
            <View style={styles.vendorActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => editVendor(vendor)}>
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</Text>
          
          <ScrollView style={styles.modalScrollView}>
            <TextInput
              style={styles.input}
              placeholder="Vendor Name *"
              value={vendorForm.name}
              onChangeText={(text) => setVendorForm({...vendorForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Vendor Code *"
              value={vendorForm.vendor_code}
              onChangeText={(text) => setVendorForm({...vendorForm, vendor_code: text})}
            />
            
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Vendor Type:</Text>
              {[{key: 'supplier', label: 'Material Supplier'}, {key: 'subcontractor', label: 'Subcontractor'}, {key: 'equipment_rental', label: 'Equipment Rental'}, {key: 'service_provider', label: 'Service Provider'}].map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typeOption, {
                    backgroundColor: vendorForm.vendor_type === type.key ? '#003366' : '#f5f5f5'
                  }]}
                  onPress={() => setVendorForm({...vendorForm, vendor_type: type.key})}
                >
                  <Text style={[styles.typeText, {
                    color: vendorForm.vendor_type === type.key ? '#fff' : '#666'
                  }]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Contact Person *"
              value={vendorForm.contact_person}
              onChangeText={(text) => setVendorForm({...vendorForm, contact_person: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={vendorForm.email}
              onChangeText={(text) => setVendorForm({...vendorForm, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={vendorForm.phone}
              onChangeText={(text) => setVendorForm({...vendorForm, phone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address"
              value={vendorForm.address}
              onChangeText={(text) => setVendorForm({...vendorForm, address: text})}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tax ID"
              value={vendorForm.tax_id}
              onChangeText={(text) => setVendorForm({...vendorForm, tax_id: text})}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              setModalVisible(false);
              setEditingVendor(null);
              setVendorForm({ name: '', vendor_code: '', vendor_type: 'supplier', contact_person: '', email: '', phone: '', address: '', tax_id: '' });
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createVendor}>
              <Text style={styles.createButtonText}>{editingVendor ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9fc" },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#004AAD", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  vendorCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#003366", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },
  vendorCode: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorType: { fontSize: 12, color: "#666", marginBottom: 4 },
  vendorContact: { fontSize: 12, color: "#666", marginBottom: 2 },
  vendorEmail: { fontSize: 12, color: "#666", marginBottom: 10 },
  vendorActions: { flexDirection: "row", justifyContent: "space-around" },
  actionBtn: { backgroundColor: "#003366", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { color: "#fff", fontSize: 12 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: "#f5f9fc" },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#003366", marginBottom: 20 },
  modalScrollView: { flex: 1 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
  textArea: { height: 80, textAlignVertical: "top" },
  typeContainer: { marginBottom: 15 },
  typeLabel: { fontSize: 16, color: "#003366", marginBottom: 5 },
  typeOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  typeText: { fontSize: 12 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: "#6c757d", padding: 15, borderRadius: 8, marginRight: 10, alignItems: "center" },
  cancelButtonText: { color: "#fff", fontWeight: "600" },
  createButton: { flex: 1, backgroundColor: "#004AAD", padding: 15, borderRadius: 8, marginLeft: 10, alignItems: "center" },
  createButtonText: { color: "#fff", fontWeight: "600" },
});