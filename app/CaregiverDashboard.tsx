import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MedicationNotification from './components/MedicationNotification';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './styles/theme';

const CaregiverDashboard: React.FC = () => {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleShowNotification = () => {
    setShowNotification(true);
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Modal
        visible={showNotification}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDismissNotification}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <MedicationNotification
              medicineName="Losartan"
              containerId={1}
              scheduledTime="08:00 AM"
              onDismiss={handleDismissNotification}
            />
          </View>
        </View>
      </Modal>

      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/Roles')}
        >
          <Ionicons name="arrow-back" size={30} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.secondary }]}>
          WELCOME TO, <Text style={[styles.highlight, { color: theme.primary }]}>PILLNOW</Text>
        </Text>
      </View>

      {/* Logo */}
      <Image source={require('@/assets/images/pill.png')} style={styles.pillImage} />

      {/* Icons Row */}
      <View style={[styles.iconList, { backgroundColor: theme.card }]}>
        <View style={styles.iconRow}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]} 
            onPress={() => router.push('/BluetoothScreen')}
          >
            <Ionicons name="bluetooth" size={30} color={theme.text} />
            <Text style={[styles.iconLabel, { color: theme.text }]}>Bluetooth</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]} 
            onPress={() => router.push('/NotificationScreen')}
          >
            <Ionicons name="notifications" size={30} color={theme.text} />
            <Text style={[styles.iconLabel, { color: theme.text }]}>Notifications</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]} 
            onPress={handleShowNotification}
          >
            <Ionicons name="alarm" size={30} color={theme.text} />
            <Text style={[styles.iconLabel, { color: theme.text }]}>Test Alarm</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]} 
            onPress={() => router.push('/LocationScreen')}
          >
            <Ionicons name="location" size={30} color={theme.text} />
            <Text style={[styles.iconLabel, { color: theme.text }]}>Locate Box</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Title */}
      <Text style={[styles.subtitle, { color: theme.secondary }]}>CAREGIVER'S DASHBOARD</Text>

      {/* Dashboard Buttons */}
      <View style={styles.buttonColumn}>
        <TouchableOpacity 
          style={[styles.dashboardButton, styles.profileButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/EldersProf')}
        >
          <Ionicons name="information-circle" size={24} color={theme.card} />
          <Text style={[styles.buttonText, { color: theme.card }]}>INPUT ELDER'S PROFILE</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.dashboardButton, styles.monitorButton, { backgroundColor: theme.secondary }]}
          onPress={() => router.push('/MonitorManageScreen')}
        >
          <Ionicons name="desktop" size={24} color={theme.card} />
          <Text style={[styles.buttonText, { color: theme.card }]}>MONITOR & MANAGE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 40,
    padding: 15,
    borderRadius: 15,
    elevation: 8,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  highlight: {
    color: '#4A90E2',
  },
  pillImage: {
    width: 90,
    height: 90,
    marginVertical: 20,
  },
  iconList: {
    width: '90%',
    marginVertical: 20,
    padding: 15,
    borderRadius: 15,
    elevation: 5,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  iconButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
    elevation: 3,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  buttonColumn: {
    width: '100%',
    paddingHorizontal: 20,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    textAlign: 'center',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 25,
    padding: 30,
    elevation: 5,
  },
});

export default CaregiverDashboard;
