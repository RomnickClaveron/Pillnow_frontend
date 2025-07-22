import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

class BluetoothService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private readonly SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB';
  private readonly CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB';
  private isMockMode = false;
  private isConnected = false;
  private isScanning = false;
  private connectionCallback: ((connected: boolean) => void) | null = null;

  constructor() {
    console.log('BluetoothService constructor called');
    try {
      this.initializeManager();
      console.log('BluetoothService initialized successfully');
    } catch (error) {
      console.warn('Bluetooth initialization failed, switching to mock mode:', error);
      this.isMockMode = true;
    }
  }

  private initializeManager() {
    console.log('Initializing BleManager');
    this.manager = new BleManager({
      restoreStateIdentifier: 'PillNowBluetooth',
      restoreStateFunction: (restoredState) => {
        console.log('Restored state:', restoredState);
      }
    });
    console.log('BleManager initialized');
  }

  async requestPermissions(): Promise<boolean> {
    console.log('Requesting permissions');
    if (Platform.OS === 'android') {
      try {
        // Request all required permissions at once
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ];

        console.log('Requesting all permissions');
        const results = await PermissionsAndroid.requestMultiple(permissions);
        console.log('Permission results:', results);
        
        // Check if all permissions were granted
        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          console.log('Some permissions were not granted:', results);
          Alert.alert(
            'Permissions Required',
            'Please grant all required permissions to use Bluetooth features',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  // Open app settings to manually grant permissions
                  if (Platform.OS === 'android') {
                    PermissionsAndroid.requestMultiple(permissions);
                  }
                }
              },
              { text: 'Cancel' }
            ]
          );
          return false;
        }

        console.log('All permissions granted');
        return true;
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert('Error', 'Failed to request permissions');
        return false;
      }
    }
    console.log('Not Android, skipping permission requests');
    return true;
  }

  async checkBluetoothState(): Promise<boolean> {
    console.log('Checking Bluetooth state');
    if (!this.manager) {
      console.error('Bluetooth manager not initialized');
      Alert.alert('Error', 'Bluetooth manager not initialized');
      return false;
    }

    try {
      const state = await this.manager.state();
      console.log('Current Bluetooth state:', state);
      if (state !== State.PoweredOn) {
        console.log('Bluetooth is not powered on');
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth to scan for devices',
          [{ text: 'OK' }]
        );
        return false;
      }
      console.log('Bluetooth is powered on');
      return true;
    } catch (error) {
      console.error('Bluetooth state check error:', error);
      Alert.alert('Error', 'Failed to check Bluetooth state');
      return false;
    }
  }

  async scanForDevice(onDeviceFound?: (device: Device) => void): Promise<void> {
    console.log('Starting device scan');
    if (this.isMockMode) {
      console.log('Mock mode: Scanning for devices');
      return;
    }

    if (this.isScanning) {
      console.log('Already scanning for devices');
      return;
    }

    try {
      if (!this.manager) {
        console.error('Bluetooth manager not initialized');
        throw new Error('Bluetooth manager not initialized');
      }

      // Check and request permissions
      console.log('Checking permissions');
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('Permissions not granted');
        throw new Error('Bluetooth permissions not granted');
      }

      // Check Bluetooth state
      console.log('Checking Bluetooth state');
      const isBluetoothOn = await this.checkBluetoothState();
      if (!isBluetoothOn) {
        console.error('Bluetooth is not enabled');
        throw new Error('Bluetooth is not enabled');
      }

      this.isScanning = true;
      console.log('Starting device scan...');

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.isScanning = false;
          Alert.alert('Scan Error', error.message);
          return;
        }

        console.log('Device found:', device?.name);
        if (device?.name?.includes('PillNow') || device?.localName?.includes('PillNow')) {
          console.log('Found PillNow device:', device.name);
          this.manager?.stopDeviceScan();
          this.isScanning = false;
          
          if (onDeviceFound) {
            console.log('Calling onDeviceFound callback');
            onDeviceFound(device);
          } else {
            console.log('Connecting to device');
            this.connectToDevice(device);
          }
        }
      });

      // Stop scanning after 30 seconds
      setTimeout(() => {
        if (this.isScanning) {
          console.log('Scan timeout reached');
          this.manager?.stopDeviceScan();
          this.isScanning = false;
          Alert.alert('Scan Timeout', 'No PillNow device found');
        }
      }, 30000);
    } catch (error) {
      console.error('Scan error:', error);
      this.isScanning = false;
      this.isMockMode = true;
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to scan for devices');
    }
  }

  async connectToDevice(device: Device): Promise<void> {
    console.log('Connecting to device:', device.name);
    if (this.isMockMode) {
      console.log('Mock mode: Connected to device');
      this.isConnected = true;
      if (this.connectionCallback) {
        this.connectionCallback(true);
      }
      return;
    }

    try {
      console.log('Attempting to connect...');
      this.device = await device.connect();
      console.log('Connected to device:', device.name);
      
      console.log('Discovering services and characteristics...');
      await this.device.discoverAllServicesAndCharacteristics();
      console.log('Services and characteristics discovered');
      
      // Monitor connection state
      this.device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device?.name);
        this.device = null;
        this.isConnected = false;
        if (this.connectionCallback) {
          this.connectionCallback(false);
        }
        Alert.alert('Disconnected', 'Device disconnected');
      });

      this.isConnected = true;
      if (this.connectionCallback) {
        console.log('Calling connection callback with true');
        this.connectionCallback(true);
      }
      Alert.alert('Connected', 'Successfully connected to device');
    } catch (error) {
      console.error('Connection error:', error);
      this.isMockMode = true;
      this.isConnected = false;
      if (this.connectionCallback) {
        console.log('Calling connection callback with false');
        this.connectionCallback(false);
      }
      Alert.alert('Connection Error', error instanceof Error ? error.message : 'Failed to connect to device');
    }
  }

  setConnectionCallback(callback: (connected: boolean) => void) {
    this.connectionCallback = callback;
  }

  async sendCommand(command: string): Promise<boolean> {
    if (this.isMockMode) {
      console.log('Mock mode: Sending command:', command);
      return true;
    }

    try {
      if (!this.device || !this.isConnected) {
        throw new Error('No device connected');
      }

      const service = await this.device.discoverAllServicesAndCharacteristics();
      const characteristic = await service.characteristicsForService(this.SERVICE_UUID);
      
      if (!characteristic) {
        throw new Error('Characteristic not found');
      }

      await this.device.writeCharacteristicWithResponseForService(
        this.SERVICE_UUID,
        this.CHARACTERISTIC_UUID,
        command
      );
      return true;
    } catch (error) {
      console.error('Command sending error:', error);
      this.isMockMode = true;
      return false;
    }
  }

  async disconnect() {
    if (this.isMockMode) {
      console.log('Mock mode: Disconnected');
      this.isConnected = false;
      if (this.connectionCallback) {
        this.connectionCallback(false);
      }
      return;
    }

    try {
      if (this.device) {
        await this.device.cancelConnection();
        this.device = null;
        this.isConnected = false;
        if (this.connectionCallback) {
          this.connectionCallback(false);
        }
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Trigger alarm (buzzer and LED)
  async triggerAlarm(): Promise<boolean> {
    if (this.isMockMode) {
      console.log('Mock mode: Alarm triggered');
      return true;
    }

    try {
      return await this.sendCommand('ALARM_ON');
    } catch (error) {
      console.error('Trigger alarm error:', error);
      this.isMockMode = true;
      return false;
    }
  }

  // Stop alarm
  async stopAlarm(): Promise<boolean> {
    if (this.isMockMode) {
      console.log('Mock mode: Alarm stopped');
      return true;
    }

    try {
      return await this.sendCommand('ALARM_OFF');
    } catch (error) {
      console.error('Stop alarm error:', error);
      this.isMockMode = true;
      return false;
    }
  }

  // Send SMS via SIM800L
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (this.isMockMode) {
      console.log(`Mock mode: SMS sent to ${phoneNumber} - ${message}`);
      return true;
    }

    try {
      const command = `SMS:${phoneNumber}:${message}`;
      return await this.sendCommand(command);
    } catch (error) {
      console.error('Send SMS error:', error);
      this.isMockMode = true;
      return false;
    }
  }
}

export const bluetoothService = new BluetoothService(); 