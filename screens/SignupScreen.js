import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../utils/api';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'worker',
    employee_id: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigation = useNavigation();

  const roles = [
    { value: 'admin', label: 'Admin', icon: 'settings' },
    { value: 'project_manager', label: 'Project Manager', icon: 'briefcase' },
    { value: 'site_engineer', label: 'Site Engineer', icon: 'construct' },
    { value: 'foreman', label: 'Foreman', icon: 'people' },
    { value: 'worker', label: 'Construction Worker', icon: 'hammer' },
    { value: 'subcontractor', label: 'Subcontractor', icon: 'business' },
    { value: 'safety_officer', label: 'Safety Officer', icon: 'shield-checkmark' },
    { value: 'quality_inspector', label: 'Quality Inspector', icon: 'checkmark-circle' }
  ];

  const handleSignup = async () => {
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.phone.length < 10 || formData.phone.length > 15) {
      Alert.alert('Error', 'Phone number must be between 10-15 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      // Add phone as required field
      signupData.phone = formData.phone;
      if (formData.employee_id) signupData.employee_id = formData.employee_id;
      if (formData.department) signupData.department = formData.department;
      
      console.log('Sending signup data:', signupData);
      const response = await authAPI.register(signupData);
      console.log('Signup response:', response.data);

      // Show success modal with animation
      setSuccessModalVisible(true);
      
      // Auto-navigate after 3 seconds
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.navigate('Login');
      }, 3000);
    } catch (error) {
      console.error('Signup error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Handle field-specific errors
          const fieldErrors = Object.values(error.response.data).flat();
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time password matching check
    if (field === 'confirmPassword') {
      setPasswordMatch(formData.password === value);
    }
    if (field === 'password' && formData.confirmPassword) {
      setPasswordMatch(value === formData.confirmPassword);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={40} color="#003366" />
            <Text style={styles.logoText}>Beemji Builders</Text>
          </View>
          <Text style={styles.subtitle}>Join your construction team</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Username */}
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => updateFormData('username', text)}
            placeholder="john_smith"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          {/* Email */}
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            placeholder="john.smith@company.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone */}
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text.replace(/[^0-9]/g, ''))}
            placeholder="1234567890 (10-15 digits)"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={15}
          />

          {/* Role Selection */}
          <Text style={styles.label}>Role *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleOption,
                  formData.role === role.value && styles.selectedRole
                ]}
                onPress={() => updateFormData('role', role.value)}
              >
                <Ionicons 
                  name={role.icon} 
                  size={20} 
                  color={formData.role === role.value ? '#fff' : '#003366'} 
                />
                <Text style={[
                  styles.roleText,
                  formData.role === role.value && styles.selectedRoleText
                ]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Employee ID */}
          <Text style={styles.label}>Employee ID</Text>
          <TextInput
            style={styles.input}
            value={formData.employee_id}
            onChangeText={(text) => updateFormData('employee_id', text)}
            placeholder="EMP001"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />

          {/* Department */}
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            value={formData.department}
            onChangeText={(text) => updateFormData('department', text)}
            placeholder="Construction"
            placeholderTextColor="#999"
          />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={[
            styles.passwordContainer,
            formData.confirmPassword && !passwordMatch && styles.passwordMismatch
          ]}>
            <TextInput
              style={styles.passwordInput}
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
            {formData.confirmPassword ? (
              <Ionicons 
                name={passwordMatch ? 'checkmark-circle' : 'close-circle'} 
                size={20} 
                color={passwordMatch ? '#4CAF50' : '#F44336'} 
                style={styles.matchIcon}
              />
            ) : null}
          </View>
          {formData.confirmPassword && !passwordMatch ? (
            <Text style={styles.errorText}>Passwords do not match</Text>
          ) : null}

          {/* Signup Button */}
          <TouchableOpacity
            style={[
              styles.signupButton, 
              (loading || (formData.confirmPassword && !passwordMatch)) && styles.disabledButton
            ]}
            onPress={handleSignup}
            disabled={loading || (formData.confirmPassword && !passwordMatch)}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Account Created!</Text>
            <Text style={styles.successMessage}>
              Welcome to Beemji Builders! Your account has been successfully created.
            </Text>
            <Text style={styles.successSubMessage}>
              Redirecting to login page...
            </Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 140,
  },
  selectedRole: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  roleText: {
    fontSize: 12,
    color: '#003366',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedRoleText: {
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  signupButton: {
    backgroundColor: '#003366',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '600',
  },
  
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  successSubMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#003366',
    marginHorizontal: 3,
  },
  
  // Password validation styles
  passwordMismatch: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  matchIcon: {
    position: 'absolute',
    right: 50,
    top: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 5,
  },
});