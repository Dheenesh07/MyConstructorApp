import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from "react-native";

export default function PurchaseOrders({ navigation }) {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "PO-2024-001",
      vendor: "Steel Supply Co.",
      items: "Steel Beams (50 units)",
      amount: 125000,
      status: "pending",
      date: "2024-03-15",
      deliveryDate: "2024-03-25"
    },
    {
      id: 2,
      orderNumber: "PO-2024-002",
      vendor: "Concrete Solutions",
      items: "Ready Mix Concrete (100 m³)",
      amount: 85000,
      status: "approved",
      date: "2024-03-18",
      deliveryDate: "2024-03-22"
    },
    {
      id: 3,
      orderNumber: "PO-2024-003",
      vendor: "Safety Equipment Ltd",
      items: "Safety Helmets & Vests",
      amount: 15000,
      status: "delivered",
      date: "2024-03-10",
      deliveryDate: "2024-03-20"
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newOrder, setNewOrder] = useState({
    vendor: '',
    items: '',
    amount: '',
    deliveryDate: ''
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

  const createOrder = () => {
    const newId = orders.length + 1;
    const orderNumber = `PO-2024-${String(newId).padStart(3, '0')}`;
    
    setOrders([...orders, {
      ...newOrder,
      id: newId,
      orderNumber,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(newOrder.amount)
    }]);
    
    Alert.alert("Success", "Purchase order created successfully");
    setModalVisible(false);
    setNewOrder({
      vendor: '',
      items: '',
      amount: '',
      deliveryDate: ''
    });
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    Alert.alert("Success", "Order status updated");
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.vendor}>{item.vendor}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.items}>{item.items}</Text>
      <Text style={styles.amount}>Amount: ${item.amount.toLocaleString()}</Text>
      
      <View style={styles.orderFooter}>
        <Text style={styles.dates}>
          Ordered: {item.date} | Delivery: {item.deliveryDate}
        </Text>
      </View>

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
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
        <Text style={styles.title}>🛒 Purchase Orders</Text>
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
          
          <TextInput
            style={styles.input}
            placeholder="Vendor Name"
            value={newOrder.vendor}
            onChangeText={(text) => setNewOrder({...newOrder, vendor: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Items Description"
            value={newOrder.items}
            onChangeText={(text) => setNewOrder({...newOrder, items: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Amount ($)"
            value={newOrder.amount}
            onChangeText={(text) => setNewOrder({...newOrder, amount: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Expected Delivery Date (YYYY-MM-DD)"
            value={newOrder.deliveryDate}
            onChangeText={(text) => setNewOrder({...newOrder, deliveryDate: text})}
          />

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
});