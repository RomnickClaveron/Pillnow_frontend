import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation(); // Ensure navigation is available
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState(""); // Added fullname state
  const [type_id, setTypeId] = useState(""); // Added type_id state
  const [loading, setLoading] = useState(false); // Added loading state

  const handleCreate = async () => {
    if (!fullname || !username || !password || !type_id) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      setLoading(true);
      await AsyncStorage.removeItem("token"); // Clear old token before login

      const response = await axios.post("https://devapi-618v.onrender.com/api/auth/register", {
        fullname,
        username,
        password,
        type_id
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen"); // Navigate to Login screen after successful registration
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an Account</Text>

        <TextInput 
          placeholder="Full Name" 
          style={styles.input} 
          value={fullname} 
          onChangeText={setFullname} 
          placeholderTextColor="#888"
        />

        <TextInput 
          placeholder="Username" 
          style={styles.input} 
          value={username} 
          onChangeText={setUsername} 
          placeholderTextColor="#888"
        />

        <TextInput 
          placeholder="Password" 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          placeholderTextColor="#888"
        />

        <TextInput 
          placeholder="Type ID" 
          style={styles.input} 
          value={type_id} 
          onChangeText={setTypeId} 
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
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
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F3F4F6" },
  card: { backgroundColor: "white", borderRadius: 30, padding: 40, elevation: 8, alignItems: "center", width: "100%" },
  title: { fontSize: 26, fontWeight: "bold", color: "#D14A99", marginBottom: 25, textAlign: "center" }, // Pink color for title
  input: { 
    width: "100%", 
    height: 55, 
    borderColor: "#E4E7EB", 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingLeft: 18, 
    marginBottom: 18, 
    fontSize: 16, 
    backgroundColor: "#FAFAFA",
    color: "#0000FF" // Ensures user-typed text appears in blue
  },
  button: { 
    backgroundColor: "#4A90E2", 
    paddingVertical: 15, 
    borderRadius: 12, 
    width: "100%", 
    alignItems: "center", 
    marginTop: 15 
  },
  buttonText: { fontSize: 18, color: "white", fontWeight: "bold" },
});

export default LoginScreen;
