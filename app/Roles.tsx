import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './styles/theme';

const Roles: React.FC = () => {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Define role selection function
  const handleRoleSelection = async (role: "Caregiver" | "Elder") => {
    if (role === "Caregiver") {
      router.push("/CaregiverDashboard");
    } else {
      router.push("/ElderDashboard");
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await AsyncStorage.removeItem("token");
      router.replace("/LoginScreen");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.card }]} 
          onPress={toggleTheme}
        >
          <Text style={[styles.themeToggleText, { color: theme.text }]}>
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.error }]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.card, ...theme.elevation }]}>
          <Text style={[styles.title, { color: theme.secondary }]}>Welcome to PILLNOW!</Text>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Select Your Role</Text>

          <TouchableOpacity
            style={[
              styles.roleButton, 
              styles.caregiverButton,
              { backgroundColor: theme.primary }
            ]}
            onPress={() => handleRoleSelection("Caregiver")}
          >
            <Text style={styles.roleButtonText}>CAREGIVER</Text>
            <Text style={styles.buttonIcon}>▶</Text>
          </TouchableOpacity>
          <Text style={[styles.orText, { color: theme.textSecondary }]}>or</Text>
          <TouchableOpacity
            style={[
              styles.roleButton, 
              styles.elderButton,
              { backgroundColor: theme.secondary }
            ]}
            onPress={() => handleRoleSelection("Elder")}
          >
            <Text style={styles.roleButtonText}>ELDER</Text>
            <Text style={styles.buttonIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    position: 'absolute',
    top: 80,
    zIndex: 1,
  },
  themeToggle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 30,
    padding: 40,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
  },
  roleButton: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    width: "85%",
    alignItems: "center",
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caregiverButton: {
    backgroundColor: "#4A90E2",
  },
  elderButton: {
    backgroundColor: "#FF69B4",
  },
  roleButtonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 20,
    color: "white",
    width: 20,
    textAlign: 'center',
  },
  orText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 15,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default Roles;
