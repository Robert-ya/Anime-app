
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Linking,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { exportWatchlist, importWatchlist } from '@/services/backupService';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleExport = async () => {
    try {
      await exportWatchlist();
      Alert.alert('Success', 'Watchlist exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export watchlist');
    }
  };

  const handleImport = async () => {
    try {
      await importWatchlist();
      Alert.alert('Success', 'Watchlist imported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to import watchlist');
    }
  };

  const openLinkedIn = () => {
    Linking.openURL('https://www.linkedin.com/in/shivamyd');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedText type="title" style={styles.header}>
        Settings
      </ThemedText>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup & Restore</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleExport}>
          <Text style={styles.settingText}>Export Watchlist</Text>
          <Text style={styles.settingDescription}>Save your anime list to device</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleImport}>
          <Text style={styles.settingText}>Import Watchlist</Text>
          <Text style={styles.settingDescription}>Restore from backup file</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingText}>Episode Notifications</Text>
            <Text style={styles.settingDescription}>Get notified about new episodes</Text>
          </View>
          <Switch value={true} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingText}>Airing Reminders</Text>
            <Text style={styles.settingDescription}>Alerts for upcoming anime</Text>
          </View>
          <Switch value={true} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={openLinkedIn}>
          <Text style={styles.settingText}>Developer</Text>
          <Text style={styles.versionText}>Shivam Yadav</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#2e51a2',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e51a2',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});
