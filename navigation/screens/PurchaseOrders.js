import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { purchaseOrderAPI, vendorAPI, projectAPI } from "../../utils/api";

export default function PurchaseOrders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, vendorsRes, projectsRes] = await Promise.all([
        purchaseOrderAPI.getAll(),
        vendorAPI.getAll(),
        projectAPI.getAll()
      ]);
      setOrders(ordersRes.data || []);
      setVendors(vendorsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [newOrder, setNewOrder] = useState({
    po_number: '',
    vendor: '',
    project: '',
    requested_by: '',
    description: '',
    total_amount: '',
    tax_amount: '',
    status: 'draft',
    order_date: '',
    expected_delivery_date: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const onOrderDateChange = (event, selectedDate) => {
    setShowOrderDatePicker(false);
    if (selectedDate) {
      setOrderDate(selectedDate);
      setNewOrder({
        ...newOrder,
        order_date: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const onDeliveryDateChange = (event, selectedDate) => {
    setShowDeliveryDatePicker(false);
    if (selectedDate) {
      setDeliveryDate(selectedDate);
      setNewOrder({
        ...newOrder,
        expected_delivery_date: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const createOrder = async () => {
    if (!newOrder.po_number || !newOrder.vendor || !newOrder.project) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      const payload = {
        po_number: newOrder.po_number,
        vendor: parseInt(newOrder.vendor),
        project: parseInt(newOrder.project),
        requested_by: parseInt(newOrder.requested_by) || 1,
        description: newOrder.description,
        total_amount: parseFloat(newOrder.total_amount) || 0,
        tax_amount: parseFloat(newOrder.tax_amount) || 0,
        status: newOrder.status,
        order_date: newOrder.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: newOrder.expected_delivery_date || null
      };
      console.log('Sending payload:', payload);
      const response = await purchaseOrderAPI.create(payload);
      setOrders([response.data, ...orders]);
      Alert.alert("Success", "Purchase order created and saved to database");
      setModalVisible(false);
      setNewOrder({
        po_number: '',
        vendor: '',
        project: '',
        requested_by: '',
        description: '',
        total_amount: '',
        tax_amount: '',
        status: 'draft',
        order_date: '',
        expected_delivery_date: ''
      });
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = JSON.stringify(error.response?.data) || error.message;
      Alert.alert('Error', errorMsg);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await purchaseOrderAPI.update(id, { status: newStatus });
      setOrders(prev => prev.map(order => 
        order.id === id ? response.data : order
      ));
      Alert.alert("Success", "Order status updated in database");
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.po_number}</Text>
          <Text style={styles.vendor}>{item.vendor_name || `Vendor #${item.vendor}`}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.items}>{item.description}</Text>
      <Text style={styles.amount}>Amount: ${item.total_amount?.toLocaleString()}</Text>
      
      <View style={styles.orderFooter}>
        <Text style={styles.dates}>
          Ordered: {item.order_date} | Delivery: {item.expected_delivery_date}
        </Text>
      </View>

      <View style={styles.orderActions}>
        {item.status === 'draft' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#28a745' }]}
              onPress={() => updateOrderStatus(item.id, 'approved')}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
              onPress={() => updateOrderStatus(item.id, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'approved' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#007bff' }]}
            onPress={() => updateOrderStatus(item.id, 'delivered')}
          >
            <Text style={styles.actionButtonText}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="cart" size={24} color="#003366" style={{marginRight: 8}} />
          <Text style={styles.title}>Purchase Orders</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New Order</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.filter(o => o.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.filter(o => o.status === 'approved').length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            ${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        style={styles.ordersList}
      />

      {/* Create Order Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create Purchase Order</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.input}
            placeholder="PO Number (e.g., PO2024001) *"
            value={newOrder.po_number}
            onChangeText={(text) => setNewOrder({...newOrder, po_number: text})}
          />
          
          <Text style={styles.inputLabel}>Select Vendor *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor.id}
                style={[styles.pickerOption, newOrder.vendor === vendor.id && styles.selectedPicker]}
                onPress={() => setNewOrder({...newOrder, vendor: vendor.id})}
              >
                <Text style={[styles.pickerText, newOrder.vendor === vendor.id && styles.selectedPickerText]}>
                  {vendor.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.inputLabel}>Select Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.pickerOption, newOrder.project === project.id && styles.selectedPicker]}
                onPress={() => setNewOrder({...newOrder, project: project.id})}
              >
                <Text style={[styles.pickerText, newOrder.project === project.id && styles.selectedPickerText]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TextInput
            style={styles.input}
            placeholder="Requested By (User ID)"
            value={newOrder.requested_by}
            onChangeText={(text) => setNewOrder({...newOrder, requested_by: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description *"
            value={newOrder.description}
            onChangeText={(text) => setNewOrder({...newOrder, description: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Total Amount ($) *"
            value={newOrder.total_amount}
            onChangeText={(text) => setNewOrder({...newOrder, total_amount: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Tax Amount ($)"
            value={newOrder.tax_amount}
            onChangeText={(text) => setNewOrder({...newOrder, tax_amount: text})}
            keyboardType="numeric"
          />
          
          <Text style={styles.inputLabel}>Status (Optional - defaults to draft)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {['draft', 'approved', 'delivered', 'cancelled'].map((statusOption) => (
              <TouchableOpacity
                key={statusOption}
                style={[styles.pickerOption, newOrder.status === statusOption && styles.selectedPicker]}
                onPress={() => setNewOrder({...newOrder, status: statusOption})}
              >
                <Text style={[styles.pickerText, newOrder.status === statusOption && styles.selectedPickerText]}>
                  {statusOption.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.dateSection}>
            <Text style={styles.inputLabel}>Order Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowOrderDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#003366" />
              <Text style={styles.dateButtonText}>
                {newOrder.order_date || 'Select Order Date'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateSection}>
            <Text style={styles.inputLabel}>Expected Delivery Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDeliveryDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#003366" />
              <Text style={styles.dateButtonText}>
                {newOrder.expected_delivery_date || 'Select Delivery Date'}
              </Text>
            </TouchableOpacity>
          </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createOrder}>
              <Text style={styles.createButtonText}>Create Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showOrderDatePicker && (
        <DateTimePicker
          value={orderDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onOrderDateChange}
        />
      )}

      {showDeliveryDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDeliveryDateChange}
        />
      )}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#004AAD",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  vendor: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  items: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
    marginBottom: 10,
  },
  orderFooter: {
    marginBottom: 15,
  },
  dates: {
    fontSize: 12,
    color: "#666",
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
    marginTop: 5,
  },
  pickerScroll: {
    flexGrow: 0,
    marginBottom: 15,
  },
  pickerOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPicker: {
    backgroundColor: '#004AAD',
    borderColor: '#004AAD',
  },
  pickerText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPickerText: {
    color: '#fff',
    fontWeight: '600',
  },
  dateSection: {
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});