import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'https://pillnow-database.onrender.com/api';

interface DecodedToken {
  id: string;
  role?: number;
  email?: string;
  name?: string;
}

export const authService = {
  // Register a new user
  register: async (email: string, password: string, name: string, role: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        name,
        email,
        password,
        role
      });

      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
        // Store the user's role during registration
        if (response.data.user?.role) {
          await AsyncStorage.setItem('userRole', response.data.user.role.toString());
        }
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
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password
      });

      console.log('Full login response:', JSON.stringify(response.data, null, 2));

      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
        
        // Try to get role from response first
        if (response.data.user?.role) {
          console.log('Found role in response:', response.data.user.role);
          await AsyncStorage.setItem('userRole', response.data.user.role.toString());
        } else {
          console.log('No role found in response. Trying JWT token...');
          // Try to extract role from JWT token
          try {
            const decodedToken = jwtDecode<DecodedToken>(response.data.token);
            console.log('Decoded JWT token:', decodedToken);
            if (decodedToken.role) {
              console.log('Found role in JWT token:', decodedToken.role);
              await AsyncStorage.setItem('userRole', decodedToken.role.toString());
            } else {
              console.log('No role found in JWT token either');
            }
          } catch (error) {
            console.error('Error decoding JWT token:', error);
          }
        }
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
      await AsyncStorage.removeItem('userRole');
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/users/reset-password`, { email });
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Get user role from storage
  getUserRole: async () => {
    try {
      // First try to get role from storage
      const role = await AsyncStorage.getItem('userRole');
      console.log('Retrieved role from storage:', role);
      
      if (role) {
        return parseInt(role);
      }
      
      // If not in storage, try to extract from JWT token
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          console.log('Decoded token for role extraction:', decodedToken);
          if (decodedToken.role) {
            console.log('Found role in JWT token:', decodedToken.role);
            // Store it for future use
            await AsyncStorage.setItem('userRole', decodedToken.role.toString());
            return decodedToken.role;
          }
        } catch (error) {
          console.error('Error decoding JWT token for role:', error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}; 