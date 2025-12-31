import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing, Image, Text, StyleSheet } from 'react-native';

export default function LoadingSpinner({ text = 'Loading...', size = 20 }) {
  const shineValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shineValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const opacity = shineValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/beemji logo ai.png')}
        style={[styles.logo, { width: size, height: size, opacity }]}
      />
      <Text style={styles.companyName}>BHEEMJI ENTERPRISE</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    letterSpacing: 1,
  },
  text: {
    color: '#003366',
    fontWeight: '600',
  },
});