import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.pillnow.com/api';

export const authService = {
  // Register a new user
  register: async (email: string, password: string, displayName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        fullname: displayName
      });

      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { email });
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: token }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
}; 