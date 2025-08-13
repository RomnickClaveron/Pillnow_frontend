import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import { lightTheme, darkTheme } from "./styles/theme";
import { authService } from "../src/services/authService";

const CreateScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<number>(2); // Default to elder (2)
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      setLoading(true);
      
      // Use the auth service for registration
      const result = await authService.register(email, password, name, role);
      
      Alert.alert("Success", "Account created successfully!");
      router.push("/LoginScreen"); // Navigate to Login screen after successful registration
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card, ...theme.elevation }]}>
        <Text style={[styles.title, { color: theme.secondary }]}>Create an Account</Text>

        <TextInput 
          placeholder="Full Name" 
          style={[styles.input, { 
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.text
          }]} 
          value={name} 
          onChangeText={setName} 
          placeholderTextColor={theme.textSecondary}
        />

        <TextInput 
          placeholder="Email" 
          style={[styles.input, { 
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.text
          }]} 
          value={email} 
          onChangeText={setEmail} 
          placeholderTextColor={theme.textSecondary}
        />

        <TextInput 
          placeholder="Password" 
          style={[styles.input, { 
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.text
          }]} 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          placeholderTextColor={theme.textSecondary}
        />

        {/* Role Selection */}
        <Text style={[styles.roleLabel, { color: theme.text }]}>Select Role:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[
              styles.roleButton, 
              { 
                backgroundColor: role === 1 ? theme.primary : theme.background,
                borderColor: theme.border
              }
            ]} 
            onPress={() => setRole(1)}
          >
            <Text style={[
              styles.roleButtonText, 
              { color: role === 1 ? 'white' : theme.text }
            ]}>Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.roleButton, 
              { 
                backgroundColor: role === 2 ? theme.primary : theme.background,
                borderColor: theme.border
              }
            ]} 
            onPress={() => setRole(2)}
          >
            <Text style={[
              styles.roleButtonText, 
              { color: role === 2 ? 'white' : theme.text }
            ]}>Elder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.roleButton, 
              { 
                backgroundColor: role === 3 ? theme.primary : theme.background,
                borderColor: theme.border
              }
            ]} 
            onPress={() => setRole(3)}
          >
            <Text style={[
              styles.roleButtonText, 
              { color: role === 3 ? 'white' : theme.text }
            ]}>Caregiver</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={handleCreate} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  card: { 
    borderRadius: 30, 
    padding: 40, 
    alignItems: "center", 
    width: "100%" 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 25, 
    textAlign: "center" 
  },
  input: { 
    width: "100%", 
    height: 55, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingLeft: 18, 
    marginBottom: 18, 
    fontSize: 16
  },
  button: { 
    paddingVertical: 15, 
    borderRadius: 12, 
    width: "100%", 
    alignItems: "center", 
    marginTop: 15 
  },
  buttonText: { 
    fontSize: 18, 
    color: "white", 
    fontWeight: "bold" 
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CreateScreen;
