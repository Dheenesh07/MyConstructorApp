import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { invoiceAPI, vendorAPI, purchaseOrderAPI, projectAPI } from '../../utils/api';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    vendor: '',
    purchase_order: '',
    project: '',
    description: '',
    subtotal: '',
    tax_amount: '',
    total_amount: '',
    invoice_date: '',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInvoices(),
        loadVendors(),
        loadProjects(),
        loadPurchaseOrders()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      console.log('Invoices loaded:', response.data);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
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

  const loadPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderAPI.getAll();
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
  };

  const createInvoice = async () => {
    // Validate required fields
    if (!invoiceForm.invoice_number || !invoiceForm.vendor || !invoiceForm.project || 
        !invoiceForm.subtotal || !invoiceForm.tax_amount || !invoiceForm.total_amount ||
        !invoiceForm.invoice_date || !invoiceForm.due_date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(invoiceForm.invoice_date) || !dateRegex.test(invoiceForm.due_date)) {
      Alert.alert('Error', 'Dates must be in YYYY-MM-DD format (e.g., 2024-03-20)');
      return;
    }

    try {
      const data = {
        invoice_number: invoiceForm.invoice_number.trim(),
        vendor: parseInt(invoiceForm.vendor),
        purchase_order: invoiceForm.purchase_order ? parseInt(invoiceForm.purchase_order) : null,
        project: parseInt(invoiceForm.project),
        description: invoiceForm.description.trim() || '',
        subtotal: parseFloat(invoiceForm.subtotal),
        tax_amount: parseFloat(invoiceForm.tax_amount),
        total_amount: parseFloat(invoiceForm.total_amount),
        invoice_date: invoiceForm.invoice_date.trim(),
        due_date: invoiceForm.due_date.trim()
      };

      console.log('Creating invoice:', data);
      const response = await invoiceAPI.create(data);
      console.log('Invoice created:', response.data);
      
      Alert.alert('Success', 'Invoice created successfully!');
      setModalVisible(false);
      setInvoiceForm({
        invoice_number: '',
        vendor: '',
        purchase_order: '',
        project: '',
        description: '',
        subtotal: '',
        tax_amount: '',
        total_amount: '',
        invoice_date: '',
        due_date: ''
      });
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data || error);
      Alert.alert('Error', `Failed to create invoice: ${error.response?.data?.detail || error.message}`);
    }
  };

  const approveInvoice = async (invoice) => {
    try {
      const data = {
        status: 'approved',
        approved_by: 1 // Should be current user ID
      };
      console.log('Approving invoice:', invoice.id, data);
      await invoiceAPI.update(invoice.id, data);
      Alert.alert('Success', 'Invoice approved successfully!');
      loadInvoices();
    } catch (error) {
      console.error('Error approving invoice:', error);
      Alert.alert('Error', 'Failed to approve invoice');
    }
  };

  const markAsPaid = async (invoice) => {
    try {
      const data = {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      };
      console.log('Marking invoice as paid:', invoice.id, data);
      await invoiceAPI.update(invoice.id, data);
      Alert.alert('Success', 'Invoice marked as paid!');
      loadInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      Alert.alert('Error', 'Failed to mark invoice as paid');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'approved': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="document-text" size={24} color="#003366" />
          <Text style={styles.title}>Invoice Management</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                  <Text style={styles.statusText}>{invoice.status?.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.vendorName}>{getVendorName(invoice.vendor)}</Text>
              <Text style={styles.projectName}>Project: {getProjectName(invoice.project)}</Text>
              <Text style={styles.description}>{invoice.description}</Text>

              <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Subtotal:</Text>
                  <Text style={styles.amountValue}>₹{invoice.subtotal?.toLocaleString()}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Tax:</Text>
                  <Text style={styles.amountValue}>₹{invoice.tax_amount?.toLocaleString()}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{invoice.total_amount?.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.dateSection}>
                <Text style={styles.dateText}>Invoice Date: {invoice.invoice_date}</Text>
                <Text style={styles.dateText}>Due Date: {invoice.due_date}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectedInvoice(invoice);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                
                {invoice.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => approveInvoice(invoice)}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                )}
                
                {invoice.status === 'approved' && (
                  <TouchableOpacity 
                    style={styles.paidButton}
                    onPress={() => markAsPaid(invoice)}
                  >
                    <Text style={styles.paidButtonText}>Mark Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>Create your first invoice to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Invoice Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Invoice</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Invoice Number *"
              value={invoiceForm.invoice_number}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, invoice_number: text})}
            />

            <Text style={styles.label}>Vendor *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {vendors.map((vendor) => (
                <TouchableOpacity
                  key={vendor.id}
                  style={[
                    styles.selectorOption,
                    invoiceForm.vendor === vendor.id && styles.selectedOption
                  ]}
                  onPress={() => setInvoiceForm({...invoiceForm, vendor: vendor.id})}
                >
                  <Text style={[
                    styles.selectorText,
                    invoiceForm.vendor === vendor.id && styles.selectedText
                  ]}>
                    {vendor.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Project *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.selectorOption,
                    invoiceForm.project === project.id && styles.selectedOption
                  ]}
                  onPress={() => setInvoiceForm({...invoiceForm, project: project.id})}
                >
                  <Text style={[
                    styles.selectorText,
                    invoiceForm.project === project.id && styles.selectedText
                  ]}>
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Purchase Order (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {purchaseOrders.map((po) => (
                <TouchableOpacity
                  key={po.id}
                  style={[
                    styles.selectorOption,
                    invoiceForm.purchase_order === po.id && styles.selectedOption
                  ]}
                  onPress={() => setInvoiceForm({...invoiceForm, purchase_order: po.id})}
                >
                  <Text style={[
                    styles.selectorText,
                    invoiceForm.purchase_order === po.id && styles.selectedText
                  ]}>
                    {po.po_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description *"
              value={invoiceForm.description}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, description: text})}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Subtotal *"
              value={invoiceForm.subtotal}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, subtotal: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Tax Amount *"
              value={invoiceForm.tax_amount}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, tax_amount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Total Amount *"
              value={invoiceForm.total_amount}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, total_amount: text})}
              keyboardType="numeric"
            />

            <Text style={styles.helperText}>Invoice Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024-03-20"
              value={invoiceForm.invoice_date}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, invoice_date: text})}
            />

            <Text style={styles.helperText}>Due Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024-04-20"
              value={invoiceForm.due_date}
              onChangeText={(text) => setInvoiceForm({...invoiceForm, due_date: text})}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={createInvoice}
            >
              <Text style={styles.createButtonText}>Create Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Number:</Text>
                <Text style={styles.detailValue}>{selectedInvoice?.invoice_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedInvoice?.status) }]}>
                  <Text style={styles.statusText}>{selectedInvoice?.status?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vendor:</Text>
                <Text style={styles.detailValue}>{getVendorName(selectedInvoice?.vendor)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Project:</Text>
                <Text style={styles.detailValue}>{getProjectName(selectedInvoice?.project)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{selectedInvoice?.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subtotal:</Text>
                <Text style={styles.detailValue}>₹{selectedInvoice?.subtotal?.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tax:</Text>
                <Text style={styles.detailValue}>₹{selectedInvoice?.tax_amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.detailValueBold}>₹{selectedInvoice?.total_amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Date:</Text>
                <Text style={styles.detailValue}>{selectedInvoice?.invoice_date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{selectedInvoice?.due_date}</Text>
              </View>
              {selectedInvoice?.paid_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid Date:</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.paid_date}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003366',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  projectName: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  amountSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  viewButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#003366',
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  paidButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 10,
  },
  selector: {
    marginBottom: 15,
  },
  selectorOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedOption: {
    backgroundColor: '#003366',
  },
  selectorText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  detailsContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#003366',
    flex: 1,
    textAlign: 'right',
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    marginTop: 5,
  },
});
