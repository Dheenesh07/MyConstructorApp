import React, { useState } from 'react';
import {
  View,
  Text,
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
import StyledTextInput from '../components/StyledTextInput';
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
    role: '',
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
    // Prevent double submission
    if (loading) return;
    
    // Check password match
    if (formData.confirmPassword && !passwordMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Validation
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.role) {
      Alert.alert('Error', 'Please fill all required fields including role selection');
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
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim(),
        employee_id: formData.employee_id.trim() || `EMP${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`,
        department: formData.department.trim() || 'Construction'
      };
      
      console.log('📤 Sending signup request:', {
        url: 'https://construct.velandev.in/api/auth/signup/',
        data: { ...signupData, password: '***' }
      });
      
      const response = await authAPI.register(signupData);
      
      console.log('✅ Signup successful:', response.data);
      
      // Show success modal
      setSuccessModalVisible(true);
      
      // Auto-navigate after 3 seconds
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.navigate('Login');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Signup error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code
      });
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Network error
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      // Timeout error
      else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      }
      // Server errors
      else if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 500) {
          if (typeof data === 'string' && data.includes('IntegrityError')) {
            errorMessage = 'Username or email already exists. Please use different credentials.';
          } else {
            errorMessage = 'Server error. Please try again later.';
          }
        } else if (status === 400) {
          // Handle validation errors
          if (typeof data === 'object') {
            if (data.username) {
              errorMessage = `Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`;
            } else if (data.email) {
              errorMessage = `Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
            } else if (data.phone) {
              errorMessage = `Phone: ${Array.isArray(data.phone) ? data.phone[0] : data.phone}`;
            } else if (data.password) {
              errorMessage = `Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else {
              // Combine all field errors
              const errors = Object.entries(data)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
                .join('\n');
              errorMessage = errors || 'Invalid data. Please check your inputs.';
            }
          } else if (typeof data === 'string') {
            errorMessage = data;
          }
        } else if (status === 404) {
          errorMessage = 'Signup endpoint not found. Please contact support.';
        } else {
          errorMessage = `Error ${status}: ${data?.detail || data?.message || 'Please try again.'}`;
        }
      }
      
      Alert.alert('Signup Failed', errorMessage);
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
          <StyledTextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => updateFormData('username', text)}
            placeholder="john_smith"
            autoCapitalize="none"
          />

          {/* Email */}
          <Text style={styles.label}>Email Address *</Text>
          <StyledTextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            placeholder="john.smith@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone */}
          <Text style={styles.label}>Phone Number *</Text>
          <StyledTextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text.replace(/[^0-9]/g, ''))}
            placeholder="1234567890 (10-15 digits)"
            keyboardType="phone-pad"
            maxLength={15}
          />

          {/* Role Selection */}
          <Text style={styles.label}>Select Your Role *</Text>
          {!formData.role && (
            <Text style={styles.roleHint}>Tap to select your role</Text>
          )}
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
          <StyledTextInput
            style={styles.input}
            value={formData.employee_id}
            onChangeText={(text) => updateFormData('employee_id', text)}
            placeholder="EMP001 (auto-generated if empty)"
            autoCapitalize="characters"
          />

          {/* Department */}
          <Text style={styles.label}>Department</Text>
          <StyledTextInput
            style={styles.input}
            value={formData.department}
            onChangeText={(text) => updateFormData('department', text)}
            placeholder="Construction (auto-generated if empty)"
          />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordContainer}>
            <StyledTextInput
              style={styles.passwordInput}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Minimum 6 characters"
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
            <StyledTextInput
              style={styles.passwordInput}
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              placeholder="Re-enter your password"
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
            activeOpacity={0.7}
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  roleHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
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
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
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