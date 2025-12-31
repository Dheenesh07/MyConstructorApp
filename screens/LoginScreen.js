import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import StyledTextInput from '../components/StyledTextInput';
import api, { authAPI } from "../utils/api";
import { getRoleDisplayInfo, getDashboardRoute } from "../utils/rolePermissions";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;
export default function BeemjiLogin({ navigation }) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      const { user, access, refresh } = response.data;
      
      await AsyncStorage.setItem("access", access);
      if (refresh) await AsyncStorage.setItem("refresh", refresh);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Verify token was saved
      const savedToken = await AsyncStorage.getItem("access");
      console.log('✅ Token saved successfully:', savedToken ? 'YES' : 'NO');

      const dashboardRoute = getDashboardRoute(user.role);
      if (dashboardRoute) {
        navigation.replace(dashboardRoute);
      } else {
        Alert.alert("Error", "Invalid user role");
      }
    } catch (error) {
      let errorMsg = "Unable to login. Please try again.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMsg = errorData.non_field_errors.join(', ');
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.username) {
          errorMsg = `Username: ${errorData.username[0]}`;
        } else if (errorData.password) {
          errorMsg = `Password: ${errorData.password[0]}`;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else {
          errorMsg = JSON.stringify(errorData);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo */}
        <Image 
          source={require('../assets/beemji logo ai.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Beemji Builders</Text>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <StyledTextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
            <StyledTextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isWeb && <Text style={styles.footer}>Empowering Construction with Precision</Text>}
      {isWeb && <Text style={styles.webFooter}>Empowering Construction with Precision</Text>}

    </View>
  );
}

/* ✅ STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isWeb ? 50 : 30,
    paddingVertical: 40,
    maxWidth: isWeb ? 420 : '90%',
    width: '100%',
  },
  logo: {
    width: isWeb ? 180 : (isMobile ? 280 : 320),
    height: isWeb ? 180 : (isMobile ? 280 : 320),
    marginBottom: isWeb ? 10 : -40,
  },
  title: {
    fontSize: isWeb ? 28 : 32,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 25,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#003366",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#003366",
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#004AAD",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#004AAD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    color: "#999",
    fontSize: 11,
    textAlign: "center",
  },
  webFooter: {
    color: "#999",
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#004AAD",
    fontWeight: "600",
  },
});
