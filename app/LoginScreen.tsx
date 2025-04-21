import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import PostLoginFlashScreen from "./PostLoginFlashScreen";
import { useTheme } from "./context/ThemeContext";
import { lightTheme, darkTheme } from "./styles/theme";

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPostLoginFlash, setShowPostLoginFlash] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleLogin = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("token"); // Clear previous token

      const response = await axios.post("https://devapi-618v.onrender.com/api/auth/login", {
        username,
        password,
      });

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
        console.log("Login successful. Token saved:", response.data.token);
        setShowPostLoginFlash(true);
      } else {
        Alert.alert("Login Failed", "Invalid username or password");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (showPostLoginFlash) {
    return <PostLoginFlashScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.card, ...theme.elevation }]}>
          <Text style={[styles.title, { color: theme.secondary }]}>Welcome to PILLNOW</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text
            }]}
            placeholder="Username"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text
            }]}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push("/RegisterScreen")}
          >
            <Text style={[styles.registerText, { color: theme.primary }]}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 30,
    padding: 40,
    elevation: 8,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  input: { 
    width: "100%",
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingLeft: 18,
    marginBottom: 18,
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
