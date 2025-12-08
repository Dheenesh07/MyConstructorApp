import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { vendorAPI } from './utils/api';

export default function VendorTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Test 1: Get all vendors
  const testGetVendors = async () => {
    setLoading(true);
    try {
      const response = await vendorAPI.getAll();
      setResult(`✅ GET Success!\nFound ${response.data.length} vendors:\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`❌ GET Failed:\n${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Create Steel Supplier
  const testCreateSteel = async () => {
    setLoading(true);
    try {
      const data = {
        name: "Steel Supply Co.",
        vendor_code: "SSC001",
        vendor_type: "supplier",
        contact_person: "Mike Johnson",
        email: "mike@steelsupply.com",
        phone: "+1987654321",
        address: "123 Industrial Ave, Steel City",
        tax_id: "TAX123456",
        rating: 4.5,
        is_approved: true
      };
      const response = await vendorAPI.create(data);
      setResult(`✅ Steel Supplier Created!\n${JSON.stringify(response.data, null, 2)}`);
      Alert.alert('Success', 'Steel supplier created!');
    } catch (error) {
      setResult(`❌ Create Failed:\n${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Create Concrete Supplier
  const testCreateConcrete = async () => {
    setLoading(true);
    try {
      const data = {
        name: "Concrete Masters Inc.",
        vendor_code: "CMI001",
        vendor_type: "supplier",
        contact_person: "Sarah Wilson",
        email: "sarah@concretemasters.com",
        phone: "+1555777888",
        address: "456 Concrete Blvd, Mix City",
        tax_id: "TAX789012",
        rating: 4.8,
        is_approved: true
      };
      const response = await vendorAPI.create(data);
      setResult(`✅ Concrete Supplier Created!\n${JSON.stringify(response.data, null, 2)}`);
      Alert.alert('Success', 'Concrete supplier created!');
    } catch (error) {
      setResult(`❌ Create Failed:\n${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Create Equipment Rental
  const testCreateEquipment = async () => {
    setLoading(true);
    try {
      const data = {
        name: "Heavy Equipment Rentals",
        vendor_code: "HER001",
        vendor_type: "equipment_rental",
        contact_person: "Bob Martinez",
        email: "bob@heavyequipment.com",
        phone: "+1333444555",
        address: "789 Equipment Way, Rental City",
        tax_id: "TAX345678",
        rating: 4.2,
        is_approved: true
      };
      const response = await vendorAPI.create(data);
      setResult(`✅ Equipment Rental Created!\n${JSON.stringify(response.data, null, 2)}`);
      Alert.alert('Success', 'Equipment rental created!');
    } catch (error) {
      setResult(`❌ Create Failed:\n${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Vendor API Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="1. Get All Vendors" onPress={testGetVendors} disabled={loading} />
        <Button title="2. Create Steel Supplier" onPress={testCreateSteel} disabled={loading} color="#28a745" />
        <Button title="3. Create Concrete Supplier" onPress={testCreateConcrete} disabled={loading} color="#28a745" />
        <Button title="4. Create Equipment Rental" onPress={testCreateEquipment} disabled={loading} color="#28a745" />
      </View>

      <Text style={styles.instructions}>
        📋 Instructions:{'\n'}
        1. First click "Get All Vendors" to see existing vendors{'\n'}
        2. Click create buttons to add new vendors{'\n'}
        3. Click "Get All Vendors" again to verify they were saved{'\n'}
        {'\n'}
        ✅ = Success | ❌ = Failed
      </Text>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{result || 'Click a button to test...'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
  },
  resultText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
