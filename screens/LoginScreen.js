import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import api, { authAPI } from "../utils/api";
import { getRoleDisplayInfo, getDashboardRoute } from "../utils/rolePermissions";
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function BeemjiLogin({ navigation }) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      const dashboardRoute = getDashboardRoute(user.role);
      if (dashboardRoute) {
        navigation.replace(dashboardRoute);
      } else {
        Alert.alert("Error", "Invalid user role");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        Alert.alert("Login Error", "Invalid username or password");
      } else {
        Alert.alert("Login Error", "Unable to connect to server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* ✅ Animated Ashoka Chakra */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg height="150" width="150" viewBox="0 0 120 120">
          <Circle cx="60" cy="60" r="50" stroke="#004AAD" strokeWidth="3" fill="none" />

          {[...Array(24)].map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x1 = 60 + 5 * Math.cos(angle);
            const y1 = 60 + 5 * Math.sin(angle);
            const x2 = 60 + 45 * Math.cos(angle);
            const y2 = 60 + 45 * Math.sin(angle);

            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#004AAD"
                strokeWidth="1.5"
              />
            );
          })}

          <Circle cx="60" cy="60" r="4" fill="#004AAD" />
        </Svg>
      </Animated.View>

      {/* ✅ Title */}
      <Text style={styles.title}>Beemji Builders</Text>

      {/* ✅ Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      {/* ✅ Login Button */}
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

      <Text style={styles.footer}>Empowering Construction with Precision</Text>
      

    </View>
  );
}

/* ✅ STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#003366",
    marginTop: 15,
  },
  inputContainer: {
    width: "80%",
    marginTop: 30,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dce3f0",
    fontSize: 16,
    color: "#003366",
  },
  button: {
    backgroundColor: "#004AAD",
    paddingVertical: 14,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    color: "#666",
    fontSize: 14,
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
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
