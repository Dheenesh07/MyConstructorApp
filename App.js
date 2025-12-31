import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AppNavigator from "./navigation/AppNavigator";
import LoadingSpinner from './components/LoadingSpinner';
import 'react-native-gesture-handler';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Loading Beemji Builders..." size={400} />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f9fc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
