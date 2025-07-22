import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './styles/theme';
import { bluetoothService } from '../src/services/bluetoothService';
import { Device } from 'react-native-ble-plx';

const BluetoothScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('BluetoothScreen mounted');
    // Set up connection callback
    bluetoothService.setConnectionCallback((connected) => {
      console.log('Connection callback received:', connected);
      setIsConnected(connected);
      setDebugInfo(prev => prev + `\nConnection state changed: ${connected}`);
    });

    // Clean up on unmount
    return () => {
      console.log('BluetoothScreen unmounted');
      bluetoothService.setConnectionCallback(() => {});
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setDevices([]);
    await scanForDevices();
    setRefreshing(false);
  };

  const scanForDevices = async () => {
    console.log('Starting device scan');
    setDebugInfo(prev => prev + '\nStarting device scan');
    setIsScanning(true);
    try {
      await bluetoothService.scanForDevice((device) => {
        if (device) {
          setDevices(prevDevices => {
            // Check if device already exists in the list
            const exists = prevDevices.some(d => d.id === device.id);
            if (!exists) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
          console.log('Device found:', device.name);
          setDebugInfo(prev => prev + `\nDevice found: ${device.name}`);
        }
      });
    } catch (error) {
      console.error('Scan error:', error);
      setDebugInfo(prev => prev + `\nScan error: ${error}`);
      Alert.alert('Error', 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: Device) => {
    console.log('Connecting to device:', device.name);
    setDebugInfo(prev => prev + `\nConnecting to device: ${device.name}`);
    try {
      await bluetoothService.connectToDevice(device);
      setIsConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
      setDebugInfo(prev => prev + `\nConnection error: ${error}`);
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const handleDisconnect = async () => {
    console.log('Disconnecting from device');
    setDebugInfo(prev => prev + '\nDisconnecting from device');
    try {
      await bluetoothService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnection error:', error);
      setDebugInfo(prev => prev + `\nDisconnection error: ${error}`);
      Alert.alert('Error', 'Failed to disconnect from device');
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={[styles.deviceItem, { backgroundColor: theme.card }]}
      onPress={() => handleConnect(item)}
      disabled={isConnected}
    >
      <Ionicons name="bluetooth" size={24} color={theme.primary} />
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: theme.text }]}>
          {item.name || 'Unknown Device'}
        </Text>
        <Text style={[styles.deviceId, { color: theme.textSecondary }]}>
          {item.id}
        </Text>
      </View>
      {isConnected && (
        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={30} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.secondary }]}>
          BLUETOOTH <Text style={[styles.highlight, { color: theme.primary }]}>DEVICES</Text>
        </Text>
      </View>

      {/* Device List */}
      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={(item) => item.id}
        style={styles.deviceList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {isScanning ? 'Scanning for devices...' : 'No devices found'}
            </Text>
          </View>
        }
      />

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: theme.card }]}>
        <Text style={[styles.statusText, { color: theme.text }]}>
          {isScanning ? 'Scanning...' : isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        {isConnected && (
          <TouchableOpacity
            style={[styles.disconnectButton, { backgroundColor: theme.warning }]}
            onPress={handleDisconnect}
          >
            <Text style={[styles.buttonText, { color: theme.card }]}>DISCONNECT</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug Info */}
      <View style={[styles.debugContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.debugText, { color: theme.text }]}>
          Debug Info:
          {debugInfo}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  deviceList: {
    flex: 1,
    width: '100%',
    marginTop: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    maxHeight: 200,
  },
  debugText: {
    fontSize: 12,
  },
});

export default BluetoothScreen;