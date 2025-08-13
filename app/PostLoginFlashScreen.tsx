import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './styles/theme';
import { authService } from '../src/services/authService';

const PostLoginFlashScreen = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Start the fade and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate to the appropriate dashboard based on user role after 2 seconds
    const timer = setTimeout(async () => {
      try {
        const userRole = await authService.getUserRole();
        
        // Redirect based on role: 2 = Elder, 3 = Caregiver
        if (userRole === 2) {
          router.replace('/ElderDashboard');
        } else if (userRole === 3) {
          router.replace('/CaregiverDashboard');
        } else {
          // If role is not available, show an alert and redirect to roles page
          console.warn('User role not found, redirecting to roles selection');
          router.replace('/Roles');
        }
      } catch (error) {
        console.error('Error getting user role:', error);
        // Fallback to roles page if there's an error
        router.replace('/Roles');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Text style={[styles.welcomeText, { color: theme.primary }]}>Welcome Back!</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>Loading your dashboard...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
  },
});

export default PostLoginFlashScreen;