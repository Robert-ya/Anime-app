import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import SearchScreen from '@/components/SearchScreen';

export default function HomeScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Text style={styles.splashTitle}>Anime Watchlist</Text>
        <Text style={styles.splashSubtitle}>Proudly made by Shivam Yadav</Text>
      </Animated.View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SearchScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e51a2',
    marginBottom: 12,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});